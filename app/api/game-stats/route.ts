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

// Did you know tips
const didYouKnowTips = [
  "Did you know that consent is an ongoing process and can be withdrawn at any time?",
  "Did you know that gender equality in education leads to better health outcomes for everyone?",
  "Did you know that open communication about sexual health helps prevent STIs and unwanted pregnancies?",
  "Did you know that respecting different sexual orientations and gender identities promotes mental well-being?",
  "Did you know that equal access to reproductive health services is a fundamental human right?"
]

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { selectedCard } = body

    // If a card is selected, return a random question regardless of login status
    if (selectedCard) {
      const shuffledQuestions = shuffleArray([...questionsData.questions])
      const selectedQuestion = shuffledQuestions[0]
      
      return NextResponse.json({ 
        success: true, 
        question: {
          id: selectedQuestion.id,
          question: selectedQuestion.question,
          options: selectedQuestion.options,
          correctAnswer: selectedQuestion.correctAnswer
        }
      })
    }

    // If no card is selected, return a random did you know tip
    const randomTip = didYouKnowTips[Math.floor(Math.random() * didYouKnowTips.length)]
    
    // If user is logged in, save game stats
    if (session?.user?.id) {
      const { opponentName, gameLevel, userScore, opponentScore, wonByQuestion } = body
      
      try {
        await connectDB()
        
        const overallGameScore = userScore > opponentScore ? 1 : 0
        
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

        await gameStats.save()
        
        return NextResponse.json({ 
          success: true, 
          gameStats,
          didYouKnow: randomTip
        })
      } catch (error) {
        console.error("Error saving game stats:", error)
        return NextResponse.json(
          { error: "Failed to save game statistics" },
          { status: 500 }
        )
      }
    }

    // For unlogged-in users or when no card is selected, just return the tip
    return NextResponse.json({ 
      success: true, 
      didYouKnow: randomTip
    })
  } catch (error) {
    console.error("Error in game stats endpoint:", error)
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    )
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
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { questionId, selectedOption } = body

    // Find the question in the questions data
    const question = questionsData.questions.find(q => q.id === questionId)
    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 })
    }

    // Verify the answer
    const isCorrect = Array.isArray(question.correctAnswer)
      ? selectedOption.every((option: string) => question.correctAnswer.includes(option))
      : question.correctAnswer === selectedOption[0]

    // For logged-in users, update game stats
    if (session?.user?.id) {
      try {
        await connectDB()
        
        const gameStats = await GameStats.findOne({ _id: body.gameId })
        if (!gameStats) {
          return NextResponse.json({ error: "Game stats not found" }, { status: 404 })
        }

        if (isCorrect) {
          gameStats.overallGameScore = 1
          gameStats.wonByQuestion = true
          await gameStats.save()
        }

        return NextResponse.json({ 
          success: true, 
          correct: isCorrect,
          gameStats: gameStats,
          message: isCorrect ? "Correct answer! Game stats updated successfully." : "Incorrect answer."
        })
      } catch (error) {
        console.error("Error updating game stats:", error)
        return NextResponse.json(
          { error: "Failed to update game statistics" },
          { status: 500 }
        )
      }
    }

    // For non-logged-in users, just return the verification result
    return NextResponse.json({ 
      success: true, 
      correct: isCorrect,
      message: isCorrect ? "Correct answer!" : "Incorrect answer."
    })
  } catch (error) {
    console.error("Error verifying answer:", error)
    return NextResponse.json(
      { error: "Failed to verify answer" },
      { status: 500 }
    )
  }
} 