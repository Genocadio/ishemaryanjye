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

  // Get current round order for badge
  const getCurrentRoundOrder = (playerId: string) => {
    if (!playOrder || playOrder.length === 0) return ""
    const idx = playOrder.indexOf(playerId)
    return idx !== -1 ? idx + 1 : ""
  }

  // Responsive positioning with proper scaling
  const getPlayerPositions = () => {
    if (playerCount === 2) {
      // Two opponents facing each other horizontally
      return [
        { top: "50%", left: "20%", transform: "translateY(-50%)" }, // Left
        { top: "50%", right: "20%", transform: "translateY(-50%)" }, // Right
      ]
    } else if (playerCount === 4) {
      // Cross formation with players at cardinal directions
      const baseRadius = "35%" // Responsive radius that scales with container
      return [
        { top: `calc(50% - ${baseRadius})`, left: "50%", transform: "translateX(-50%)" }, // Top (P1)
        { top: "50%", right: `calc(50% - ${baseRadius})`, transform: "translateY(-50%)" }, // Right (P2)
        { bottom: `calc(50% - ${baseRadius})`, left: "50%", transform: "translateX(-50%)" }, // Bottom (P3)
        { top: "50%", left: `calc(50% - ${baseRadius})`, transform: "translateY(-50%)" }, // Left (P4)
      ]
    } else if (playerCount === 6) {
      // Hexagon formation with players at hexagon vertices
      const baseRadius = "40%" // Responsive radius that scales with container
      return [
        { top: `calc(50% - ${baseRadius})`, left: "50%", transform: "translateX(-50%)" }, // Top
        { top: `calc(50% - ${baseRadius} * 0.5)`, right: `calc(50% - ${baseRadius} * 0.866)`, transform: "translateY(-50%)" }, // Top-Right
        { bottom: `calc(50% - ${baseRadius} * 0.5)`, right: `calc(50% - ${baseRadius} * 0.866)`, transform: "translateY(-50%)" }, // Bottom-Right
        { bottom: `calc(50% - ${baseRadius})`, left: "50%", transform: "translateX(-50%)" }, // Bottom
        { bottom: `calc(50% - ${baseRadius} * 0.5)`, left: `calc(50% - ${baseRadius} * 0.866)`, transform: "translateY(-50%)" }, // Bottom-Left
        { top: `calc(50% - ${baseRadius} * 0.5)`, left: `calc(50% - ${baseRadius} * 0.866)`, transform: "translateY(-50%)" }, // Top-Left
      ]
    }
    return []
  }

  const positions = getPlayerPositions()

  // Special layout for 2 players: horizontal arrangement with responsive scaling
  if (playerCount === 2) {
    return (
      <Card className={`min-w-[120px] min-h-[80px] w-full h-full max-w-[300px] max-h-[200px] flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm border shadow-lg mx-auto ${className}`}>
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

        {/* Players positioned horizontally with responsive spacing and better centering */}
        <div className="flex items-center justify-center gap-3 sm:gap-4 md:gap-6 w-full h-full pt-6 pb-2 px-2 sm:px-4">
          {players.map((player, index) => {
            const isCurrentTurn = index === currentTurnIndex
            const roundOrder = getCurrentRoundOrder(player.id)
            return (
              <div key={player.id} className="flex flex-col items-center relative flex-1 max-w-16 sm:max-w-20">
                <div className="relative">
                  <div
                    className={`text-base sm:text-lg transition-all duration-300 ${
                      isCurrentTurn
                        ? "scale-110 drop-shadow-lg animate-pulse border-2 border-yellow-500 rounded-full p-1 bg-yellow-50"
                        : ""
                    }`}
                  >
                    👤
                  </div>
                  {/* Team indicator dot */}
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border border-white ${getTeamColor(player.team)}`}
                  />
                  {/* Player number badge */}
                  {roundOrder && (
                    <div
                      className={`absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white text-xs font-bold flex items-center justify-center transition-all duration-300 ${
                        isCurrentTurn ? "bg-yellow-500 text-white" : "bg-gray-500 text-white"
                      }`}
                    >
                      {roundOrder}
                    </div>
                  )}
                </div>
                <div
                  className={`mt-0.5 text-xs text-center max-w-full truncate transition-all duration-300 ${
                    isCurrentTurn ? "font-bold text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {player.id === currentPlayerId ? "You" : player.name}
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    )
  }

  // Layout for 4/6 players: cross formation for 4, hexagon for 6
  return (
    <Card className={`min-w-[200px] min-h-[200px] w-full h-full max-w-[500px] max-h-[500px] flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm border shadow-lg mx-auto ${className}`}>
      {/* Team A Score - Top Left */}
      <div className="absolute top-1 left-1">
        <div className="text-sm font-bold text-blue-600">{team1Score}</div>
      </div>

      {/* Team B Score - Top Right */}
      <div className="absolute top-1 right-1">
        <div className="text-sm font-bold text-red-600">{team2Score}</div>
      </div>

      {/* Center: Trump Suit and Round - positioned to not overlap with players */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-20">
        <div className="text-lg mb-1">
          {getTrumpSuitIcon(trumpSuit)}
        </div>
        <div className="text-xs font-semibold text-foreground">
          {currentRound}/{totalRounds}
        </div>
      </div>

      {/* Players positioned around the layout with responsive scaling and no overlapping */}
      {players.map((player, index) => {
        const position = positions[index]
        const isCurrentTurn = index === currentTurnIndex
        const roundOrder = getCurrentRoundOrder(player.id)

        return (
          <div key={player.id} className="absolute z-10" style={position}>
            <div className="relative flex flex-col items-center">
              {/* Person emoji with team indicator and player number badge */}
              <div className="relative">
                <div
                  className={`text-sm sm:text-base transition-all duration-300 ${
                    isCurrentTurn
                      ? "scale-110 drop-shadow-lg animate-pulse border-2 border-yellow-500 rounded-full p-1 bg-yellow-50"
                      : ""
                  }`}
                >
                  👤
                </div>

                {/* Team indicator dot */}
                <div
                  className={`absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full border border-white ${getTeamColor(player.team)}`}
                />

                {/* Player number badge */}
                {roundOrder && (
                  <div
                    className={`absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white text-xs font-bold flex items-center justify-center transition-all duration-300 ${
                      isCurrentTurn ? "bg-yellow-500 text-white" : "bg-gray-500 text-white"
                    }`}
                  >
                    {roundOrder}
                  </div>
                )}
              </div>

              {/* Player name with responsive text sizing */}
              <div
                className={`mt-0.5 text-xs sm:text-sm text-center max-w-16 sm:max-w-20 truncate transition-all duration-300 ${
                  isCurrentTurn ? "font-bold text-foreground" : "text-muted-foreground"
                }`}
              >
                {player.id === currentPlayerId ? "You" : player.name}
              </div>
            </div>
          </div>
        )
      })}
    </Card>
  )
}
