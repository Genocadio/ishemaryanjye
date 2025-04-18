import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import GameStats from "@/lib/models/game-stats"
import questionsData from "@/lib/data/questions.json"

// Function to shuffle array using Fisher-Yates algorithm
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array]
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]]
  }
  return newArray
}

export async function POST(request: Request) {
  try {
    console.log('Starting game stats save...');
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('Unauthorized game stats save attempt');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { opponentName, gameLevel, userScore, opponentScore, wonByQuestion, selectedCard } = body
    console.log('Received game stats data for user:', session.user.id);

    console.log('Attempting to connect to MongoDB...');
    try {
      await connectDB()
      console.log('Successfully connected to MongoDB');
    } catch (dbError) {
      console.error('MongoDB connection error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 503 }
      );
    }

    // Calculate overall game score
    const overallGameScore = userScore > opponentScore ? 1 : 0

    console.log('Creating new game stats entry...');
    const gameStats = new GameStats({
      userId: session.user.id,
      opponentName,
      gameLevel,
      userScore,
      opponentScore,
      overallGameScore,
      wonByQuestion,
      questionId: null
    })

    try {
      await gameStats.save()
      console.log('Game stats saved successfully');
    } catch (saveError) {
      console.error('Error saving game stats:', saveError);
      return NextResponse.json(
        { error: 'Failed to save game statistics' },
        { status: 500 }
      );
    }

    // If selectedCard is provided, return a random question
    if (selectedCard) {
      console.log('Returning random question for selected card');
      // Shuffle questions and pick one
      const shuffledQuestions = shuffleArray([...questionsData.questions]);
      const selectedQuestion = shuffledQuestions[0];
      
      // Update game stats with question ID
      gameStats.questionId = selectedQuestion.id;
      try {
        await gameStats.save();
        console.log('Question ID saved to game stats');
      } catch (saveError) {
        console.error('Error saving question ID:', saveError);
      }

      return NextResponse.json({ 
        success: true, 
        gameStats, 
        question: {
          id: selectedQuestion.id,
          question: selectedQuestion.question,
          options: selectedQuestion.options,
          correctAnswer: selectedQuestion.correctAnswer
        }
      });
    }

    return NextResponse.json({ success: true, gameStats });
  } catch (error) {
    console.error("Error saving game stats:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Failed to save game statistics" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Shuffle questions and select 5 random ones
    const shuffledQuestions = shuffleArray(questionsData.questions)
    const selectedQuestions = shuffledQuestions.slice(0, 5)

    return NextResponse.json({ questions: selectedQuestions })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    console.log('Starting game stats update...');
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('Unauthorized game stats update attempt');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { questionId, selectedOption, gameId } = body
    console.log('Received update data for game:', gameId);

    console.log('Attempting to connect to MongoDB...');
    try {
      await connectDB()
      console.log('Successfully connected to MongoDB');
    } catch (dbError) {
      console.error('MongoDB connection error:', dbError);
      return NextResponse.json(
        { error: 'Database connection failed. Please try again later.' },
        { status: 503 }
      );
    }

    // Find the game stats entry
    console.log('Looking up game stats:', gameId);
    const gameStats = await GameStats.findOne({ _id: gameId });
    console.log('Found game stats:', gameStats);
    
    if (!gameStats) {
      console.log('Game stats not found:', gameId);
      return NextResponse.json({ error: "Game stats not found" }, { status: 404 })
    }

    // Get the question data from the questions array
    const question = questionsData.questions.find(q => q.id === gameStats.questionId);
    if (!question) {
      console.log('Question not found for ID:', gameStats.questionId);
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    // Verify the answer
    const isCorrect = Array.isArray(question.correctAnswer)
      ? selectedOption.every((option: string) => question.correctAnswer.includes(option))
      : question.correctAnswer === selectedOption[0];

    if (isCorrect) {
      console.log('Correct answer for game:', gameId);
      // Update the game stats
      gameStats.overallGameScore = 1;
      gameStats.wonByQuestion = true;
      try {
        await gameStats.save();
        console.log('Game stats updated successfully');
      } catch (saveError) {
        console.error('Error updating game stats:', saveError);
        return NextResponse.json(
          { error: 'Failed to update game statistics' },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        success: true, 
        correct: true,
        message: "Correct answer! Game stats updated successfully."
      });
    }

    console.log('Incorrect answer for game:', gameId);
    return NextResponse.json({ 
      success: true, 
      correct: false,
      message: "Incorrect answer."
    });
  } catch (error) {
    console.error("Error verifying answer:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Failed to verify answer" },
      { status: 500 }
    );
  }
} 