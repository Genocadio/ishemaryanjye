"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card as UiCard, CardContent, } from "@/components/ui/card"
import { useLanguage } from "@/contexts/language-context"
import {  User, UserRound, Heart, Diamond, Club, Spade } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Badge } from "@/components/ui/badge"
import { CardGameAI, GameState, Card as GameCard, Suit, DifficultyLevel } from "@/lib/gamer/aigamer"
import { RoundEvaluator } from "@/lib/evaluator/RoundEvaluator"
import { createDeck, dealCards, getRandomTrumpSuit } from "@/lib/utils/gameUtils"
import CardHand from "@/components/layout/CardHand"
import GameStatusCard from '../../components/layout/GameStatusCard'
import PlaygroundArea from '@/components/layout/PlaygroundArea'
import { CompactCard } from "@/components/layout/GameCard"
import { GameStatus } from "@/components/layout/GameStatus"
import { Progress } from "@/components/ui/progress"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import CardChoice from "@/components/layout/CardChoice"

type Character = "Shema" | "Teta"
type GameStatus = "character-selection" | "playing" | "game-over" | "cancelled"
type TurnType = "player" | "character"

type QuestionOption = {
    id: number;
    text: string;
};

type Question = {
    id: string;
    question: string;
    options: QuestionOption[];
    correctAnswer: number;
};

const getAIDelay = (): number => {
    // Random base delay between 300-800ms
    const baseDelay = Math.floor(Math.random() * 500) + 300;
    // Random variation between 200-700ms
    const randomVariation = Math.floor(Math.random() * 500) + 200;
    return baseDelay + randomVariation;
};

const getTrumpSuitIcon = (suit: Suit) => {
    switch (suit) {
        case 'Hearts':
            return <Heart className="h-5 w-5 text-red-500" />;
        case 'Diamonds':
            return <Diamond className="h-5 w-5 text-red-500" />;
        case 'Clubs':
            return <Club className="h-5 w-5 text-black" />;
        case 'Spades':
            return <Spade className="h-5 w-5 text-black" />;
        default:
            return null;
    }
};

export default function DuoPlayerGame() {
    const { t } = useLanguage()
    const router = useRouter()
    const pathname = usePathname()
    const { data: session, status } = useSession()
    const [username, setUsername] = useState('Guest')

    const [gameState, setGameState] = useState<GameState | null>(null)
    const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel>("Medium")
    const [aiPlayer, setAiPlayer] = useState<CardGameAI | null>(null)
    const [roundEvaluator, setRoundEvaluator] = useState<RoundEvaluator | null>(null)
    const [selectedCard, setSelectedCard] = useState<number | null>(null)
    const [gameMessage, setGameMessage] = useState<string>("")
    const [currentRoundCards, setCurrentRoundCards] = useState<{ human: GameCard | null, ai: GameCard | null }>({ human: null, ai: null })

    const [gameStatus, setGameStatus] = useState<GameStatus>("character-selection")
    const [currentTurn, setCurrentTurn] = useState<TurnType>("player")
    const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null)
    const [isClickCooldown, setIsClickCooldown] = useState(false)
    const [isPlayerTurn, setIsPlayerTurn] = useState(true)
    const [totalPoints, setTotalPoints] = useState(0)
    const [playerRoundsPlayed, setPlayerRoundsPlayed] = useState({ human: 0, ai: 0 });
    const [totalGameScore, setTotalGameScore] = useState(0);
    const [showQuestionDialog, setShowQuestionDialog] = useState(false);
    const [question, setQuestion] = useState<Question | null>(null);
    const [gameStatsId, setGameStatsId] = useState<string | null>(null);

    useEffect(() => {
        // Redirect if not authenticated
        
        const initializeGame = () => {
            // Create and shuffle deck
            const deck = createDeck();

            // Deal 18 cards to each player (total 36 cards)
            const hands = dealCards(deck, 2, 18);

            // Randomly select starting player (0 for human, 1 for AI)
            const startingPlayer = Math.floor(Math.random() * 2) as 0 | 1;

            // Create initial game state
            const initialGameState: GameState = {
                trumpSuit: getRandomTrumpSuit(),
                players: [
                    { hand: hands[0], collectedCards: [], score: 0 }, // Human player
                    { hand: hands[1], collectedCards: [], score: 0 }  // AI player
                ],
                currentPlayer: startingPlayer,
                cardsOnTable: [],
                roundStake: 0,
                roundHistory: [],
                currentRound: 0,
                totalRounds: 18
            };

            // Initialize AI player with selected difficulty and fixed personality
            const ai = new CardGameAI('Analytical', selectedDifficulty);
            ai.initialize(initialGameState, 1);

            // Initialize round evaluator
            const evaluator = new RoundEvaluator(initialGameState.trumpSuit);

            setGameState(initialGameState);
            setAiPlayer(ai);
            setRoundEvaluator(evaluator);
            setCurrentTurn(startingPlayer === 0 ? "player" : "character");

            // Show message about who starts
            setGameMessage(startingPlayer === 0 ? 'You start the game!' : 'AI starts the game!');
        };

        initializeGame();
    }, [selectedDifficulty, status, router]);

    useEffect(() => {
        if (gameState && gameState.currentPlayer === 1 && aiPlayer && roundEvaluator) {
            // Add the check here at the beginning of the effect
            if (gameState.currentRound >= gameState.totalRounds) {
                return;
            }

            const delay = getAIDelay();

            const playAITurn = async () => {
                await new Promise(resolve => setTimeout(resolve, delay));

                // AI's turn to play first
                const aiCardIndex = aiPlayer.getFirstPlayerMove();
                const aiCard = gameState.players[1].hand[aiCardIndex];
                const aiMove = {
                    playerId: 'ai',
                    card: aiCard,
                    teamId: 'team2'
                };

                // Show AI card immediately
                setCurrentRoundCards({ human: null, ai: aiCard });

                // Update game state
                const newGameState = { ...gameState };
                setCurrentTurn("player");
                newGameState.players[1].hand.splice(aiCardIndex, 1);
                newGameState.cardsOnTable = [aiCard];
                newGameState.currentPlayer = 0; // Switch to human player

                setGameState(newGameState);
                setGameMessage(`${selectedCharacter} played first. Your turn to respond!`);
            };

            playAITurn();
        }
    }, [gameState, aiPlayer, roundEvaluator]);

    useEffect(() => {
        if (gameState) {
            setIsPlayerTurn(gameState.currentPlayer === 0);
        }
    }, [gameState?.currentPlayer]);

    useEffect(() => {
        // Get username from session or localStorage
        const storedUsername = localStorage.getItem('username')
        if (session?.user?.name) {
            setUsername(session.user.name)
        } else if (storedUsername) {
            setUsername(storedUsername)
        }
    }, [session])

    useEffect(() => {
        // Function to handle beforeunload event
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (gameStatus === "playing") {
                e.preventDefault()
                e.returnValue = ""
                return ""
            }
        }

        // Function to handle route change
        const handleRouteChange = (e: PopStateEvent) => {
            if (gameStatus === "playing" && !window.confirm("Are you sure you want to leave the game? Your progress will be lost.")) {
                e.preventDefault()
                window.history.pushState(null, "", pathname)
                return
            }
        }

        // Add event listeners
        window.addEventListener('beforeunload', handleBeforeUnload)
        window.addEventListener('popstate', handleRouteChange)

        // Cleanup function
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
            window.removeEventListener('popstate', handleRouteChange)
        }
    }, [gameStatus, pathname])

    const handleCardSelect = async (cardIndex: number) => {
        if (!gameState || !aiPlayer || !roundEvaluator) {
            console.error('Game state not properly initialized');
            return;
        }

        // Prevent rapid clicking
        if (isClickCooldown) {
            return;
        }

        // Only allow card selection during player's turn
        if (!isPlayerTurn) {
            return;
        }

        // Set click cooldown
        setIsClickCooldown(true);
        setIsPlayerTurn(false);

        // Reset click cooldown after 500ms
        setTimeout(() => {
            setIsClickCooldown(false);
        }, 500);

        // If it's character's turn, don't allow human to play
        if (gameState.currentPlayer === 1) {
            setCurrentTurn("character");
            return;
        }

        // Check if this is the final round
        const isFinalRound = gameState.currentRound === gameState.totalRounds - 1;

        // Validate card index
        if (cardIndex < 0 || cardIndex >= gameState.players[0].hand.length) {
            console.error('Invalid card index');
            return;
        }

        // Human player's move
        const humanCard = gameState.players[0].hand[cardIndex];
        if (!humanCard) {
            console.error('Invalid card selected');
            return;
        }

        const humanMove = {
            playerId: 'human',
            card: humanCard,
            teamId: 'team1'
        };
        setCurrentTurn("character");

        // If character has already played (cardsOnTable has character's card)
        if (gameState.cardsOnTable.length > 0) {
            // Character already played first, this is human's response
            const aiCard = gameState.cardsOnTable[0];
            if (!aiCard) {
                console.error('Invalid AI card');
                return;
            }

            const aiMove = {
                playerId: 'ai',
                card: aiCard,
                teamId: 'team2'
            };

            // Show human card immediately
            setCurrentRoundCards(prev => ({ ...prev, human: humanCard }));

            try {
                // Wait for 2 seconds before evaluating
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Evaluate round
                const roundResult = roundEvaluator.evaluateRound([aiMove, humanMove], gameState.roundStake);

                // Update game state
                const newGameState = { ...gameState };
                newGameState.players[0].hand.splice(cardIndex, 1);
                newGameState.cardsOnTable = [];

                // Set next player based on round winner
                const roundWinner = roundResult.winningPlayerId === 'human' ? 0 : 1;
                newGameState.currentPlayer = roundWinner;
                setCurrentTurn(roundWinner === 0 ? "player" : "character");

                newGameState.roundStake = 0;
                newGameState.currentRound += 1;
                newGameState.roundHistory.push({
                    player1Card: aiCard,
                    player2Card: humanCard,
                    winner: roundWinner,
                    stake: gameState.roundStake
                });

                // Update scores and track rounds played
                if (roundResult.winningPlayerId === 'human') {
                    newGameState.players[0].score += roundResult.pointsEarned;
                    setPlayerRoundsPlayed(prev => ({ ...prev, human: prev.human + 1 }));
                } else {
                    newGameState.players[1].score += roundResult.pointsEarned;
                    setPlayerRoundsPlayed(prev => ({ ...prev, ai: prev.ai + 1 }));
                }

                // Update total game score
                setTotalGameScore(prev => {
                    const newTotal = prev + roundResult.pointsEarned;
                    if (newTotal > 120) {
                        console.error('Total score exceeds 120:', newTotal);
                        return prev;
                    }
                    return newTotal;
                });

                // Update AI memory for harder difficulty levels
                if (selectedDifficulty === 'Hard' || selectedDifficulty === 'Very Hard' || selectedDifficulty === 'Adaptive') {
                    aiPlayer.updateMemory(newGameState);

                    // For Adaptive difficulty, allow personality adaptation
                    if (selectedDifficulty === 'Adaptive') {
                        aiPlayer.adaptPersonality();
                    }
                }

                setGameState(newGameState);
                setCurrentRoundCards({ human: null, ai: null }); // Clear playground after round evaluation

                // Check if game is over after this round
                if (isFinalRound) {
                    // Log final game state with all rounds
                    console.log('Game completed:', {
                        humanRounds: playerRoundsPlayed.human,
                        aiRounds: playerRoundsPlayed.ai,
                        totalScore: totalGameScore + roundResult.pointsEarned, // Add final round points
                        humanScore: newGameState.players[0].score,
                        aiScore: newGameState.players[1].score,
                        winner: newGameState.players[0].score > newGameState.players[1].score ? 'human' : 'ai',
                        rounds: newGameState.roundHistory.map((round, index) => ({
                            round: index + 1,
                            humanCard: round.player1Card,
                            aiCard: round.player2Card,
                            winner: round.winner === 0 ? 'human' : 'ai',
                            stake: round.stake
                        }))
                    });

                    // Save game results if user is logged in
                    if (session?.user) {
                        try {
                            const overallGameScore = newGameState.players[0].score > newGameState.players[1].score 
                                ? (newGameState.players[1].score < 15 ? 2 : 1)
                                : 0;

                            const response = await fetch('/api/game-stats', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    opponentName: selectedCharacter,
                                    gameLevel: selectedDifficulty,
                                    userScore: newGameState.players[0].score,
                                    opponentScore: newGameState.players[1].score,
                                    wonByQuestion: newGameState.players[1].score < 15
                                }),
                            });

                            if (response.ok) {
                                const data = await response.json();
                                setGameStatsId(data.gameStatsId);
                                toast.success('Game statistics saved successfully!');
                            } else {
                                toast.error('Failed to save game statistics');
                            }
                        } catch (error) {
                            console.error('Error saving game statistics:', error);
                            toast.error('Failed to save game statistics');
                        }
                    }

                    // Set game status to game-over
                    setGameStatus("game-over");
                    return;
                }

                // Show message about next player
                setGameMessage(roundWinner === 0 ? 'You won the round! Your turn again.' : `${selectedCharacter} won the round! ${selectedCharacter}'s turn.`);
            } catch (error) {
                console.error('Error evaluating round:', error);
                setGameMessage('An error occurred during the round evaluation.');
            }
        } else {
            // Human plays first, show card immediately
            setCurrentRoundCards({ human: humanCard, ai: null });

            try {
                // Character responds after delay
                const delay = getAIDelay();
                await new Promise(resolve => setTimeout(resolve, delay));

                // Get AI move even if it's the final round
                const aiCardIndex = aiPlayer.getSecondPlayerMove(humanCard);
                if (aiCardIndex < 0 || aiCardIndex >= gameState.players[1].hand.length) {
                    console.error('Invalid AI card index');
                    return;
                }

                setCurrentTurn("player");
                const aiCard = gameState.players[1].hand[aiCardIndex];
                if (!aiCard) {
                    console.error('Invalid AI card');
                    return;
                }

                const aiMove = {
                    playerId: 'ai',
                    card: aiCard,
                    teamId: 'team2'
                };

                // Show character card immediately
                setCurrentRoundCards(prev => ({ ...prev, ai: aiCard }));

                // Wait for 2 seconds before evaluating
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Evaluate round
                const roundResult = roundEvaluator.evaluateRound([humanMove, aiMove], gameState.roundStake);

                // Update game state
                const newGameState = { ...gameState };
                newGameState.players[0].hand.splice(cardIndex, 1);
                newGameState.players[1].hand.splice(aiCardIndex, 1);
                newGameState.cardsOnTable = [];

                // Set next player based on round winner
                const roundWinner = roundResult.winningPlayerId === 'human' ? 0 : 1;
                newGameState.currentPlayer = roundWinner;

                newGameState.roundStake = 0;
                newGameState.currentRound += 1;
                newGameState.roundHistory.push({
                    player1Card: humanCard,
                    player2Card: aiCard,
                    winner: roundWinner,
                    stake: gameState.roundStake
                });

                // Update scores and track rounds played
                if (roundResult.winningPlayerId === 'human') {
                    newGameState.players[0].score += roundResult.pointsEarned;
                    setPlayerRoundsPlayed(prev => ({ ...prev, human: prev.human + 1 }));
                } else {
                    newGameState.players[1].score += roundResult.pointsEarned;
                    setPlayerRoundsPlayed(prev => ({ ...prev, ai: prev.ai + 1 }));
                }

                // Update total game score
                setTotalGameScore(prev => {
                    const newTotal = prev + roundResult.pointsEarned;
                    if (newTotal > 120) {
                        console.error('Total score exceeds 120:', newTotal);
                        return prev;
                    }
                    return newTotal;
                });

                // Update AI memory for harder difficulty levels
                if (selectedDifficulty === 'Hard' || selectedDifficulty === 'Very Hard' || selectedDifficulty === 'Adaptive') {
                    aiPlayer.updateMemory(newGameState);

                    // For Adaptive difficulty, allow personality adaptation
                    if (selectedDifficulty === 'Adaptive') {
                        aiPlayer.adaptPersonality();
                    }
                }

                setGameState(newGameState);
                setCurrentRoundCards({ human: null, ai: null }); // Clear playground after round evaluation

                // Check if game is over after this round
                if (isFinalRound) {
                    // Log final game state with all rounds
                    console.log('Game completed:', {
                        humanRounds: playerRoundsPlayed.human,
                        aiRounds: playerRoundsPlayed.ai,
                        totalScore: totalGameScore + roundResult.pointsEarned, // Add final round points
                        humanScore: newGameState.players[0].score,
                        aiScore: newGameState.players[1].score,
                        winner: newGameState.players[0].score > newGameState.players[1].score ? 'human' : 'ai',
                        rounds: newGameState.roundHistory.map((round, index) => ({
                            round: index + 1,
                            humanCard: round.player1Card,
                            aiCard: round.player2Card,
                            winner: round.winner === 0 ? 'human' : 'ai',
                            stake: round.stake
                        }))
                    });

                    // Save game results if user is logged in
                    if (session?.user) {
                        try {
                            const overallGameScore = newGameState.players[0].score > newGameState.players[1].score 
                                ? (newGameState.players[1].score < 15 ? 2 : 1)
                                : 0;

                            const response = await fetch('/api/game-stats', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    opponentName: selectedCharacter,
                                    gameLevel: selectedDifficulty,
                                    userScore: newGameState.players[0].score,
                                    opponentScore: newGameState.players[1].score,
                                    wonByQuestion: newGameState.players[1].score < 15
                                }),
                            });

                            if (response.ok) {
                                const data = await response.json();
                                setGameStatsId(data.gameStatsId);
                                toast.success('Game statistics saved successfully!');
                            } else {
                                toast.error('Failed to save game statistics');
                            }
                        } catch (error) {
                            console.error('Error saving game statistics:', error);
                            toast.error('Failed to save game statistics');
                        }
                    }

                    // Set game status to game-over
                    setGameStatus("game-over");
                    return;
                }

                // Show message about next player
                setGameMessage(roundWinner === 0 ? 'You won the round! Your turn again.' : `${selectedCharacter} won the round! ${selectedCharacter}'s turn.`);
            } catch (error) {
                console.error('Error during AI turn:', error);
                setGameMessage('An error occurred during the AI turn.');
            }
        }

        // After round evaluation, update player turn based on winner
        const roundWinner = gameState.currentPlayer;
        if (roundWinner === 0) {
            setIsPlayerTurn(true);
        } else {
            setIsPlayerTurn(false);
        }
    };

    const startGame = () => {
        setGameStatus("playing")
    }

    return (
        <div className="flex min-h-screen flex-col ">
            <Header />
            <main className="flex-1 container max-w-5xl mx-auto px-4 bg-gradient-to-b from-green-50 to-white md:px-8 py-12">


                {gameStatus === "character-selection" && (
                    <div className="space-y-8">
                        <div className="text-center space-y-2">
                            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Choose Your Character</h1>
                            <p className="text-gray-500 md:text-xl max-w-[700px] mx-auto">
                                Select your opponent to play against
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                            <UiCard
                                className={`cursor-pointer transition-all hover:shadow-lg ${selectedCharacter === "Shema" ? "ring-2 ring-green-500 border-green-500" : ""
                                    }`}
                                onClick={() => setSelectedCharacter("Shema")}
                            >
                                <CardContent className="p-6 flex flex-col items-center text-center">
                                    <div className="w-32 h-32 rounded-full bg-blue-100 mb-4 flex items-center justify-center">
                                        <User className="h-20 w-20 text-blue-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2">Shema</h2>
                                    <p className="text-gray-500 mb-4">Male character who promotes healthy relationships and respect</p>
                                    <Badge variant="outline" className="bg-blue-50">
                                        Male Character
                                    </Badge>
                                </CardContent>
                            </UiCard>

                            <UiCard
                                className={`cursor-pointer transition-all hover:shadow-lg ${selectedCharacter === "Teta" ? "ring-2 ring-green-500 border-green-500" : ""
                                    }`}
                                onClick={() => setSelectedCharacter("Teta")}
                            >
                                <CardContent className="p-6 flex flex-col items-center text-center">
                                    <div className="w-32 h-32 rounded-full bg-pink-100 mb-4 flex items-center justify-center">
                                        <UserRound className="h-20 w-20 text-pink-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2">Teta</h2>
                                    <p className="text-gray-500 mb-4">
                                        Female character who advocates for reproductive health and equality
                                    </p>
                                    <Badge variant="outline" className="bg-pink-50">
                                        Female Character
                                    </Badge>
                                </CardContent>
                            </UiCard>
                        </div>
                        <div className="flex justify-center gap-4">
                            <Button
                                variant={selectedDifficulty === "Easy" ? "default" : "outline"}
                                size="lg"
                                className={`flex items-center gap-2 ${selectedDifficulty === "Easy" ? "bg-green-500 text-white hover:bg-green-600" : ""
                                    }`}
                                onClick={() => setSelectedDifficulty("Easy")}
                            >
                                <span className="text-green-500">●</span>
                                <span>Easy</span>
                            </Button>
                            <Button
                                variant={selectedDifficulty === "Medium" ? "default" : "outline"}
                                size="lg"
                                className={`flex items-center gap-2 ${selectedDifficulty === "Medium" ? "bg-yellow-500 text-white hover:bg-yellow-600" : ""
                                    }`}
                                onClick={() => setSelectedDifficulty("Medium")}
                            >
                                <span className={selectedDifficulty === "Medium" ? "text-yellow-500" : "text-white"}>●</span>
                                <span>Medium</span>
                            </Button>
                            <Button
                                variant={selectedDifficulty === "Hard" ? "default" : "outline"}
                                size="lg"
                                className={`flex items-center gap-2 ${                  selectedDifficulty === "Hard" ? "bg-red-500 hover:bg-red-600" : ""

                                    }`}
                                onClick={() => setSelectedDifficulty("Hard")}
                            >
                                <span className="text-red-500">●</span>

                                <span>Hard</span>
                            </Button>
                        </div>


                        <div className="flex justify-center mt-8">
                            <Button
                                size="lg"
                                disabled={!selectedCharacter}
                                onClick={startGame}
                                className="bg-green-600 hover:bg-green-700 text-white px-8"
                            >
                                Start Game
                            </Button>
                        </div>
                    </div>
                )}

                {gameStatus === "playing" && gameState && (
                    <div className="space-y-4">
                        
                            <GameStatusCard
                                currentTurn={currentTurn}
                                selectedCharacter={selectedCharacter || 'Shema'}
                                playerScore={gameState.players[0].score}
                                aiScore={gameState.players[1].score}
                                trumpSuit={gameState.trumpSuit}
                                username={username}
                            />
                    

                        {/* Playground */}
                        <Progress value={gameState.currentRound / gameState.totalRounds * 100} />
                        <PlaygroundArea 
                          humanCard={currentRoundCards.human}
                          aiCard={currentRoundCards.ai}
                        />

                        {/* Your Hand */}
                        <CompactCard title="Your Hand">
                            <CardHand
                                cards={gameState.players[0].hand}
                                onCardSelect={handleCardSelect}
                                className="scale-75"
                                disabled={!isPlayerTurn || isClickCooldown}
                            />
                        </CompactCard>
                    </div>
                )}
                {gameStatus === "game-over" && gameState && (
                    <div className="space-y-8 text-center">
                        <div className="space-y-4">
                            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                                {gameState.players[0].score > gameState.players[1].score ? "Congratulations!" : "Game Over"}
                            </h1>
                            <p className="text-gray-500 md:text-xl max-w-[700px] mx-auto">
                                {gameState.players[0].score > gameState.players[1].score 
                                    ? "You won the game!" 
                                    : `${selectedCharacter} won the game!`}
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                            <UiCard>
                                <CardContent className="p-6">
                                    <h2 className="text-2xl font-bold mb-4">Your Score</h2>
                                    <p className="text-4xl font-bold text-green-600">{gameState.players[0].score}</p>
                                </CardContent>
                            </UiCard>

                            <UiCard>
                                <CardContent className="p-6">
                                    <h2 className="text-2xl font-bold mb-4">{selectedCharacter}'s Score</h2>
                                    <p className="text-4xl font-bold text-red-600">{gameState.players[1].score}</p>
                                </CardContent>
                            </UiCard>
                        </div>

                        {gameState.players[0].score < gameState.players[1].score && (
                            <div className="mt-8">
                                <h2 className="text-2xl font-bold mb-4">Choose a card from the last round to answer a question</h2>
                                {gameState.roundHistory[gameState.roundHistory.length - 1] && (
                                    <CardChoice
                                        cards={{
                                            playerCard: gameState.roundHistory[gameState.roundHistory.length - 1].player1Card,
                                            aiCard: gameState.roundHistory[gameState.roundHistory.length - 1].player2Card
                                        }}
                                        onSelect={async (selectedCard) => {
                                            try {
                                                console.log('Selected card:', selectedCard);
                                                const response = await fetch('/api/game-stats', {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                    },
                                                    body: JSON.stringify({
                                                        opponentName: selectedCharacter,
                                                        gameLevel: selectedDifficulty,
                                                        userScore: gameState.players[0].score,
                                                        opponentScore: gameState.players[1].score,
                                                        wonByQuestion: false,
                                                        selectedCard: selectedCard
                                                    }),
                                                });

                                                if (response.ok) {
                                                    const data = await response.json();
                                                    if (data.question) {
                                                        setQuestion(data.question);
                                                        setShowQuestionDialog(true);
                                                    }
                                                } else {
                                                    toast.error('Failed to get question');
                                                }
                                            } catch (error) {
                                                console.error('Error getting question:', error);
                                                toast.error('Failed to get question');
                                            }
                                        }}
                                    />
                                )}
                            </div>
                        )}

                        <div className="mt-8">
                            <Button
                                onClick={() => {
                                    // Reset game state
                                    setGameState(null);
                                    setAiPlayer(null);
                                    setRoundEvaluator(null);
                                    setSelectedCard(null);
                                    setGameMessage("");
                                    setCurrentRoundCards({ human: null, ai: null });
                                    setGameStatus("character-selection");
                                    setCurrentTurn("player");
                                    setSelectedCharacter(null);
                                    setIsClickCooldown(false);
                                    setIsPlayerTurn(true);
                                    setTotalPoints(0);
                                    setPlayerRoundsPlayed({ human: 0, ai: 0 });
                                    setTotalGameScore(0);
                                    
                                    // Reinitialize the game
                                    const deck = createDeck();
                                    const hands = dealCards(deck, 2, 18);
                                    const startingPlayer = Math.floor(Math.random() * 2) as 0 | 1;
                                    
                                    const initialGameState: GameState = {
                                        trumpSuit: getRandomTrumpSuit(),
                                        players: [
                                            { hand: hands[0], collectedCards: [], score: 0 },
                                            { hand: hands[1], collectedCards: [], score: 0 }
                                        ],
                                        currentPlayer: startingPlayer,
                                        cardsOnTable: [],
                                        roundStake: 0,
                                        roundHistory: [],
                                        currentRound: 0,
                                        totalRounds: 18
                                    };
                                    
                                    const ai = new CardGameAI('Analytical', selectedDifficulty);
                                    ai.initialize(initialGameState, 1);
                                    
                                    const evaluator = new RoundEvaluator(initialGameState.trumpSuit);
                                    
                                    setGameState(initialGameState);
                                    setAiPlayer(ai);
                                    setRoundEvaluator(evaluator);
                                    setCurrentTurn(startingPlayer === 0 ? "player" : "character");
                                    setGameMessage(startingPlayer === 0 ? 'You start the game!' : 'AI starts the game!');
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white px-8"
                            >
                                Play Again
                            </Button>
                        </div>
                    </div>
                )}
            </main>
            <Footer />

            {/* Question Dialog */}
            <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Answer the Question</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-lg">{question?.question}</p>
                        <div className="space-y-2">
                            {question?.options.map((option, index) => (
                                <Button
                                    key={index}
                                    onClick={async () => {
                                        if (!question) return;
                                        try {
                                            const response = await fetch('/api/game-stats', {
                                                method: 'PUT',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                },
                                                body: JSON.stringify({
                                                    questionId: question.id,
                                                    selectedOption: option.text,
                                                    gameId: gameStatsId
                                                }),
                                            });

                                            if (response.ok) {
                                                const data = await response.json();
                                                if (data.correct) {
                                                    toast.success(data.message);
                                                    // Update the game state to reflect the win
                                                    setGameState(prevState => {
                                                        if (!prevState) return prevState;
                                                        return {
                                                            ...prevState,
                                                            players: [
                                                                { ...prevState.players[0], score: prevState.players[0].score + 1 },
                                                                prevState.players[1]
                                                            ]
                                                        };
                                                    });
                                                } else {
                                                    toast.error(data.message);
                                                }
                                            } else {
                                                toast.error('Failed to verify answer');
                                            }
                                        } catch (error) {
                                            console.error('Error verifying answer:', error);
                                            toast.error('Failed to verify answer');
                                        }
                                        setShowQuestionDialog(false);
                                    }}
                                    className="w-full"
                                >
                                    {option.text}
                                </Button>
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
