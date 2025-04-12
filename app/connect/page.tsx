"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useLanguage } from "@/contexts/language-context"
import { LanguageSelector } from "@/components/language-selector"
import { ArrowLeft, Users, Loader2, UserCheck, Clock, AlertCircle } from "lucide-react"
import { SupportChat } from "@/components/support-chat"
import { Header } from "@/components/layout/header"

export default function WaitingRoomPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const totalPlayers = Number.parseInt(searchParams.get("players") || "4")

  // State for connected players (starting with 1 - the current user)
  const [connectedPlayers, setConnectedPlayers] = useState(1)
  const [timeWaiting, setTimeWaiting] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [stuckAtPlayer, setStuckAtPlayer] = useState(0)

  // Determine a random player to get stuck at (between 2 and totalPlayers-1)
  useEffect(() => {
    // We want to connect at least 2 players but not all players
    const minPlayers = Math.min(2, totalPlayers - 1)
    const maxPlayers = Math.max(2, totalPlayers - 1)
    const randomStuckPoint = Math.floor(Math.random() * (maxPlayers - minPlayers + 1)) + minPlayers
    setStuckAtPlayer(randomStuckPoint)
  }, [totalPlayers])

  // Simulate players connecting up to the stuck point
  useEffect(() => {
    // Don't add more players if we've reached the stuck point
    if (connectedPlayers >= stuckAtPlayer) return

    // Random time between 3-8 seconds for a new player to join
    const randomTime = Math.floor(Math.random() * 5000) + 3000

    const timer = setTimeout(() => {
      setConnectedPlayers((prev) => Math.min(prev + 1, stuckAtPlayer))
    }, randomTime)

    return () => clearTimeout(timer)
  }, [connectedPlayers, stuckAtPlayer])

  // Track waiting time
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeWaiting((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Helper function to format waiting message with pluralization
  const getWaitingMessage = () => {
    const playersLeft = totalPlayers - connectedPlayers
    const pluralSuffix = playersLeft > 1 ? "s" : ""
    return t("waitingRoom.waiting").replace("{0}", playersLeft.toString()).replace("{1}", pluralSuffix)
  }

  // Force game start (for demo purposes)
  const handleForceStart = () => {
    router.push(`/game`)
  }

  // Show waiting too long message after 30 seconds
  const showWaitingTooLong = timeWaiting > 30

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 container  mx-auto px-4 bg-gradient-to-b from-green-50 to-white md:px-8 py-12 ">
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">{t("waitingRoom.title")}</h1>
              <p className="text-gray-500 mt-2 text-lg">{getWaitingMessage()}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-6 border border-green-100">
              <h2 className="font-semibold text-lg flex items-center mb-3">
                <Users className="mr-2 h-5 w-5 text-green-600" />
                {t("waitingRoom.playerGame").replace("{0}", totalPlayers.toString())}
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span>{t("waitingRoom.playersConnected")}</span>
                  <span className="font-medium">
                    {connectedPlayers} / {totalPlayers}
                  </span>
                </div>
                <Progress value={(connectedPlayers / totalPlayers) * 100} className="h-2" />

                <div className="flex justify-between items-center text-sm mt-4">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-gray-500" />
                    {t("waitingRoom.timeWaiting")}
                  </span>
                  <span className="font-medium">{formatTime(timeWaiting)}</span>
                </div>
              </div>
            </div>

            {showWaitingTooLong && (
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200 flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-yellow-800">
                    It seems to be taking longer than usual to find players. You can continue waiting or try again
                    later.
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    For now you can play a 2 player game.
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-center">
              <Button variant="outline" onClick={() => router.push("/game-selection")} className="mr-4">
                {t("waitingRoom.cancel")}   
              </Button>

              {showWaitingTooLong ? (
                <Button className="bg-green-600 hover:bg-green-700" onClick={handleForceStart}>
                  Play 2 player game
                </Button>
              ) : (
                <Button className="bg-green-600 hover:bg-green-700" disabled={connectedPlayers < totalPlayers}>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("waitingRoom.waiting_btn")}
                </Button>
              )}
            </div>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>{t("waitingRoom.connectedPlayers")}</CardTitle>
                <CardDescription>{t("waitingRoom.waitingToJoin")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Current user (always connected) */}
                  <div className="flex items-center p-3 border rounded-lg bg-green-50">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex justify-between">
                        <span className="font-medium">{t("waitingRoom.you")}</span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                          {t("waitingRoom.connected")}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">{t("waitingRoom.readyToPlay")}</div>
                    </div>
                  </div>

                  {/* Other players */}
                  {Array.from({ length: totalPlayers - 1 }).map((_, index) => {
                    const isConnected = index < connectedPlayers - 1
                    const isConnecting = index === connectedPlayers - 1 && connectedPlayers < stuckAtPlayer
                    return (
                      <div
                        key={index}
                        className={`flex items-center p-3 border rounded-lg ${isConnected ? "bg-green-50" : ""}`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full ${
                            isConnected ? "bg-green-100" : "bg-gray-100"
                          } flex items-center justify-center`}
                        >
                          {isConnected ? (
                            <UserCheck className="h-5 w-5 text-green-600" />
                          ) : (
                            <Loader2 className={`h-5 w-5 text-gray-400 ${isConnecting ? "animate-spin" : ""}`} />
                          )}
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between">
                            <span className="font-medium">
                              {t("waitingRoom.player").replace("{0}", (index + 2).toString())}
                            </span>
                            <span
                              className={`text-xs ${
                                isConnected ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                              } px-2 py-0.5 rounded-full`}
                            >
                              {isConnected
                                ? t("waitingRoom.connected")
                                : isConnecting
                                  ? t("waitingRoom.connecting")
                                  : t("waitingRoom.waiting_btn")}
                            </span>
                          </div>
                          <div className="text-sm text-gray-500">
                            {isConnected
                              ? t("waitingRoom.readyToPlay")
                              : isConnecting
                                ? t("waitingRoom.connecting")
                                : "..."}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="py-6 border-t">
        <div className="container flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-gray-500">{t("footer.copyright")}</p>
        </div>
      </footer>

      {/* Support Chat Component */}
      <SupportChat />
    </div>
  )
}
