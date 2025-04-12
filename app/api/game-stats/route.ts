import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import GameStats from "@/lib/models/game-stats"

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

    // If selectedCard is provided, return a demo multiple choice question
    if (selectedCard) {
      console.log('Returning demo question for selected card');
      const demoQuestion = {
        id: gameStats._id.toString(),
        question: "Ibyo ukwiye kwirinda mu gihe cy' ubugimbi n' ubwangavu",
        options: [
          { id: 1, text: "kwirinda ibishuko byakuganisha ku gukora imibonano mpuzabitsina" },
          { id: 2, text: "Ugomba guhitamo ibyiza wakwigira kubandi" },
          { id: 3, text: "Ugomba guhorana n' urungano kugirango rukwigishe imyitwarire iyo ariyo yose." },
          { id: 4, text: "Kwirinda ingeso mbi washorwamo nigitutut cy' urungano" }
        ],
        correctAnswer: 3
      }
      return NextResponse.json({ success: true, gameStats, question: demoQuestion })
    }

    return NextResponse.json({ success: true, gameStats })
  } catch (error) {
    console.error("Error saving game stats:", error)
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Failed to save game statistics" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    console.log('Starting game stats fetch...');
    
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log('Unauthorized game stats fetch attempt');
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

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

    console.log('Fetching game stats for user:', session.user.id);
    const gameStats = await GameStats.find({ userId: session.user.id })
      .sort({ createdAt: -1 })

    console.log('Game stats fetched successfully');
    return NextResponse.json({ gameStats })
  } catch (error) {
    console.error("Error fetching game stats:", error)
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Failed to fetch game statistics" },
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
    const gameStats = await GameStats.findById(gameId)
    if (!gameStats) {
      console.log('Game stats not found:', gameId);
      return NextResponse.json({ error: "Game stats not found" }, { status: 404 })
    }

    // Get the question data from the game stats
    const questionData = gameStats.questionData
    if (!questionData) {
      console.log('Question data not found for game:', gameId);
      return NextResponse.json({ error: "Question data not found" }, { status: 404 })
    }

    // Verify the answer by checking if the selected option matches the correct answer
    const isCorrect = selectedOption === questionData.options[questionData.correctAnswer - 1].text

    if (isCorrect) {
      console.log('Correct answer for game:', gameId);
      // Update the game stats
      gameStats.overallGameScore = 1
      gameStats.wonByQuestion = true
      try {
        await gameStats.save()
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
      })
    }

    console.log('Incorrect answer for game:', gameId);
    return NextResponse.json({ 
      success: true, 
      correct: false,
      message: "Incorrect answer."
    })
  } catch (error) {
    console.error("Error verifying answer:", error)
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: "Failed to verify answer" },
      { status: 500 }
    )
  }
} 