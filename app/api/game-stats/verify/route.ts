import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import connectDB from "@/lib/mongodb"
import GameStats from "@/lib/models/game-stats"

export async function POST(request: Request) {
    try {
        console.log('Starting answer verification...');
        
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            console.log('Unauthorized verification attempt');
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { questionId, selectedOption, gameId } = body
        console.log('Received verification data for game:', gameId);

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

        // Find the game stats
        console.log('Looking up game stats:', gameId);
        const gameStats = await GameStats.findById(gameId)
        if (!gameStats) {
            console.log('Game not found:', gameId);
            return NextResponse.json({ error: "Game not found" }, { status: 404 })
        }

        // Verify the answer (in a real implementation, you would check against the correct answer)
        // For demo purposes, we'll just check if the answer contains "correct"
        console.log('Verifying answer...');
        const isCorrect = selectedOption.toLowerCase().includes("correct")

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

            return NextResponse.json({ correct: true })
        }

        console.log('Incorrect answer for game:', gameId);
        return NextResponse.json({ correct: false })
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