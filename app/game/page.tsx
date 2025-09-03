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
import { useHPOAuth } from "@/contexts/hpo-auth-context"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import CardChoice from "@/components/layout/CardChoice"
import CardHolder from "@/components/layout/CardHolder"
import { SupportChat } from "@/components/support-chat"

type Character = "Shema" | "Teta"
type GameStatus = "character-selection" | "playing" | "game-over" | "cancelled"
type TurnType = "player" | "character"

type Question = {
    id: number;
    question_text: string;
    question_type: string;
    options: string[];
    correct_answer: string | string[];
    explanation: string;
    points: number;
    difficulty: string;
    card: string;
    card_info: {
        suit: string;
        value: string;
        pointValue: number;
        symbol: string;
        id: string;
    };
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
    const { player, isAuthenticated, isLoading } = useHPOAuth()
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
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [showDidYouKnowDialog, setShowDidYouKnowDialog] = useState(false);
    const [didYouKnowTip, setDidYouKnowTip] = useState<string | null>(null);
    const [gameMatchId, setGameMatchId] = useState<string | null>(null);

    const createGameSession = async () => {
        console.log('createGameSession called - isAuthenticated:', isAuthenticated, 'player:', player);
        
        if (!isAuthenticated || !player) {
            console.log('User not authenticated, using fallback match_id generation');
            return null; // For non-logged-in users, return null to use current implementation
        }

        try {
            console.log('Creating new game session for authenticated user...');
            const response = await fetch(`${process.env.NEXT_PUBLIC_HPO_API_BASE_URL}/api/games/create/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    participant_count: 1 // Single player vs AI
                }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log('New game session created successfully:', data);
                return data.game.match_id;
            } else {
                console.error('Failed to create game session:', response.statusText);
                return null;
            }
        } catch (error) {
            console.error('Error creating game session:', error);
            return null;
        }
    };

    const initializeGame = async () => {
        // Create game session for logged-in users
        const matchId = await createGameSession();
        console.log('initializeGame - received matchId:', matchId);
        setGameMatchId(matchId);

        // Create and shuffle deck
        const deck = createDeck();

        // Deal 3 cards to each player initially
        const hands = dealCards(deck, 2, 3);

        // The remaining cards go to the card holder
        const cardHolder = [...deck];

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
            totalRounds: 18,
            cardHolder: cardHolder // Add the remaining cards to the card holder
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

    useEffect(() => {
        // Don't initialize game until authentication is complete
        if (isLoading) {
            console.log("Authentication still loading, waiting...");
            return;
        }

        const reconnectionData = sessionStorage.getItem("reconnection_data")
        if (reconnectionData) {
            try {
                const restoredState = JSON.parse(reconnectionData)
                console.log("Restoring game state from session storage:", restoredState)
                
                // Check if players exists and is an array
                if (Array.isArray(restoredState.players)) {
                    const humanPlayer = restoredState.players.find((p: any) => p.id === restoredState.playerId)
                    const aiPlayerObject = restoredState.players.find((p: any) => p.id !== restoredState.playerId)
                    
                    if (humanPlayer && aiPlayerObject) {
                         const initialGameState: GameState = {
                            trumpSuit: restoredState.trumpSuit,
                            players: [
                                { hand: restoredState.hand, collectedCards: [], score: restoredState.teamScores.team1 },
                                { hand: [], collectedCards: [], score: restoredState.teamScores.team2 }
                            ],
                            currentPlayer: restoredState.currentPlayerId === restoredState.playerId ? 0 : 1,
                            cardsOnTable: restoredState.currentRound,
                            roundStake: 0,
                            roundHistory: [],
                            currentRound: restoredState.currentRoundNumber,
                            totalRounds: 18, 
                            cardHolder: [] 
                        };

                        setGameState(initialGameState)
                        setGameStatus("playing")
                        
                        // Restore other necessary states
                        setTotalGameScore(restoredState.teamScores.team1 + restoredState.teamScores.team2)
                        // You might need to adjust how playerRoundsPlayed is restored based on game logic
                        // setPlayerRoundsPlayed(...)

                        // Clean up session storage
                        sessionStorage.removeItem("reconnection_data")
                        return;
                    }
                }
                // If not valid, fallback to normal initialization
                sessionStorage.removeItem("reconnection_data")
                initializeGame();
            } catch (error) {
                console.error("Failed to restore game state:", error)
                sessionStorage.removeItem("reconnection_data")
                // Fallback to normal initialization
                initializeGame();
            }
        } else {
            initializeGame();
        }

        // Redirect if not authenticated
        
        // ... rest of useEffect ...
    }, [selectedDifficulty, router, isLoading, isAuthenticated, player]);

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
        // Get username from player data or localStorage
        const storedUsername = localStorage.getItem('username')
        if (player?.player_name) {
            setUsername(player.player_name)
        } else if (storedUsername) {
            setUsername(storedUsername)
        }
    }, [player])

    // Debug authentication state changes
    useEffect(() => {
        console.log('Authentication state changed - isAuthenticated:', isAuthenticated, 'player:', player, 'isLoading:', isLoading);
    }, [isAuthenticated, player, isLoading])

    // Debug gameMatchId changes
    useEffect(() => {
        console.log('gameMatchId changed:', gameMatchId);
    }, [gameMatchId])

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

        // Create a new game state and immediately remove the card from hand
        const newGameState = { ...gameState };
        newGameState.players[0].hand.splice(cardIndex, 1);
        setGameState(newGameState);

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
                const updatedGameState = { ...newGameState };
                updatedGameState.cardsOnTable = [];

                // Set next player based on round winner
                const roundWinner = roundResult.winningPlayerId === 'human' ? 0 : 1;
                updatedGameState.currentPlayer = roundWinner;
                setCurrentTurn(roundWinner === 0 ? "player" : "character");

                updatedGameState.roundStake = 0;
                updatedGameState.currentRound += 1;
                updatedGameState.roundHistory.push({
                    player1Card: aiCard,
                    player2Card: humanCard,
                    winner: roundWinner,
                    stake: gameState.roundStake
                });

                // Draw new cards for both players from the card holder
                if (updatedGameState.cardHolder && updatedGameState.cardHolder.length > 0) {
                    // Winner draws first
                    const winnerCard = updatedGameState.cardHolder.pop();
                    if (winnerCard) {
                        updatedGameState.players[roundWinner].hand.push(winnerCard);
                    }
                    
                    // Loser draws second
                    const loserCard = updatedGameState.cardHolder.pop();
                    if (loserCard) {
                        updatedGameState.players[1 - roundWinner].hand.push(loserCard);
                    }
                }

                // Update scores and track rounds played
                if (roundResult.winningPlayerId === 'human') {
                    updatedGameState.players[0].score += roundResult.pointsEarned;
                    setPlayerRoundsPlayed(prev => ({ ...prev, human: prev.human + 1 }));
                } else {
                    updatedGameState.players[1].score += roundResult.pointsEarned;
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
                    aiPlayer.updateMemory(updatedGameState);

                    // For Adaptive difficulty, allow personality adaptation
                    if (selectedDifficulty === 'Adaptive') {
                        aiPlayer.adaptPersonality();
                    }
                }

                setGameState(updatedGameState);
                setCurrentRoundCards({ human: null, ai: null }); // Clear playground after round evaluation

                // Check if game is over after this round
                if (isFinalRound) {
                    // Log final game state with all rounds
                    console.log('Game completed:', {
                        humanRounds: playerRoundsPlayed.human,
                        aiRounds: playerRoundsPlayed.ai,
                        totalScore: totalGameScore + roundResult.pointsEarned, // Add final round points
                        humanScore: updatedGameState.players[0].score,
                        aiScore: updatedGameState.players[1].score,
                        winner: updatedGameState.players[0].score > updatedGameState.players[1].score ? 'human' : 'ai',
                        rounds: updatedGameState.roundHistory.map((round, index) => ({
                            round: index + 1,
                            humanCard: round.player1Card,
                            aiCard: round.player2Card,
                            winner: round.winner === 0 ? 'human' : 'ai',
                            stake: round.stake
                        }))
                    });

                    // Submit game result to new API
                    try {
                        const playerWon = updatedGameState.players[0].score > updatedGameState.players[1].score;
                        const lastRound = updatedGameState.roundHistory[updatedGameState.roundHistory.length - 1];
                        const matchId = gameMatchId || `single-player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                        console.log('Using match_id:', matchId, 'gameMatchId:', gameMatchId, 'isAuthenticated:', isAuthenticated);
                        
                        const requestBody = {
                            match_id: matchId,
                            player_id: isAuthenticated && player ? parseInt(player.id.toString()) : 1,
                            username: isAuthenticated && player ? (player.username || player.player_name) : username,
                            team: 1,
                            is_winner: playerWon,
                            lost_card: playerWon ? null : null // Will be set when player selects a card
                        };

                        console.log('Submitting single-player game result:', requestBody);
                        
                        const response = await fetch(`${process.env.NEXT_PUBLIC_HPO_API_BASE_URL}/api/games/submit-completed/`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(requestBody),
                        });

                        if (response.ok) {
                            const data = await response.json();
                            console.log('Single-player game result submitted successfully:', data);
                            
                            if (data.response && playerWon) {
                                if (data.response.type === 'explanation') {
                                    // Winner gets explanation/fun fact
                                    setDidYouKnowTip(data.response.explanation);
                                    setShowDidYouKnowDialog(true);
                                }
                            }
                            // For losers, we don't process the response here - they need to select a card first
                        } else {
                            console.error('Failed to submit single-player game result:', response.statusText);
                            toast.error('Failed to submit game result');
                        }
                    } catch (error) {
                        console.error('Error submitting single-player game result:', error);
                        toast.error('Failed to submit game result');
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
                if (aiCardIndex < 0 || aiCardIndex >= newGameState.players[1].hand.length) {
                    console.error('Invalid AI card index');
                    return;
                }

                setCurrentTurn("player");
                const aiCard = newGameState.players[1].hand[aiCardIndex];
                if (!aiCard) {
                    console.error('Invalid AI card');
                    return;
                }

                // Remove AI card from hand
                newGameState.players[1].hand.splice(aiCardIndex, 1);
                setGameState(newGameState);

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
                const updatedGameState = { ...newGameState };
                updatedGameState.cardsOnTable = [];

                // Set next player based on round winner
                const roundWinner = roundResult.winningPlayerId === 'human' ? 0 : 1;
                updatedGameState.currentPlayer = roundWinner;

                updatedGameState.roundStake = 0;
                updatedGameState.currentRound += 1;
                updatedGameState.roundHistory.push({
                    player1Card: humanCard,
                    player2Card: aiCard,
                    winner: roundWinner,
                    stake: gameState.roundStake
                });

                // Draw new cards for both players from the card holder
                if (updatedGameState.cardHolder && updatedGameState.cardHolder.length > 0) {
                    // Winner draws first
                    const winnerCard = updatedGameState.cardHolder.pop();
                    if (winnerCard) {
                        updatedGameState.players[roundWinner].hand.push(winnerCard);
                    }
                    
                    // Loser draws second
                    const loserCard = updatedGameState.cardHolder.pop();
                    if (loserCard) {
                        updatedGameState.players[1 - roundWinner].hand.push(loserCard);
                    }
                }

                // Update scores and track rounds played
                if (roundResult.winningPlayerId === 'human') {
                    updatedGameState.players[0].score += roundResult.pointsEarned;
                    setPlayerRoundsPlayed(prev => ({ ...prev, human: prev.human + 1 }));
                } else {
                    updatedGameState.players[1].score += roundResult.pointsEarned;
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
                    aiPlayer.updateMemory(updatedGameState);

                    // For Adaptive difficulty, allow personality adaptation
                    if (selectedDifficulty === 'Adaptive') {
                        aiPlayer.adaptPersonality();
                    }
                }

                setGameState(updatedGameState);
                setCurrentRoundCards({ human: null, ai: null });

                // Check if game is over after this round
                if (isFinalRound) {
                    // Log final game state with all rounds
                    console.log('Game completed:', {
                        humanRounds: playerRoundsPlayed.human,
                        aiRounds: playerRoundsPlayed.ai,
                        totalScore: totalGameScore + roundResult.pointsEarned, // Add final round points
                        humanScore: updatedGameState.players[0].score,
                        aiScore: updatedGameState.players[1].score,
                        winner: updatedGameState.players[0].score > updatedGameState.players[1].score ? 'human' : 'ai',
                        rounds: updatedGameState.roundHistory.map((round, index) => ({
                            round: index + 1,
                            humanCard: round.player1Card,
                            aiCard: round.player2Card,
                            winner: round.winner === 0 ? 'human' : 'ai',
                            stake: round.stake
                        }))
                    });

                    // Submit game result to new API
                    try {
                        const playerWon = updatedGameState.players[0].score > updatedGameState.players[1].score;
                        const lastRound = updatedGameState.roundHistory[updatedGameState.roundHistory.length - 1];
                        const matchId = gameMatchId || `single-player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                        console.log('Using match_id:', matchId, 'gameMatchId:', gameMatchId, 'isAuthenticated:', isAuthenticated);
                        
                        const requestBody = {
                            match_id: matchId,
                            player_id: isAuthenticated && player ? parseInt(player.id.toString()) : 1,
                            username: isAuthenticated && player ? (player.username || player.player_name) : username,
                            team: 1,
                            is_winner: playerWon,
                            lost_card: playerWon ? null : null // Will be set when player selects a card
                        };

                        console.log('Submitting single-player game result:', requestBody);
                        
                        const response = await fetch(`${process.env.NEXT_PUBLIC_HPO_API_BASE_URL}/api/games/submit-completed/`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(requestBody),
                        });

                        if (response.ok) {
                            const data = await response.json();
                            console.log('Single-player game result submitted successfully:', data);
                            
                            if (data.response && playerWon) {
                                if (data.response.type === 'explanation') {
                                    // Winner gets explanation/fun fact
                                    setDidYouKnowTip(data.response.explanation);
                                    setShowDidYouKnowDialog(true);
                                }
                            }
                            // For losers, we don't process the response here - they need to select a card first
                        } else {
                            console.error('Failed to submit single-player game result:', response.statusText);
                            toast.error('Failed to submit game result');
                        }
                    } catch (error) {
                        console.error('Error submitting single-player game result:', error);
                        toast.error('Failed to submit game result');
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

    // Show loading state while authentication is in progress
    if (isLoading) {
        return (
            <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 bg-gradient-to-b from-green-50 to-white">
                    <div className="container max-w-5xl mx-auto px-4 md:px-8 py-12 flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading...</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col ">
            <Header />
            <main className="flex-1 bg-gradient-to-b from-green-50 to-white">
                <div className="container max-w-5xl mx-auto px-4 md:px-8 py-12">


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
                        {process.env.NODE_ENV === 'development' && (
                            <div className="flex justify-end">
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        // Simulate game loss with final round cards
                                        const updatedGameState = { ...gameState };
                                        
                                        // Create dummy final round cards
                                        const humanCard = updatedGameState.players[0].hand[0] || { suit: 'Hearts', value: 'A' };
                                        const aiCard = updatedGameState.players[1].hand[0] || { suit: 'Spades', value: 'K' };
                                        
                                        // Add the final round to history
                                        updatedGameState.roundHistory.push({
                                            player1Card: humanCard,
                                            player2Card: aiCard,
                                            winner: 1, // AI wins
                                            stake: updatedGameState.roundStake
                                        });
                                        
                                        // Set final scores
                                        updatedGameState.players[1].score = updatedGameState.players[0].score + 1;
                                        updatedGameState.currentRound = updatedGameState.totalRounds;
                                        
                                        // Update current round cards for display
                                        setCurrentRoundCards({ human: humanCard, ai: aiCard });
                                        
                                        setGameState(updatedGameState);
                                        setGameStatus("game-over");
                                    }}
                                >
                                    Lose Game
                                </Button>
                            </div>
                        )}
                        
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
                        <div className="flex justify-between items-center">
                            <PlaygroundArea 
                                humanCard={currentRoundCards.human}
                                aiCard={currentRoundCards.ai}
                            />
                            <CardHolder cards={gameState.cardHolder} />
                        </div>

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
                                                const requestBody = {
                                                    match_id: gameMatchId || `single-player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                                    player_id: isAuthenticated && player ? parseInt(player.id.toString()) : 1,
                                                    username: isAuthenticated && player ? (player.username || player.player_name) : username,
                                                    team: 1,
                                                    is_winner: false,
                                                    lost_card: `${selectedCard.suit.charAt(0)}${selectedCard.value}`
                                                };

                                                console.log('Submitting single-player game result with selected card:', requestBody);
                                                
                                                const response = await fetch(`${process.env.NEXT_PUBLIC_HPO_API_BASE_URL}/api/games/submit-completed/`, {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                    },
                                                    body: JSON.stringify(requestBody),
                                                });

                                                if (response.ok) {
                                                    const data = await response.json();
                                                    console.log('Single-player game result submitted successfully with selected card:', data);
                                                    
                                                    if (data.response) {
                                                        if (data.response.type === 'question') {
                                                            setQuestion(data.response.question);
                                                            setShowQuestionDialog(true);
                                                            if (data.gameStats) {
                                                                setGameStatsId(data.gameStats._id);
                                                            }
                                                        }
                                                    }
                                                } else {
                                                    console.error('Failed to submit single-player game result:', response.statusText);
                                                    toast.error('Failed to submit game result');
                                                }
                                            } catch (error) {
                                                console.error('Error submitting single-player game result:', error);
                                                toast.error('Failed to submit game result');
                                            }
                                        }}
                                    />
                                )}
                            </div>
                        )}

                        {/* Only show Play Again button if player won or if they've completed the question/answer process */}
                        {(gameState.players[0].score > gameState.players[1].score || 
                          (gameState.players[0].score < gameState.players[1].score && 
                           (question || didYouKnowTip))) && (
                            <div className="mt-8">
                                <Button
                                    onClick={async () => {
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
                                        setQuestion(null);
                                        setDidYouKnowTip(null);
                                        setShowQuestionDialog(false);
                                        setShowDidYouKnowDialog(false);
                                        setSelectedOptions([]);
                                        setGameMatchId(null);
                                        
                                        // Create new game session for logged-in users
                                        if (isAuthenticated && player) {
                                            const newMatchId = await createGameSession();
                                            console.log('Play Again - created new matchId:', newMatchId);
                                            setGameMatchId(newMatchId);
                                        }
                                        
                                        // Reinitialize the game
                                        initializeGame();
                                    }}
                                    className="bg-green-600 hover:bg-green-700 text-white px-8"
                                >
                                    Play Again
                                </Button>
                            </div>
                        )}
                    </div>
                )}
                </div>
            </main>
            <Footer />
            

            {/* Question Dialog */}
            <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Answer the Question</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-lg break-words whitespace-pre-wrap">{question?.question_text}</p>
                        <div className="space-y-2">
                            {question?.options.map((option: string, index: number) => (
                                <Button
                                    key={index}
                                    variant={selectedOptions.includes(option) ? "default" : "outline"}
                                    onClick={() => {
                                        if (Array.isArray(question.correct_answer)) {
                                            setSelectedOptions(prev => {
                                                if (prev.includes(option)) {
                                                    return prev.filter(opt => opt !== option);
                                                } else {
                                                    return [...prev, option];
                                                }
                                            });
                                        } else {
                                            setSelectedOptions([option]);
                                        }
                                    }}
                                    className="w-full text-left justify-start py-2 px-4 h-auto min-h-[44px] break-words whitespace-pre-wrap"
                                >
                                    {option}
                                </Button>
                            ))}
                        </div>
                        {Array.isArray(question?.correct_answer) && (
                            <p className="text-sm text-gray-500">
                                Select {question.correct_answer.length} correct answer{question.correct_answer.length > 1 ? 's' : ''}
                            </p>
                        )}
                        <div className="flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowQuestionDialog(false);
                                    setSelectedOptions([]);
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={async () => {
                                    if (!question) return;
                                    
                                    // Verify answer locally first
                                    const isCorrect = Array.isArray(question.correct_answer) 
                                      ? selectedOptions.length === question.correct_answer.length && 
                                        selectedOptions.every(opt => question.correct_answer.includes(opt))
                                      : selectedOptions.includes(question.correct_answer);
                                    
                                    console.log('Answer verification:', {
                                      selectedOptions,
                                      correctAnswer: question.correct_answer,
                                      isCorrect,
                                      questionId: question.id
                                    });
                                    
                                    try {
                                        if (isCorrect) {
                                            // Console log correct answer submission (omitting POST request)
                                            console.log('Correct answer submitted:', {
                                                match_id: gameMatchId || `single-player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                                username: isAuthenticated && player ? (player.username || player.player_name) : username,
                                                question_id: question.id,
                                                answer: selectedOptions.join(', '),
                                                points: question.points || 1,
                                                correct_answer: question.correct_answer
                                            });
                                            toast.success(`Correct! You earned ${question.points || 1} mark(s).`);
                                        } else {
                                            // Console log wrong answer submission (omitting POST request)
                                            console.log('Wrong answer submitted:', {
                                                match_id: gameMatchId || `single-player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                                                player_id: isAuthenticated && player ? parseInt(player.id.toString()) : 1,
                                                username: isAuthenticated && player ? (player.username || player.player_name) : username,
                                                question_id: question.id,
                                                answer: selectedOptions.join(', '),
                                                correct_answer: question.correct_answer
                                            });
                                            toast.error(`Incorrect. The correct answer was: ${Array.isArray(question.correct_answer) ? question.correct_answer.join(', ') : question.correct_answer}`);
                                        }
                                    } catch (error) {
                                        console.error('Error processing answer:', error);
                                        toast.error('Failed to process answer');
                                    }
                                    
                                    setShowQuestionDialog(false);
                                    setSelectedOptions([]);
                                }}
                                disabled={Array.isArray(question?.correct_answer) 
                                    ? selectedOptions.length !== question.correct_answer.length
                                    : selectedOptions.length === 0}
                            >
                                Submit Answer
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            <SupportChat />

            {/* Did You Know Dialog */}
            <Dialog open={showDidYouKnowDialog} onOpenChange={setShowDidYouKnowDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Fun Fact?</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-lg break-words whitespace-pre-wrap">{didYouKnowTip}</p>
                        <div className="flex justify-end">
                            <Button
                                onClick={() => setShowDidYouKnowDialog(false)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
