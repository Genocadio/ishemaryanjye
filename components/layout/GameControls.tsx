"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LanguageSelector } from "@/components/language-selector"
import { useLanguage } from "@/contexts/language-context"
import { Settings, X, Users } from "lucide-react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Player, Teams } from "@/app/multiplayer/types"

interface GameControlsProps {
  teams: Teams | null
  currentPlayerId: string | null
  onExitGame: () => void
}

export function GameControls({ teams, currentPlayerId, onExitGame }: GameControlsProps) {
  const { t } = useLanguage()
  const { data: session } = useSession()
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)

  const handleExitGame = () => {
    onExitGame()
    router.push('/dashboard')
  }

  return (
    <>
      {/* Floating Game Controls Button */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          size="sm"
          className="h-10 w-10 rounded-full p-0 shadow-lg"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* Expanded Game Controls Panel */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-black/20" onClick={() => setIsExpanded(false)}>
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-xl border p-4 min-w-[280px]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Game Controls</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Language Selector */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Language</label>
              <LanguageSelector />
            </div>

            {/* Player Information */}
            {teams && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Players</span>
                </div>
                
                {/* Team A */}
                <div className="mb-3">
                  <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Team A</h4>
                  <div className="space-y-1">
                    {teams.team1.players.map((player: Player) => (
                      <div key={player.id} className="flex items-center gap-2 text-sm">
                        <div className={`w-2 h-2 rounded-full ${
                          player.id === currentPlayerId ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                        }`} />
                        <span className={player.id === currentPlayerId ? 'font-medium' : ''}>
                          {player.name}
                          {player.id === currentPlayerId && ' (You)'}
                        </span>
                        {player.id === currentPlayerId && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            Current Turn
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Team B */}
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-2">Team B</h4>
                  <div className="space-y-1">
                    {teams.team2.players.map((player: Player) => (
                      <div key={player.id} className="flex items-center gap-2 text-sm">
                        <div className={`w-2 h-2 rounded-full ${
                          player.id === currentPlayerId ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                        }`} />
                        <span className={player.id === currentPlayerId ? 'font-medium' : ''}>
                          {player.name}
                          {player.id === currentPlayerId && ' (You)'}
                        </span>
                        {player.id === currentPlayerId && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            Current Turn
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Exit Game Button */}
            <Button
              onClick={handleExitGame}
              variant="destructive"
              className="w-full"
            >
              Exit Game
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
