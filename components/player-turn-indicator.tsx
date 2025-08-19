"use client"

import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Users } from "lucide-react"

interface Player {
  id: string
  name: string
  avatar?: string
  team: "A" | "B"
}

interface PlayerTurnIndicatorProps {
  players: Player[]
  currentTurnIndex: number
  roundFirstPlayerIndex?: number // Make it optional with default
  className?: string
  playOrder?: string[]
}

export default function PlayerTurnIndicator({
  players,
  currentTurnIndex,
  roundFirstPlayerIndex = 0, // Add default value
  className = "",
  playOrder = [],
}: PlayerTurnIndicatorProps) {
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

  // Position players based on count
  const getPlayerPositions = () => {
    if (playerCount === 2) {
      // Two opponents facing each other
      return [
        { top: "20%", left: "50%", transform: "translateX(-50%)" }, // Top
        { bottom: "20%", left: "50%", transform: "translateX(-50%)" }, // Bottom
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

  // Special layout for 2 players: vertical stack, centered
  if (playerCount === 2) {
    return (
      <div className={`fixed inset-0 z-[100] flex items-center justify-center pointer-events-none`}>
        <Card className={`min-w-[320px] min-h-[320px] flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm border shadow-lg z-50 ${className}`} style={{ pointerEvents: 'auto' }}>
          {/* Header */}
          <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              <span>{playerCount} Players</span>
            </div>
            <Badge variant="outline" className="text-xs">
              Turn {currentTurnIndex + 1}
            </Badge>
          </div>
          <div className="flex flex-col items-center justify-center gap-12 w-full h-full pt-10 pb-6">
            {players.map((player, index) => {
              const isCurrentTurn = index === currentTurnIndex
              return (
                <div key={player.id} className="flex flex-col items-center relative">
                  <div className="relative">
                    <div
                      className={`text-4xl transition-all duration-300 ${
                        isCurrentTurn
                          ? "scale-110 drop-shadow-lg animate-pulse border-2 border-yellow-500 rounded-full p-2 bg-yellow-50"
                          : ""
                      }`}
                    >
                      👤
                    </div>
                    {/* Team indicator dot */}
                    <div
                      className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getTeamColor(player.team)}`}
                    />
                  </div>
                  <div
                    className={`mt-1 text-base text-center max-w-24 truncate transition-all duration-300 ${
                      isCurrentTurn ? "font-bold text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {player.name}
                  </div>
                  <div
                    className={`text-xs px-2 py-0.5 rounded-full mt-1 transition-all duration-300 ${
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
      </div>
    )
  }

  // Layout for 4/6 players: consistent with 2-player layout
  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center pointer-events-none`}>
      <Card className={`min-w-[400px] min-h-[400px] flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm border shadow-lg z-50 ${className}`} style={{ pointerEvents: 'auto' }}>
        {/* Header */}
        <div className="absolute top-2 left-2 right-2 flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="w-3 h-3" />
            <span>{playerCount} Players</span>
          </div>
          <Badge variant="outline" className="text-xs">
            Turn {currentTurnIndex + 1}
          </Badge>
        </div>

        {/* Current player indicator - centered */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-20">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg px-4 py-3 border shadow-lg">
            <div className="text-lg font-bold text-foreground">{players[currentTurnIndex]?.name}</div>
            <div className="text-xs text-muted-foreground mt-1">Current Turn</div>
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
                    className={`text-4xl transition-all duration-300 ${
                      isCurrentTurn
                        ? "scale-110 drop-shadow-lg animate-pulse border-2 border-yellow-500 rounded-full p-2 bg-yellow-50"
                        : ""
                    }`}
                  >
                    👤
                  </div>

                  {/* Team indicator dot */}
                  <div
                    className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getTeamColor(player.team)}`}
                  />
                </div>

                {/* Player name */}
                <div
                  className={`mt-1 text-base text-center max-w-24 truncate transition-all duration-300 ${
                    isCurrentTurn ? "font-bold text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {player.name}
                </div>

                {/* Turn order number */}
                <div
                  className={`text-xs px-2 py-0.5 rounded-full mt-1 transition-all duration-300 ${
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
    </div>
  )
}
