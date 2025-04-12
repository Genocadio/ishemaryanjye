import * as React from "react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getTrumpSuitIcon } from "@/lib/utils/gameUtils"
import { Suit } from "@/lib/gamer/aigamer"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface GameStatusProps {
  currentTurn: "player" | "character"
  selectedCharacter: string
  playerScore: number
  aiScore: number
  trumpSuit: Suit
  className?: string
}

export function GameStatus({
  currentTurn,
  selectedCharacter,
  playerScore,
  aiScore,
  trumpSuit,
  className
}: GameStatusProps) {
  return (
    <div className={cn("flex items-center justify-between md:justify-between w-full px-4", className)}>
      {/* Player Info - Left */}
      <div className="flex items-center gap-2 min-w-0">
        <Avatar className="hidden md:block h-8 w-8">
          <AvatarFallback className={cn(
            "bg-blue-100",
            currentTurn === "player" && "ring-2 ring-green-500"
          )}>
            {selectedCharacter === "Shema" ? "S" : "T"}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <span className={cn(
            "text-sm font-medium truncate",
            currentTurn === "player" && "text-green-600 font-bold"
          )}>
            You
          </span>
          <span className="text-xs text-gray-500">Score: {playerScore}</span>
        </div>
      </div>

      {/* Game Info - Center */}
      <div className="flex flex-col items-center gap-1 mx-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium hidden sm:inline">Trump:</span>
          {getTrumpSuitIcon(trumpSuit)}
        </div>
        <span className="text-xs text-gray-500 hidden sm:inline">
          {currentTurn === "player" ? "Your Turn" : `${selectedCharacter}'s Turn`}
        </span>
      </div>

      {/* Character Info - Right */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex flex-col items-end min-w-0">
          <span className={cn(
            "text-sm font-medium truncate",
            currentTurn === "character" && "text-green-600 font-bold"
          )}>
            {selectedCharacter}
          </span>
          <span className="text-xs text-gray-500">Score: {aiScore}</span>
        </div>
        <Avatar className="hidden md:block h-8 w-8">
          <AvatarFallback className={cn(
            "bg-red-100",
            currentTurn === "character" && "ring-2 ring-green-500"
          )}>
            {selectedCharacter === "Shema" ? "S" : "T"}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  )
} 