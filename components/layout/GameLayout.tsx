"use client"

import { Card } from "@/components/ui/card"
import { getTrumpSuitIcon } from "@/lib/utils/gameUtils"
import { Suit } from "@/lib/gamer/aigamer"

interface Player {
  id: string
  name: string
  avatar?: string
  team: "A" | "B"
}

interface GameLayoutProps {
  players: Player[]
  currentTurnIndex: number
  roundFirstPlayerIndex?: number
  className?: string
  playOrder?: string[]
  trumpSuit: Suit
  currentRound: number
  totalRounds: number
  team1Score: number
  team2Score: number
  currentPlayerId: string
}

export default function GameLayout({
  players,
  currentTurnIndex,
  roundFirstPlayerIndex = 0,
  className = "",
  playOrder = [],
  trumpSuit,
  currentRound,
  totalRounds,
  team1Score,
  team2Score,
  currentPlayerId,
}: GameLayoutProps) {
  const playerCount = players.length

  // Get player initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  // Get team color
  const getTeamColor = (team: "A" | "B") => {
    return team === "A" ? "bg-blue-500" : "bg-red-500"
  }

  // Position players based on count - exactly like PlayerTurnIndicator
  const getPlayerPositions = () => {
    if (playerCount === 2) {
      // Two opponents facing each other horizontally
      return [
        { top: "50%", left: "20%", transform: "translateY(-50%)" }, // Left
        { top: "50%", right: "20%", transform: "translateY(-50%)" }, // Right
      ]
    } else if (playerCount === 4) {
      // Square formation for 4 players - more stable and visible
      return [
        { top: "15%", left: "50%", transform: "translateX(-50%)" }, // Top
        { top: "50%", right: "15%", transform: "translateY(-50%)" }, // Right
        { bottom: "15%", left: "50%", transform: "translateX(-50%)" }, // Bottom
        { top: "50%", left: "15%", transform: "translateY(-50%)" }, // Left
      ]
    } else if (playerCount === 6) {
      // Hexagon formation for 6 players - more stable and visible
      return [
        { top: "10%", left: "50%", transform: "translateX(-50%)" }, // Top
        { top: "25%", right: "20%", transform: "translateY(-50%)" }, // Top-Right
        { bottom: "25%", right: "20%", transform: "translateY(-50%)" }, // Bottom-Right
        { bottom: "10%", left: "50%", transform: "translateX(-50%)" }, // Bottom
        { bottom: "25%", left: "20%", transform: "translateY(-50%)" }, // Bottom-Left
        { top: "25%", left: "20%", transform: "translateY(-50%)" }, // Top-Left
      ]
    }
    return []
  }

  const positions = getPlayerPositions()

  // For each player, show their index in the current playOrder (badge number)
  const getCurrentRoundOrder = (playerId: string) => {
    if (!playOrder || playOrder.length === 0) return ""
    const idx = playOrder.indexOf(playerId)
    return idx !== -1 ? idx + 1 : ""
  }

  // Special layout for 2 players: horizontal arrangement
  if (playerCount === 2) {
    return (
      <Card className={`min-w-[120px] min-h-[80px] flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm border shadow-lg ${className}`}>
        {/* Team A Score - Top Left */}
        <div className="absolute top-1 left-1">
          <div className="text-sm font-bold text-blue-600">{team1Score}</div>
        </div>

        {/* Team B Score - Top Right */}
        <div className="absolute top-1 right-1">
          <div className="text-sm font-bold text-red-600">{team2Score}</div>
        </div>

        {/* Center: Trump Suit and Round */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-20">
          <div className="text-lg mb-1">
            {getTrumpSuitIcon(trumpSuit)}
          </div>
          <div className="text-xs font-semibold text-foreground">
            {currentRound}/{totalRounds}
          </div>
        </div>

        {/* Players positioned horizontally */}
        <div className="flex items-center justify-center gap-6 w-full h-full pt-6 pb-2">
          {players.map((player, index) => {
            const isCurrentTurn = index === currentTurnIndex
            return (
              <div key={player.id} className="flex flex-col items-center relative">
                <div className="relative">
                  <div
                    className={`text-lg transition-all duration-300 ${
                      isCurrentTurn
                        ? "scale-110 drop-shadow-lg animate-pulse border-2 border-yellow-500 rounded-full p-1 bg-yellow-50"
                        : ""
                    }`}
                  >
                    👤
                  </div>
                  {/* Team indicator dot */}
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${getTeamColor(player.team)}`}
                  />
                </div>
                <div
                  className={`mt-0.5 text-xs text-center max-w-12 truncate transition-all duration-300 ${
                    isCurrentTurn ? "font-bold text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {player.id === currentPlayerId ? "You" : player.name}
                </div>
                <div
                  className={`text-xs px-1 py-0 rounded-full mt-0.5 transition-all duration-300 ${
                    isCurrentTurn ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {getCurrentRoundOrder(player.id)}
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    )
  }

  // Layout for 4/6 players: consistent with 2-player layout
  return (
    <Card className={`min-w-[150px] min-h-[150px] flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm border shadow-lg ${className}`}>
      {/* Team A Score - Top Left */}
      <div className="absolute top-1 left-1">
        <div className="text-sm font-bold text-blue-600">{team1Score}</div>
      </div>

      {/* Team B Score - Top Right */}
      <div className="absolute top-1 right-1">
        <div className="text-sm font-bold text-red-600">{team2Score}</div>
      </div>

      {/* Center: Trump Suit and Round */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-20">
        <div className="text-lg mb-1">
          {getTrumpSuitIcon(trumpSuit)}
        </div>
        <div className="text-xs font-semibold text-foreground">
          {currentRound}/{totalRounds}
        </div>
      </div>

      {/* Players positioned around the layout */}
      {players.map((player, index) => {
        const position = positions[index]
        const isCurrentTurn = index === currentTurnIndex

        return (
          <div key={player.id} className="absolute z-10" style={position}>
            <div className="relative flex flex-col items-center">
              {/* Person emoji with team indicator */}
              <div className="relative">
                <div
                  className={`text-sm transition-all duration-300 ${
                    isCurrentTurn
                      ? "scale-110 drop-shadow-lg animate-pulse border-2 border-yellow-500 rounded-full p-1 bg-yellow-50"
                      : ""
                  }`}
                >
                  👤
                </div>

                {/* Team indicator dot */}
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full border border-white ${getTeamColor(player.team)}`}
                />
              </div>

              {/* Player name */}
              <div
                className={`mt-0.5 text-xs text-center max-w-12 truncate transition-all duration-300 ${
                  isCurrentTurn ? "font-bold text-foreground" : "text-muted-foreground"
                }`}
              >
                {player.id === currentPlayerId ? "You" : player.name}
              </div>

              {/* Turn order number */}
              <div
                className={`text-xs px-1 py-0 rounded-full mt-0.5 transition-all duration-300 ${
                  isCurrentTurn ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-600"
                }`}
              >
                {getCurrentRoundOrder(player.id)}
              </div>
            </div>
          </div>
        )
      })}
    </Card>
  )
}
