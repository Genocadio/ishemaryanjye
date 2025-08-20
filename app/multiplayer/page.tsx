"use client"

import React, { useState, useEffect, Suspense, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/contexts/language-context"
import { Header } from "@/components/layout/header"
import { Copy, User, Loader2, Trophy } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useGameState } from "./useGameState"
import { Player, CardType, PlaygroundEntry, RoundResult, ConnectionState, Teams, Team } from "./types"
import { useSession } from "next-auth/react"
import { toast } from 'sonner'
import MultiplayerCard from "@/components/layout/MultiplayerCard";
import { GameStatus } from "@/components/layout/GameStatus";
import { Progress } from "@/components/ui/progress";
import { CompactCard } from "@/components/layout/GameCard";
import CardHand from "@/components/layout/CardHand";
import CardHolder from "@/components/layout/CardHolder";
import { Footer } from "@/components/layout/footer";
import MultiplayerPlayground from "@/components/layout/MultiplayerPlayground";
import CardChoice from "@/components/layout/CardChoice";
import { useNotificationSound } from "@/components/providers";
import PlayerTurnIndicator from "@/components/player-turn-indicator";

function MultiplayerLobby() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()

  const matchIdFromUrl = searchParams.get("matchId")
  const team1InviteCode = searchParams.get("team1InviteCode")
  const team2InviteCode = searchParams.get("team2InviteCode")
  const inviteCode = searchParams.get("inviteCode")
  const urlTeamSize = Number(searchParams.get("teamSize") || 1)

  // --- STATE ---
  const [playerName, setPlayerName] = useState<string>("")
  const [playerId, setPlayerId] = useState<string>("")
  const [hasEntered, setHasEntered] = useState(false)
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(true)
  const [playOrder, setPlayOrder] = useState<string[]>([])
  const [firstPlayerIndex, setFirstPlayerIndex] = useState<number>(0)
  const initialPlayOrderRef = useRef<string[]>([])

  const {
    connectionState,
    setConnectionState,
    teams,
    setTeams,
    hand,
    setHand,
    playground,
    setPlayground,
    allPlayers,
    teamSize,
    setTeamSize,
    updateStateFromGameState,
  } = useGameState()
  
  const [notification, setNotification] = useState<{ text: string; type: "warning" | "info" | "success" } | null>(null)
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null)
  const [finalGameState, setFinalGameState] = useState<any | null>(null)
  const [lastPlayground, setLastPlayground] = useState<PlaygroundEntry[]>([])
  const [showQuestionDialog, setShowQuestionDialog] = useState(false)
  const [question, setQuestion] = useState<any | null>(null)
  const [gameStatsId, setGameStatsId] = useState<string | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [showDidYouKnowDialog, setShowDidYouKnowDialog] = useState(false)
  const [didYouKnowTip, setDidYouKnowTip] = useState<string | null>(null)
  const [showTurnIndicator, setShowTurnIndicator] = useState(false);
  const [autoShowIndicator, setAutoShowIndicator] = useState(false);
  const [questionAnswered, setQuestionAnswered] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectionTimeout, setReconnectionTimeout] = useState<NodeJS.Timeout | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);

  const { play: playNotificationSound } = useNotificationSound();

  // --- DERIVED STATE ---
  const playerTeamId = teams?.team1.players.some(p => p.id === playerId) ? 'team1' : 'team2';
  
  // Determine if this is the match creator (has matchId) or a joiner (has inviteCode)
  const isMatchCreator = !!matchIdFromUrl;
  
  // Use URL parameter for creators (to show correct number of invite codes in lobby),
  // WebSocket data for joiners (for correct card distribution and game logic)
  const effectiveTeamSize = isMatchCreator ? urlTeamSize : (teamSize || 1);

  // --- EFFECTS ---
  useEffect(() => {
    if (session?.user) {
      setPlayerName(session.user.username || session.user.name || "")
      setPlayerId(session.user.id || "")
      setIsConnecting(false)
    } else if (status === "loading") {
      setIsConnecting(true)
    } else {
      setIsConnecting(false)
    }
  }, [session, status])

  useEffect(() => {
    if (playerName && playerId && !socket) {
      handleConnect()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerName, playerId])

  useEffect(() => {
    if (connectionState.matchStatus === "completed" && finalGameState) {
      const playerTeamData = finalGameState.teams[playerTeamId]
      const opponentTeamId = playerTeamId === "team1" ? "team2" : "team1"
      const opponentTeamData = finalGameState.teams[opponentTeamId]
      const playerWon = playerTeamData.score > opponentTeamData.score
      const opponentName = opponentTeamData.players.map((p: Player) => p.name).join(", ")

      if (playerWon) {
        const fetchDidYouKnow = async () => {
          try {
            const response = await fetch("/api/game-stats", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                opponentName: opponentName,
                gameLevel: "Multiplayer",
                userScore: playerTeamData.score,
                opponentScore: opponentTeamData.score,
                wonByQuestion: false,
                isMultiplayer: true,
                matchId: finalGameState.match.id,
              }),
            })
            if (response.ok) {
              const data = await response.json()
              if (data.didYouKnow) {
                setDidYouKnowTip(data.didYouKnow)
                setShowDidYouKnowDialog(true)
              }
            }
          } catch (error) {
            console.error("Error fetching did you know tip:", error)
          }
        }
        fetchDidYouKnow()
      }
    }
  }, [finalGameState, connectionState.matchStatus, playerTeamId])

  useEffect(() => {
    // On mount, restore initial play order and first player index from localStorage if present
    const storedOrder = localStorage.getItem('initialPlayOrder');
    const storedFirstIdx = localStorage.getItem('initialFirstPlayerIndex');
    if (storedOrder) initialPlayOrderRef.current = JSON.parse(storedOrder);
    if (storedFirstIdx) setFirstPlayerIndex(parseInt(storedFirstIdx, 10));
    if (storedOrder) setPlayOrder(JSON.parse(storedOrder));
  }, []);

  // Auto-hide indicator after 2 seconds if autoShowIndicator is true
  useEffect(() => {
    if (autoShowIndicator) {
      const timeout = setTimeout(() => {
        setShowTurnIndicator(false);
        setAutoShowIndicator(false);
      }, 2000);
      return () => clearTimeout(timeout);
    }
  }, [autoShowIndicator]);

  // Cleanup reconnection timeout on unmount
  useEffect(() => {
    return () => {
      if (reconnectionTimeout) {
        clearTimeout(reconnectionTimeout);
      }
    };
  }, [reconnectionTimeout]);



  // --- HANDLERS ---
  const handlePlayCard = (cardId: string) => {
    // Prevent play if match is paused or any player is disconnected
    if (connectionState.matchStatus === "paused") {
      toast.warning("Match is paused. Wait for all players to reconnect.");
      return;
    }
    const allPlayers = [...(teams?.team1.players ?? []), ...(teams?.team2.players ?? [])];
    if (allPlayers.some(p => !p.connected)) {
      toast.warning("A player is disconnected. Wait for everyone to reconnect.");
      return;
    }
    if (connectionState.currentPlayerId !== playerId) {
      toast.info("It's not your turn to play.");
      return;
    }

    if (!socket) {
      toast.error("You are not connected to the match.");
      return;
    }

    // Prevent play if currently reconnecting
    if (isReconnecting) {
      toast.warning("Please wait while reconnecting to the match.");
      return;
    }

    socket.send(JSON.stringify({ type: "play_card_request", payload: { cardId } }))
  }
  
  const copyToClipboard = (text: string | null) => {
    if(!text) return;
    navigator.clipboard.writeText(text).then(
      () => console.log("Copied to clipboard:", text),
      (err) => console.error("Failed to copy:", err)
    )
  }

  const handleReconnectionAttempt = (code: string) => {
    if (isReconnecting) {
      // Already reconnecting, don't start another attempt
      return;
    }

    setIsReconnecting(true);
    
    // Wait 7 seconds before attempting reconnection
    const timeout = setTimeout(() => {
      console.log("Attempting reconnection after 7 second wait");
      
      const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/invite/${code}?name=${encodeURIComponent(playerName)}&playerId=${encodeURIComponent(playerId)}`;
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log("Reconnection successful");
        setSocket(ws);
        setIsReconnecting(false);
        // Don't show success toast here as it will be shown in onopen
      };
      
      ws.onclose = () => {
        console.log("Reconnection failed");
        setIsReconnecting(false);
        
        // Redirect to connect page on failure
        setTimeout(() => {
          router.push('/connect');
        }, 1000);
      };
      
      ws.onerror = () => {
        console.log("Reconnection error");
        setIsReconnecting(false);
        
        // Redirect to connect page on failure
        setTimeout(() => {
          router.push('/connect');
        }, 1000);
      };
      
      // Set a timeout for this reconnection attempt
      setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          ws.close();
        }
      }, 10000); // 10 second timeout for each attempt
      
    }, 7000);
    
    setReconnectionTimeout(timeout);
  };

  const handleConnect = () => {
    if (!playerName.trim()) {
      setError("No username found in session.")
      return
    }
    if (!playerId.trim()) {
      setError("No userId found in session.")
      return
    }
    setError(null)

    const code = inviteCode || team1InviteCode
    if (!code) {
      setError("No invite code found.")
      return
    }

    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/invite/${code}?name=${encodeURIComponent(playerName)}&playerId=${encodeURIComponent(playerId)}`
    const ws = new WebSocket(wsUrl)
    setSocket(ws)

    ws.onopen = () => {
      console.log("WebSocket connected")
      setHasEntered(true)
      setIsReconnecting(false)
      if (reconnectionTimeout) {
        clearTimeout(reconnectionTimeout);
        setReconnectionTimeout(null);
      }
      
      // If this was a reconnection, show success message
      if (isReconnecting) {
        toast.success("Reconnected successfully!");
        console.log("Reconnection completed successfully");
      }
    }

    ws.onclose = () => {
      console.log("WebSocket disconnected")
      
      // If this is the first disconnection and we were in a game, attempt reconnection
      if (hasEntered && !isReconnecting && connectionState.matchStatus !== "completed") {
        console.log("Current player disconnected, attempting reconnection...")
        handleReconnectionAttempt(code);
      } else {
        setError("Connection closed. You have been disconnected.")
        setHasEntered(false)
        setSocket(null)
        if (!hasEntered) {
          toast.error("Failed to connect to the match. Please try again later.")
          setTimeout(() => router.back(), 1500)
        }
      }
    }

    ws.onerror = (err) => {
      console.error("WebSocket error", err)
      
      // If this is the first error and we were in a game, attempt reconnection
      if (hasEntered && !isReconnecting && connectionState.matchStatus !== "completed") {
        console.log("Current player connection error, attempting reconnection...")
        handleReconnectionAttempt(code);
      } else {
        setError("Connection error. Please try again.")
        if (!hasEntered) {
          toast.error("Failed to connect to the match. Please try again later.")
          setTimeout(() => router.back(), 1500)
        }
      }
    }

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data)
        console.log("Received:", message)
        const { type, payload } = message

        if (type === "connection_established") {
          playNotificationSound("connect");
          localStorage.setItem('incompleteMatchId', payload.match.id);
          localStorage.setItem('incompleteInviteCode', code);
          setConnectionState((prev: ConnectionState) => ({
            ...prev,
            matchId: payload.match.id,
            matchStatus: payload.match.status,
          }))
          setPlayerId(payload.player.id)
        } else if (type === "player_joined") {
          setTeams(payload.teams)
          setConnectionState((prev: ConnectionState) => ({
            ...prev,
            matchId: payload.match.id,
            matchStatus: payload.match.status,
            maxPlayers: payload.match.maxPlayers,
            playersCount: payload.match.playersCount,
          }))
        } else if (type === "reconnection_successful") {
          const { gameState } = payload
          console.log("Reconnection successful, using new gameState:", gameState)
          sessionStorage.setItem("reconnection_data", JSON.stringify(payload))
          updateStateFromGameState(gameState)
          if (code) localStorage.setItem('incompleteInviteCode', code);
          if (gameState.match?.id) localStorage.setItem('incompleteMatchId', gameState.match.id);
          
          // Reset reconnection state
          setIsReconnecting(false);
          if (reconnectionTimeout) {
            clearTimeout(reconnectionTimeout);
            setReconnectionTimeout(null);
          }
          
          // Announce paused state if match is paused or any player is disconnected
          if (gameState.match.status === "paused") {
            const disconnectedPlayers = (gameState.players?.all ?? []).filter((p: Player) => !p.connected)
            if (disconnectedPlayers.length > 0) {
              // Don't show toast since we have persistent notice, just set notification briefly
              setNotification({ 
                text: `Match is paused. Waiting for ${disconnectedPlayers.map((p: Player) => p.name).join(', ')} to reconnect.`, 
                type: "warning" 
              })
              setTimeout(() => setNotification(null), 3000)
            } else {
              setNotification({ 
                text: "Match is paused.", 
                type: "warning" 
              })
              setTimeout(() => setNotification(null), 3000)
            }
          } else {
            toast.info("Reconnected successfully! Waiting for all players...");
          }
          setHasEntered(true)
        } else if (type === "match_paused") {
          console.log("Match paused:", payload)
          
          // Update game state from the paused match
          if (payload.gameState) {
            console.log("Updating game state from match_paused message:", payload.gameState)
            updateStateFromGameState(payload.gameState)
            
            // Set match status to paused
            setConnectionState((prev: ConnectionState) => ({ 
              ...prev, 
              matchStatus: "paused",
              currentRound: payload.gameState.match?.currentRound,
              totalRounds: payload.gameState.match?.totalRounds,
              trumpSuit: payload.gameState.match?.trumpSuit
            }))
            
            // Also ensure teams state is updated with the latest connection status
            if (payload.gameState.teams) {
              console.log("Setting teams state from match_paused:", payload.gameState.teams)
              setTeams(payload.gameState.teams);
            }
            
            // Force UI update
            setForceUpdate(prev => prev + 1)
          } else {
            console.log("No gameState in match_paused payload, setting match status to paused manually")
            // If no gameState, at least set the match status to paused
            setConnectionState((prev: ConnectionState) => ({ 
              ...prev, 
              matchStatus: "paused"
            }))
            
            // Force UI update
            setForceUpdate(prev => prev + 1)
          }
          
          // Show appropriate notification based on reason
          if (payload.reason === "player_disconnected" && payload.pausedBy) {
            const disconnectedPlayer = payload.pausedBy
            
            // Check if this is the current player who disconnected
            if (disconnectedPlayer.id === playerId) {
              console.log("Current player disconnected via match_paused, attempting reconnection...")
              if (!isReconnecting) {
                handleReconnectionAttempt(code);
              }
              return; // Don't show disconnection UI for current player
            }
            
            // Other player disconnected
            playNotificationSound("disconnect")
            // Don't show toast since we have persistent notice, just set notification briefly
            setNotification({ 
              text: `${disconnectedPlayer.name} has disconnected.`, 
              type: "warning" 
            })
            // Clear notification after 3 seconds since we have persistent notice
            setTimeout(() => setNotification(null), 3000)
          } else {
            setNotification({ 
              text: "Match has been paused.", 
              type: "warning" 
            })
            // Clear notification after 3 seconds since we have persistent notice
            setTimeout(() => setNotification(null), 3000)
          }
          
        } else if (type === "player_disconnected" || type === "player_returned") {
            const isDisconnect = type === "player_disconnected"
            console.log(`Player ${isDisconnect ? "disconnected" : "returned"}:`, payload)

            // Check if this is the current player disconnecting
            if (isDisconnect && payload.player && payload.player.id === playerId) {
              // Current player disconnected - handle reconnection
              console.log("Current player disconnected via message, attempting reconnection...")
              if (!isReconnecting) {
                handleReconnectionAttempt(code);
              }
              return; // Don't update UI state for current player disconnection
            }

            if (isDisconnect) {
              playNotificationSound("disconnect");
            } else {
              playNotificationSound("connect");
            }

            // Update teams state and connection state together to ensure UI updates immediately
            setTeams((prevTeams: Teams | null) => {
                if (!prevTeams) return null
                const newTeams = JSON.parse(JSON.stringify(prevTeams))
                const updatePlayer = (p: Player) => {
                    if (p.id === payload.player.id) {
                        return { ...p, connected: !isDisconnect }
                    }
                    return p
                }
                newTeams.team1.players = newTeams.team1.players.map(updatePlayer)
                newTeams.team2.players = newTeams.team2.players.map(updatePlayer)
                
                console.log("Updated teams state after player disconnection:", newTeams);
                
                // Immediately update connection state when teams state changes
                if (isDisconnect) {
                  console.log("Setting match status to paused due to player disconnection");
                  // Force immediate update of connection state
                  setTimeout(() => {
                    setConnectionState((prev: ConnectionState) => ({ 
                      ...prev, 
                      matchStatus: "paused"
                    }))
                    // Force UI update
                    setForceUpdate(prev => prev + 1)
                  }, 0)
                }
                
                return newTeams
            })

            // Update connection state from payload if available
            if (payload.match) {
              setConnectionState((prev: ConnectionState) => ({ 
                ...prev, 
                matchStatus: payload.match.status 
              }))
            } else {
              // Player returned - check if all players are now connected to potentially resume
              const updatedTeams = teams;
              if (updatedTeams) {
                const allPlayers = [...updatedTeams.team1.players, ...updatedTeams.team2.players];
                const allConnected = allPlayers.every(p => p.connected);
                
                if (allConnected && connectionState.matchStatus === "paused") {
                  // All players are connected, but match is still paused
                  // The server should send a match_resumed message, but we can prepare the UI
                  console.log("All players are now connected, waiting for match resume...");
                }
              }
            }

            const notifText = isDisconnect 
                ? `${payload.player.name} has disconnected.`
                : `${payload.player.name} has returned!`
            setNotification({ text: notifText, type: isDisconnect ? "warning" : "info" })
            if (isDisconnect) {
              // Don't show toast since we have persistent notice
            } else {
              toast.info(`${payload.player.name} reconnected. Waiting for all players...`)
            }
            // Clear notification after 3 seconds since we have persistent notice for disconnections
            setTimeout(() => setNotification(null), 3000)
        } else if (type === "match_resumed") {
          if (payload.currentPlayerId && payload.currentPlayerName) {
            setConnectionState((prev: ConnectionState) => ({ 
              ...prev, 
              matchStatus: "active", 
              currentPlayerId: payload.currentPlayerId, 
              currentPlayerName: payload.currentPlayerName 
            }))
            setNotification({ text: `Match resumed by ${payload.resumedBy || 'Someone'}. The match is now live!`, type: "success" })
            setTimeout(() => setNotification(null), 5000)
            toast.success("Match resumed! All players are connected.");
            setShowTurnIndicator(true);
            setAutoShowIndicator(true);
          }
        } else if (type === "match_started") {
          if (payload.gameState) {
            updateStateFromGameState(payload.gameState)
            const startingPlayerName = payload.startingPlayer?.name || 'Unknown Player'
            setConnectionState((prev: ConnectionState) => ({ ...prev, firstPlayerName: startingPlayerName }))
            setNotification({
              text: `Match started! ${startingPlayerName} plays first. Trump is ${payload.trumpSuit || 'Unknown'}.`,
              type: "success",
            })
            setTimeout(() => setNotification(null), 5000)
            if (payload.gameState.match) {
              setPlayOrder(payload.gameState.match.playOrder || []);
              setFirstPlayerIndex(payload.gameState.match.firstPlayerIndex || 0);
              initialPlayOrderRef.current = payload.gameState.match.playOrder || [];
              localStorage.setItem('initialPlayOrder', JSON.stringify(payload.gameState.match.playOrder || []));
              localStorage.setItem('initialFirstPlayerIndex', (payload.gameState.match.firstPlayerIndex || 0).toString());
            }
            setShowTurnIndicator(true);
            setAutoShowIndicator(true);
          }
        } else if (type === "turn_changed") {
          if (payload.gameState) {
            updateStateFromGameState(payload.gameState)
            const notifText = payload.isYourTurn
              ? "It's your turn to play!"
              : `It's ${payload.currentPlayer?.name || 'Unknown Player'}'s turn.`
            setNotification({ text: notifText, type: payload.isYourTurn ? "success" : "info" })
            setTimeout(() => setNotification(null), 4000)
            if (payload.gameState.match) {
              setPlayOrder(payload.gameState.match.playOrder || []);
              setFirstPlayerIndex(payload.gameState.match.firstPlayerIndex || 0);
            }
          }
        } else if (type === "hand_dealt") {
          if (payload.hand) {
            setHand(payload.hand)
          }
        } else if (type === "card_played") {
          if (payload.gameState && payload.playedCard) {
            playNotificationSound("play");
            setLastPlayground(payload.gameState.gameplay?.playground || [])
            updateStateFromGameState(payload.gameState)
            const { player, card } = payload.playedCard
            if (player && card) {
              setNotification({
                text: `${player.name || 'Unknown Player'} played the ${card.value || 'Unknown'} of ${card.suit || 'Unknown'}.`,
                type: "info",
              })
              setTimeout(() => setNotification(null), 4000)
            }
          }
        } else if (type === "round_completed") {
          if (payload.gameState && payload.roundResult) {
            updateStateFromGameState(payload.gameState)
            setRoundResult(payload.roundResult)
          }
        } else if (type === "match_ended") {
          localStorage.removeItem('incompleteMatchId');
          localStorage.removeItem('incompleteInviteCode');
          if (payload.gameState) {
            updateStateFromGameState(payload.gameState)
            setFinalGameState(payload.gameState)
            setConnectionState(prev => ({ ...prev, matchStatus: "completed" }))
          }
        } else if (type === "game_state_update") {
          // Client-side patch for a server bug.
          // After a round completes, the server sends a game_state_update with an incorrect
          // ID for the next player. We use the winner from the roundResult to correct this.
          if (roundResult && payload.players) {
            const winner = roundResult.winner
            const patchedPayload = {
              ...payload,
              players: {
                ...payload.players,
                current: winner.id,
              },
            }
            updateStateFromGameState(patchedPayload)
          } else if (payload) {
            updateStateFromGameState(payload)
          }
        } else if (message.error) {
          setError(message.error)
        } else {
          // Log unhandled message types for debugging
          console.log("Unhandled message type:", type, payload)
        }
      } catch (e) {
        console.error("Error parsing message", e)
        // Don't crash the app on message parsing errors
        setError("Error processing server message. Please refresh the page.")
      }
    }
  }

  // --- RENDER LOGIC ---
  if (isConnecting && !hasEntered) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle>Connecting...</CardTitle>
              <CardDescription>Joining the lobby as {playerName}.</CardDescription>
            </CardHeader>
            <CardContent>
              {error ? (<p className="text-sm text-red-500">{error}</p>) : (<div className="flex flex-col items-center gap-4"><Loader2 className="h-8 w-8 animate-spin text-green-600" /><p>Please wait.</p></div>)}
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  // In-Game / Reconnection View
  if (connectionState.matchStatus === "paused" || connectionState.matchStatus === "active") {
    const isPlayerTurn = connectionState.currentPlayerId === playerId;
    const playerTeam = teams ? teams[playerTeamId] : null;
    const opponentTeamId = playerTeamId === 'team1' ? 'team2' : 'team1';
    const opponentTeam = teams ? teams[opponentTeamId] : null;
    const disconnectedPlayers = [...(teams?.team1.players ?? []), ...(teams?.team2.players ?? [])].filter(p => !p.connected);
    
    const is1v1 = effectiveTeamSize === 1;
    const displayHand = is1v1 ? hand.slice(0, 3) : hand;
    const cardHolderCards = is1v1 ? hand.slice(3) : (connectionState.cardHolder || []);

    // Arrange players according to initial play order (from match start)
    const allPlayersById: Record<string, { id: string; name: string; team: 'A' | 'B' }> = {};
    [...(teams?.team1.players ?? []), ...(teams?.team2.players ?? [])].forEach(p => {
      allPlayersById[p.id] = {
        id: p.id,
        name: p.name,
        team: p.teamId === 'team1' ? 'A' : 'B',
      };
    });
    const orderedPlayers = initialPlayOrderRef.current.map(pid => allPlayersById[pid]).filter(Boolean);
    // Find the current player's index in the initial arrangement (not playOrder)
    const currentTurnIndex = initialPlayOrderRef.current.findIndex(pid => pid === connectionState.currentPlayerId);
    // Debug log to confirm playOrder updates
    console.log('Current playOrder for round:', playOrder);

    return (
      <>
        {showTurnIndicator && !isReconnecting && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40" onClick={() => setShowTurnIndicator(false)}>
            <div onClick={e => e.stopPropagation()} className="relative">
              <PlayerTurnIndicator
                players={orderedPlayers}
                currentTurnIndex={currentTurnIndex}
                roundFirstPlayerIndex={firstPlayerIndex}
                playOrder={playOrder}
              />
            </div>
          </div>
        )}
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 container max-w-5xl mx-auto px-4 bg-gradient-to-b from-green-50 to-white md:px-8 py-12">
             <div className="space-y-4">
               {/* Persistent paused match notice */}
               {connectionState.matchStatus === "paused" && !isReconnecting && (
                 <div key={`paused-${connectionState.matchId}-${teams?.team1.players.filter(p => !p.connected).length}-${teams?.team2.players.filter(p => !p.connected).length}`} className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                   <div className="flex items-center justify-center gap-3 mb-2">
                     <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                     <h2 className="text-lg font-semibold text-orange-800">Match Paused</h2>
                   </div>
                   <p className="text-orange-700 text-sm">
                     The match is currently paused. Game will resume automatically when all players reconnect.
                   </p>
                   <div className="mt-2 text-xs text-orange-600">
                     <p>• Players can still reconnect and resume the game</p>
                     <p>• Your game progress is preserved</p>
                   </div>
                 </div>
               )}

               {/* Match resumed success notice */}
               {connectionState.matchStatus === "active" && notification?.type === "success" && notification?.text?.includes("resumed") && (
                 <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center animate-in slide-in-from-top-2 duration-500">
                   <div className="flex items-center justify-center gap-3 mb-2">
                     <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                     <h2 className="text-lg font-semibold text-green-800">Match Resumed!</h2>
                   </div>
                   <p className="text-green-700 text-sm">
                     All players are connected. The match is now live!
                   </p>
                 </div>
               )}

               {/* Enhanced disconnection handling */}
               {connectionState.matchStatus === "paused" && disconnectedPlayers.length > 0 && !isReconnecting && (
                 <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                   <div className="flex items-center justify-center gap-3 mb-4">
                     <Loader2 className="h-8 w-8 animate-spin text-yellow-600" />
                     <h2 className="text-xl font-semibold text-yellow-800">Match Paused - Waiting for Players</h2>
                   </div>
                   
                   <div className="grid md:grid-cols-2 gap-6 mb-4">
                     {/* Team 1 Status */}
                     <div className="bg-white rounded-lg p-4 border border-yellow-200">
                       <h3 className="font-semibold text-yellow-800 mb-2">Team A</h3>
                       <div className="space-y-2">
                         {teams?.team1.players.map((p: Player) => (
                           <div key={p.id} className={`flex items-center justify-between ${!p.connected ? "opacity-60" : ""}`}>
                             <span className="text-sm">{p.name}</span>
                             <span className={`text-xs px-2 py-1 rounded-full ${
                               p.connected ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                             }`}>
                               {p.connected ? "Connected" : "Disconnected"}
                             </span>
                           </div>
                         ))}
                       </div>
                     </div>
                     
                     {/* Team 2 Status */}
                     <div className="bg-white rounded-lg p-4 border border-yellow-200">
                       <h3 className="font-semibold text-yellow-800 mb-2">Team B</h3>
                       <div className="space-y-2">
                         {teams?.team2.players.map((p: Player) => (
                           <div key={p.id} className={`flex items-center justify-between ${!p.connected ? "opacity-60" : ""}`}>
                             <span className="text-sm">{p.name}</span>
                             <span className={`text-xs px-2 py-1 rounded-full ${
                               p.connected ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                             }`}>
                               {p.connected ? "Connected" : "Disconnected"}
                             </span>
                           </div>
                         ))}
                       </div>
                     </div>
                   </div>
                   
                   <p className="text-yellow-700 text-sm">
                     The match will resume automatically when all players reconnect.
                   </p>
                 </div>
               )}

               {/* Reconnection indicator for current player */}
               {isReconnecting && (
                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                   <div className="flex items-center justify-center gap-3 mb-4">
                     <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                     <h2 className="text-xl font-semibold text-blue-800">Reconnecting...</h2>
                   </div>
                   <p className="text-blue-700 text-sm mb-4">
                     Attempting to reconnect to the match...
                   </p>
                   <div className="bg-white rounded-lg p-4 border border-blue-200">
                     <p className="text-sm text-blue-800">
                       Please wait while we attempt to restore your connection. 
                       This may take a few moments.
                     </p>
                   </div>
                   <div className="mt-4 text-xs text-blue-600">
                     <p>• Your game progress is being preserved</p>
                     <p>• You'll rejoin automatically when connection is restored</p>
                     <p>• If reconnection fails, you'll be redirected to the lobby</p>
                   </div>
                 </div>
               )}
                              {!isReconnecting && (
                 <>
                   <div onClick={() => setShowTurnIndicator(true)} className="cursor-pointer">
                     <GameStatus 
                        currentTurn={isPlayerTurn ? 'player' : 'character'}
                        selectedCharacter={`Team ${opponentTeamId.slice(-1)}`}
                        playerScore={playerTeam?.score ?? 0}
                        aiScore={opponentTeam?.score ?? 0}
                        trumpSuit={connectionState.trumpSuit as any}
                     />
                   </div>
                   
                   <Progress value={((connectionState.currentRound ?? 0) / (connectionState.totalRounds ?? 18)) * 100} />
                 </>
               )}
                <div className="relative">
                  {!isReconnecting ? (
                    <>
                      <MultiplayerPlayground 
                        playground={playground} 
                        allPlayers={allPlayers}
                        currentPlayerName={connectionState.currentPlayerName}
                        isPlayerTurn={isPlayerTurn}
                      />
                      {effectiveTeamSize === 1 && (
                        <div className="absolute top-1/2 right-4 -translate-y-1/2">
                          <CardHolder cards={cardHolderCards} />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="my-4 p-8 text-center bg-gray-50 border rounded-lg">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-600">Game paused during reconnection...</p>
                    </div>
                  )}
                </div>
                 
                 {!isReconnecting && (
                   <CompactCard title="Your Hand">
                      <CardHand
                          cards={displayHand}
                          onCardSelect={(cardIndex) => handlePlayCard(displayHand[cardIndex].id)}
                      />
                   </CompactCard>
                 )}

                {/* <div>
                  <h3 className="font-semibold mb-2">Connected Players</h3>
                  <div className="p-4 border rounded-md min-h-[100px] space-y-2">
                    {allPlayers.map(p => (
                      <div key={p.id} className={`flex items-center justify-between ${!p.connected ? "opacity-60" : ""}`}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{p.name}{p.id === playerId && " (You)"}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${p.connected ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{p.connected ? "Connected" : "Disconnected"}</span>
                      </div>
                    ))}
                  </div>
                </div> */}

             </div>
          </main>
          <Footer />
        </div>
        {/* {roundResult && (
          <Dialog open={!!roundResult} onOpenChange={isOpen => !isOpen && setRoundResult(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Round {connectionState.currentRound && connectionState.currentRound > 1 ? connectionState.currentRound - 1 : 1} Result</DialogTitle>
                <DialogDescription>{roundResult.winner.name} of {roundResult.winningTeam} won the round with <strong>{roundResult.pointsEarned} points</strong>.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">Analysis</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md border">{roundResult.analysis.roundAnalysis}</p>
                </div>
                <div className="text-sm font-semibold">Round Quality: {roundResult.analysis.roundQuality}/10</div>
              </div>
            </DialogContent>
          </Dialog>
        )} */}
      </>
    )
  }

  // Game Over View
  if (connectionState.matchStatus === "completed" && finalGameState) {
    const playerTeamData = finalGameState.teams[playerTeamId];
    const opponentTeamId = playerTeamId === 'team1' ? 'team2' : 'team1';
    const opponentTeamData = finalGameState.teams[opponentTeamId];
    const playerWon = playerTeamData.score > opponentTeamData.score;
    const opponentName = opponentTeamData.players.map((p: Player) => p.name).join(", ");
    
    // Delete match ID from localStorage for winners immediately
    // For losers, it will be deleted after answering the question
    if (playerWon) {
      localStorage.removeItem('incompleteMatchId');
      localStorage.removeItem('incompleteInviteCode');
    }
    
    const lastPlayerCard = lastPlayground.find(p => {
      const player = finalGameState.players.all.find((pl: Player) => pl.id === p.playerId);
      return player?.teamId === playerTeamId;
    })?.card
    const lastOpponentCard = lastPlayground.find(p => {
      const player = finalGameState.players.all.find((pl: Player) => pl.id === p.playerId);
      return player?.teamId === opponentTeamId;
    })?.card

    return (
      <>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
            <Card className="w-full max-w-2xl text-center">
              <CardHeader>
                <CardTitle className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  {playerWon ? "Congratulations!" : "Match Over"}
                </CardTitle>
                <CardDescription className="text-gray-500 md:text-xl">
                  {playerWon ? "Your team won the match!" : `Your team lost to ${opponentName}.`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8 my-8">
                  <div className="p-6 border rounded-md">
                    <h2 className="text-2xl font-bold mb-4">Your Team's Score</h2>
                    <p className="text-4xl font-bold text-green-600">{playerTeamData.score}</p>
                  </div>
                  <div className="p-6 border rounded-md">
                    <h2 className="text-2xl font-bold mb-4">Opponent's Score</h2>
                    <p className="text-4xl font-bold text-red-600">{opponentTeamData.score}</p>

                  </div>
                </div>

                {!playerWon && lastPlayerCard && lastOpponentCard && (
                    <div>
                      <h2 className="text-xl font-bold mb-4">Choose a card from the last round to answer a question for a chance to win.</h2>
                      <p className="text-sm text-gray-600 mb-4">Answer the question to continue to the next match.</p>
                      <CardChoice
                          cards={{
                              playerCard: lastPlayerCard,
                              aiCard: lastOpponentCard
                          }}
                          onSelect={async (selectedCard) => {
                              try {
                                  const response = await fetch('/api/game-stats', {
                                      method: 'POST',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({
                                          opponentName: opponentName,
                                          gameLevel: 'Multiplayer',
                                          userScore: playerTeamData.score,
                                          opponentScore: opponentTeamData.score,
                                          wonByQuestion: false,
                                          selectedCard: selectedCard,
                                          isMultiplayer: true,
                                          matchId: finalGameState.match.id,
                                      }),
                                  });

                                  if (response.ok) {
                                      const data = await response.json();
                                      if (data.question) {
                                          setQuestion(data.question);
                                          setShowQuestionDialog(true);
                                          if (data.gameStats) {
                                              setGameStatsId(data.gameStats._id);
                                          }
                                      } else if (data.didYouKnow) {
                                          setDidYouKnowTip(data.didYouKnow);
                                          setShowDidYouKnowDialog(true);
                                          setQuestionAnswered(true); // Show Play Again button after tip
                                          
                                          // Delete match ID from localStorage after getting tip
                                          localStorage.removeItem('incompleteMatchId');
                                          localStorage.removeItem('incompleteInviteCode');
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
                    </div>
                )}
                
                {(questionAnswered || playerWon) && (
                  <div className="mt-8">
                    <p className="text-sm text-gray-600 mb-4">
                      {playerWon ? "Ready for another match?" : "Question completed! Ready for another match?"}
                    </p>
                    <Button 
                      onClick={() => {
                        const playerCount = effectiveTeamSize * 2; // 2 teams * team size
                        router.push(`/connect?players=${playerCount}`);
                      }} 
                    >
                      Play Again
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
        <Dialog open={showQuestionDialog} onOpenChange={setShowQuestionDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Answer the Question</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-lg break-words whitespace-pre-wrap">{question?.question}</p>
              <div className="space-y-2">
                {question?.options.map((option: any) => (
                  <Button
                    key={option.id}
                    variant={selectedOptions.includes(option.id) ? "default" : "outline"}
                    onClick={() => {
                      if (Array.isArray(question.correctAnswer)) {
                        setSelectedOptions(prev => {
                          if (prev.includes(option.id)) {
                            return prev.filter(id => id !== option.id);
                          } else {
                            return [...prev, option.id];
                          }
                        });
                      } else {
                        setSelectedOptions([option.id]);
                      }
                    }}
                    className="w-full text-left justify-start py-2 px-4 h-auto min-h-[44px] break-words whitespace-pre-wrap"
                  >
                    {option.text}
                  </Button>
                ))}
              </div>
              {Array.isArray(question?.correctAnswer) && (
                <p className="text-sm text-gray-500">
                  Select {question.correctAnswer.length} correct answer{question.correctAnswer.length > 1 ? 's' : ''}
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
                    try {
                      const response = await fetch('/api/game-stats', {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          questionId: question.id,
                          selectedOption: selectedOptions,
                          gameId: gameStatsId
                        }),
                      });

                      if (response.ok) {
                        const data = await response.json();
                        if (data.correct) {
                          toast.success(data.message);
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
                    setSelectedOptions([]);
                    setQuestionAnswered(true);
                    
                    // Delete match ID from localStorage after answering question
                    localStorage.removeItem('incompleteMatchId');
                    localStorage.removeItem('incompleteInviteCode');
                  }}
                  disabled={Array.isArray(question?.correctAnswer) 
                    ? selectedOptions.length !== question.correctAnswer.length
                    : selectedOptions.length === 0}
                >
                  Submit Answer
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showDidYouKnowDialog} onOpenChange={setShowDidYouKnowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Fun Fact?</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-lg break-words whitespace-pre-wrap">{didYouKnowTip}</p>
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    setShowDidYouKnowDialog(false);
                    setQuestionAnswered(true); // Show Play Again button after closing tip
                    
                    // Delete match ID from localStorage after closing tip
                    localStorage.removeItem('incompleteMatchId');
                    localStorage.removeItem('incompleteInviteCode');
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Creator's Lobby View
  // Calculate team fullness and player presence robustly
  const team1Players = teams?.team1.players ?? [];
  const team2Players = teams?.team2.players ?? [];
  const isTeam1Full = team1Players.length >= (teams?.team1.totalSlots ?? 1);
  const isTeam2Full = team2Players.length >= (teams?.team2.totalSlots ?? 1);
  const allPlayersJoined = isTeam1Full && isTeam2Full && team1Players.length > 0 && team2Players.length > 0;
  const totalSlots = (teams?.team1.totalSlots ?? 0) + (teams?.team2.totalSlots ?? 0);
  const totalPlayers = team1Players.length + team2Players.length;
  const remainingPlayers = totalSlots - totalPlayers;
  const anyDisconnected = [...team1Players, ...team2Players].some(p => !p.connected);
  const disconnectedNames = [...team1Players, ...team2Players].filter(p => !p.connected).map(p => p.name);

  if (matchIdFromUrl) {
    let remainingText = "";
    if (allPlayersJoined && !anyDisconnected) {
      remainingText = "All players have joined! Starting game...";
    } else if (anyDisconnected) {
      remainingText = `Player${disconnectedNames.length > 1 ? 's' : ''} ${disconnectedNames.join(', ')} disconnected. Waiting for reconnection...`;
    } else {
      remainingText = `Waiting for ${remainingPlayers} more player(s) to join...`;
    }

    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-12">
          <Card>
            <CardHeader>
              <CardTitle>Multiplayer Lobby</CardTitle>
              <CardDescription>Match ID: {matchIdFromUrl}<br />{remainingText}{allPlayersJoined && (<div className="mt-2 flex items-center gap-2 text-green-600"><Loader2 className="h-4 w-4 animate-spin" /><span>Starting game...</span></div>)}</CardDescription>
            </CardHeader>
            <CardContent>
              {!allPlayersJoined && (
                <div className="mb-8 text-center">
                  <h3 className="font-semibold mb-2">Invite Code{effectiveTeamSize > 1 ? 's' : ''}</h3>
                  <p className="text-sm text-gray-500 mb-2">Share this code{effectiveTeamSize > 1 ? 's' : ''} with the next player{effectiveTeamSize > 1 ? 's' : ''} joining.</p>
                  <div className="max-w-xs mx-auto space-y-2">
                    {effectiveTeamSize > 1 ? (
                      <>
                        {team1InviteCode && (
                          <div className="flex items-center gap-2">
                            <Input value={team1InviteCode || ""} readOnly />
                            <Button variant="outline" size="icon" onClick={() => copyToClipboard(team1InviteCode)}><Copy className="h-4 w-4" /></Button>
                            <span className="text-xs text-gray-500 ml-2">Team 1</span>
                          </div>
                        )}
                        {team2InviteCode && (
                          <div className="flex items-center gap-2">
                            <Input value={team2InviteCode || ""} readOnly />
                            <Button variant="outline" size="icon" onClick={() => copyToClipboard(team2InviteCode)}><Copy className="h-4 w-4" /></Button>
                            <span className="text-xs text-gray-500 ml-2">Team 2</span>
                          </div>
                        )}
                      </>
                    ) : (
                      team1InviteCode && (
                        <div className="flex items-center gap-2">
                          <Input value={team2InviteCode || ""} readOnly />
                          <Button variant="outline" size="icon" onClick={() => copyToClipboard(team2InviteCode)}><Copy className="h-4 w-4" /></Button>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
              <div className="grid md:grid-cols-2 gap-8">
                {teams && (Object.values(teams) as Team[]).map((team: Team) => (
                  <div className="space-y-4" key={team.id}>
                    <h3 className="font-semibold">Team {team.id.slice(-1)}</h3>
                    <div className="p-4 border rounded-md min-h-[100px] space-y-2">
                      {team.players.map((p: Player) => (
                        <div key={p.name} className={`flex items-center justify-between ${!p.connected ? "opacity-60" : ""}`}>
                          <div className="flex items-center gap-2"><User className="h-4 w-4" /><span>{p.name}</span></div>
                          {!p.connected && (<span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800">Disconnected</span>)}
                        </div>
                      ))}
                      {team.players.length === 0 && <p className="text-sm text-gray-500">Waiting for players...</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  // Fallback view for users not in a game yet
  const hasInvite = Boolean(inviteCode || team1InviteCode)
  const isAuthenticated = status === "authenticated"
  const title = isAuthenticated && hasEntered ? "Waiting for Other Players" : "Join Multiplayer Game"
  const description = isAuthenticated
    ? (hasEntered
        ? "Waiting for other players to join..."
        : hasInvite
          ? "You're signed in. Click below if the connection doesn't start automatically."
          : "You're signed in. Provide an invite link to join a lobby.")
    : "Sign in to join the lobby."

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button onClick={handleConnect} className="w-full" disabled={!hasInvite && !isAuthenticated}>
              {isAuthenticated ? (hasInvite ? "Enter Lobby" : "Invite Required") : "Enter Lobby"}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function MultiplayerPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MultiplayerLobby />
        </Suspense>
    )
}
