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
    socket.send(JSON.stringify({ type: "play_card_request", payload: { cardId } }))
  }
  
  const copyToClipboard = (text: string | null) => {
    if(!text) return;
    navigator.clipboard.writeText(text).then(
      () => console.log("Copied to clipboard:", text),
      (err) => console.error("Failed to copy:", err)
    )
  }

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
    }

    ws.onclose = () => {
      console.log("WebSocket disconnected")
      setError("Connection closed. You have been disconnected.")
      setHasEntered(false)
      setSocket(null)
      if (!hasEntered) {
        toast.error("Failed to connect to the match. Please try again later.")
        setTimeout(() => router.back(), 1500)
      }
    }

    ws.onerror = (err) => {
      console.error("WebSocket error", err)
      setError("Connection error. Please try again.")
      if (!hasEntered) {
        toast.error("Failed to connect to the match. Please try again later.")
        setTimeout(() => router.back(), 1500)
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
          // Announce paused state if match is paused or any player is disconnected
          if (gameState.match.status === "paused") {
            const disconnectedPlayers = (gameState.players?.all ?? []).filter((p: Player) => !p.connected)
            if (disconnectedPlayers.length > 0) {
              toast.warning(`Match is paused. Waiting for ${disconnectedPlayers.map((p: Player) => p.name).join(', ')} to reconnect.`)
            } else {
              toast.warning("Match is paused.")
            }
          } else {
            toast.info("Reconnected successfully! Waiting for all players...");
          }
          setNotification(null)
          setHasEntered(true)
        } else if (type === "player_disconnected" || type === "player_returned") {
            const isDisconnect = type === "player_disconnected"
            console.log(`Player ${isDisconnect ? "disconnected" : "returned"}:`, payload)

            if (isDisconnect) {
              playNotificationSound("disconnect");
            } else {
              playNotificationSound("connect");
            }

            setTeams((prevTeams: Teams | null) => {
                if (!prevTeams) return null
                const newTeams = JSON.parse(JSON.stringify(prevTeams))
                const updatePlayer = (p: Player) => {
                    if (p.name === payload.playerName) {
                        return { ...p, connected: !isDisconnect }
                    }
                    return p
                }
                newTeams.team1.players = newTeams.team1.players.map(updatePlayer)
                newTeams.team2.players = newTeams.team2.players.map(updatePlayer)
                return newTeams
            })

            setConnectionState((prev: ConnectionState) => ({ ...prev, matchStatus: payload.matchStatus }))

            const notifText = isDisconnect 
                ? `${payload.playerName} has disconnected. The game is paused.`
                : `${payload.playerName} has returned! The game is still paused.`
            setNotification({ text: notifText, type: isDisconnect ? "warning" : "info" })
            if (isDisconnect) {
              toast.warning(`${payload.playerName} disconnected. Match paused.`)
            } else {
              toast.info(`${payload.playerName} reconnected. Waiting for all players...`)
            }
            if (!isDisconnect) setTimeout(() => setNotification(null), 5000)
        } else if (type === "match_resumed") {
          setConnectionState((prev: ConnectionState) => ({ ...prev, matchStatus: "active", currentPlayerId: payload.currentPlayerId, currentPlayerName: payload.currentPlayerName }))
          setNotification({ text: `${payload.resumedBy} has resumed the game. The match is now live!`, type: "success" })
          setTimeout(() => setNotification(null), 5000)
          toast.success("Match resumed! All players are connected.");
          setShowTurnIndicator(true);
          setAutoShowIndicator(true);
        } else if (type === "match_started") {
          updateStateFromGameState(payload.gameState)
          const startingPlayerName = payload.startingPlayer.name
          setConnectionState((prev: ConnectionState) => ({ ...prev, firstPlayerName: startingPlayerName }))
          setNotification({
            text: `Match started! ${startingPlayerName} plays first. Trump is ${payload.trumpSuit}.`,
            type: "success",
          })
          setTimeout(() => setNotification(null), 5000)
          if (payload.gameState.match) {
            setPlayOrder(payload.gameState.match.playOrder);
            setFirstPlayerIndex(payload.gameState.match.firstPlayerIndex);
            initialPlayOrderRef.current = payload.gameState.match.playOrder;
            localStorage.setItem('initialPlayOrder', JSON.stringify(payload.gameState.match.playOrder));
            localStorage.setItem('initialFirstPlayerIndex', payload.gameState.match.firstPlayerIndex.toString());
          }
          setShowTurnIndicator(true);
          setAutoShowIndicator(true);
        } else if (type === "turn_changed") {
          updateStateFromGameState(payload.gameState)
          const notifText = payload.isYourTurn
            ? "It's your turn to play!"
            : `It's ${payload.currentPlayer.name}'s turn.`
          setNotification({ text: notifText, type: payload.isYourTurn ? "success" : "info" })
          setTimeout(() => setNotification(null), 4000)
          if (payload.gameState.match) {
            setPlayOrder(payload.gameState.match.playOrder);
            setFirstPlayerIndex(payload.gameState.match.firstPlayerIndex);
          }
        } else if (type === "hand_dealt") {
          setHand(payload.hand)
        } else if (type === "card_played") {
          playNotificationSound("play");
          setLastPlayground(payload.gameState.gameplay.playground)
          updateStateFromGameState(payload.gameState)
          const { player, card } = payload.playedCard
          setNotification({
            text: `${player.name} played the ${card.value} of ${card.suit}.`,
            type: "info",
          })
          setTimeout(() => setNotification(null), 4000)
        } else if (type === "round_completed") {
          updateStateFromGameState(payload.gameState)
          setRoundResult(payload.roundResult)
        } else if (type === "match_ended") {
          localStorage.removeItem('incompleteMatchId');
          localStorage.removeItem('incompleteInviteCode');
          const { gameState } = payload
          updateStateFromGameState(gameState)
          setFinalGameState(gameState)
          setConnectionState(prev => ({ ...prev, matchStatus: "completed" }))
        } else if (type === "game_state_update") {
          // Client-side patch for a server bug.
          // After a round completes, the server sends a game_state_update with an incorrect
          // ID for the next player. We use the winner from the roundResult to correct this.
          if (roundResult) {
            const winner = roundResult.winner
            const patchedPayload = {
              ...payload,
              players: {
                ...payload.players,
                current: winner.id,
              },
            }
            updateStateFromGameState(patchedPayload)
          } else {
            updateStateFromGameState(payload)
          }
        } else if (message.error) {
          setError(message.error)
        }
      } catch (e) {
        console.error("Error parsing message", e)
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
        {showTurnIndicator && (
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
               {connectionState.matchStatus === "paused" && disconnectedPlayers.length > 0 && (
                 <div className="flex items-center gap-3 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-yellow-900">
                   <Loader2 className="h-5 w-5 animate-spin" />
                   <div className="text-sm font-medium">
                     Waiting for {disconnectedPlayers.map(p => p.name).join(', ')} to reconnect...
                   </div>
                 </div>
               )}
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
                <div className="relative">
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
                </div>
                 
                 <CompactCard title="Your Hand">
                    <CardHand
                        cards={displayHand}
                        onCardSelect={(cardIndex) => handlePlayCard(displayHand[cardIndex].id)}
                    />
                 </CompactCard>

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
                
                <Button onClick={() => router.push('/game-selection')} className="mt-8">
                  Play Again
                </Button>
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
                  onClick={() => setShowDidYouKnowDialog(false)}
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
