import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import GameStats from "@/lib/models/game-stats"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { opponentName, gameLevel, userScore, opponentScore, wonByQuestion, selectedCard } = body

    await connectDB()

    // Calculate overall game score
    const overallGameScore = userScore > opponentScore ? 1 : 0

    const gameStats = new GameStats({
      userId: session.user.id,
      opponentName,
      gameLevel,
      userScore,
      opponentScore,
      overallGameScore,
      wonByQuestion,
    })

    await gameStats.save()

    // If selectedCard is provided, return a demo multiple choice question
    if (selectedCard) {
      const demoQuestion = {
        id: gameStats._id.toString(),
        question: "What is the capital of France?",
        options: [
          { id: 1, text: "London" },
          { id: 2, text: "Paris" },
          { id: 3, text: "Berlin" },
          { id: 4, text: "Madrid" }
        ],
        correctAnswer: 2
      }
      return NextResponse.json({ success: true, gameStats, question: demoQuestion })
    }

    return NextResponse.json({ success: true, gameStats })
  } catch (error) {
    console.error("Error saving game stats:", error)
    return NextResponse.json(
      { error: "Failed to save game statistics" },
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

    await connectDB()

    const gameStats = await GameStats.find({ userId: session.user.id })
      .sort({ createdAt: -1 })

    return NextResponse.json({ gameStats })
  } catch (error) {
    console.error("Error fetching game stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch game statistics" },
      { status: 500 }
    )
  }
}

// Add PUT method to the existing route handler
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { questionId, selectedOption, gameId } = body

    await connectDB()

    // Find the game stats entry
    const gameStats = await GameStats.findById(gameId)
    if (!gameStats) {
      return NextResponse.json({ error: "Game stats not found" }, { status: 404 })
    }

    // Get the question data from the game stats
    const questionData = gameStats.questionData
    if (!questionData) {
      return NextResponse.json({ error: "Question data not found" }, { status: 404 })
    }

    // Verify the answer by checking if the selected option matches the correct answer
    const isCorrect = selectedOption === questionData.options[questionData.correctAnswer - 1].text

    if (isCorrect) {
      // Update the game stats
      gameStats.overallGameScore = 1
      gameStats.wonByQuestion = true
      await gameStats.save()

      return NextResponse.json({ 
        success: true, 
        correct: true,
        message: "Correct answer! Game stats updated successfully."
      })
    }

    return NextResponse.json({ 
      success: true, 
      correct: false,
      message: "Incorrect answer."
    })
  } catch (error) {
    console.error("Error verifying answer:", error)
    return NextResponse.json(
      { error: "Failed to verify answer" },
      { status: 500 }
    )
  }
} 