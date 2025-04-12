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
        const { questionId, selectedOption, gameId } = body

        await connectDB()

        // Find the game stats
        const gameStats = await GameStats.findById(gameId)
        if (!gameStats) {
            return NextResponse.json({ error: "Game not found" }, { status: 404 })
        }

        // Verify the answer (in a real implementation, you would check against the correct answer)
        // For demo purposes, we'll just check if the answer contains "correct"
        const isCorrect = selectedOption.toLowerCase().includes("correct")

        if (isCorrect) {
            // Update the game stats
            gameStats.overallGameScore = 1
            gameStats.wonByQuestion = true
            await gameStats.save()

            return NextResponse.json({ correct: true })
        }

        return NextResponse.json({ correct: false })
    } catch (error) {
        console.error("Error verifying answer:", error)
        return NextResponse.json(
            { error: "Failed to verify answer" },
            { status: 500 }
        )
    }
} 