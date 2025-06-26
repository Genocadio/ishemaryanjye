"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Bot } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useSession } from "next-auth/react"
import { SupportChat } from "@/components/support-chat"

export default function GameSelection() {
  const router = useRouter()
  const { data: session } = useSession()

  const handleMultiplayerSelection = (players: number) => {
    if (session) {
      router.push(`/connect?players=${players}`)
    } else {
      router.push(`/multiplayer?players=${players}`)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container max-w-5xl mx-auto px-4 md:px-8 py-12">
        <div className="space-y-12">
          <div className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Single Player</h1>
              <p className="text-gray-500 md:text-xl max-w-[700px] mx-auto">
                Sharpen your skills against our AI opponent.
              </p>
            </div>
            <div className="flex justify-center">
              <Card
                className="cursor-pointer transition-all hover:border-green-500 w-full max-w-sm"
                onClick={() => router.push("/game")}
              >
                <CardHeader className="text-center">
                  <CardTitle>Player vs AI</CardTitle>
                  <CardDescription>A quick game to test your wit.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <div className="relative h-24 w-24 flex items-center justify-center">
                    <Bot className="h-16 w-16 text-green-600" />
                  </div>
                </CardContent>
                <CardFooter className="text-sm text-center text-gray-500 flex justify-center">
                  Play immediately
                </CardFooter>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Multiplayer</h2>
              <p className="text-gray-500 md:text-xl max-w-[700px] mx-auto">
                Challenge your friends in a game of Ishema Ryanjye.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {[2, 4, 6].map((players) => (
                <Card
                  key={players}
                  className={`transition-all ${
                    players > 2
                      ? "cursor-not-allowed opacity-50"
                      : "cursor-pointer hover:border-green-500"
                  }`}
                  onClick={
                    players === 2
                      ? () => handleMultiplayerSelection(players)
                      : undefined
                  }
                >
                  <CardHeader className="text-center">
                    <CardTitle>{players} Players</CardTitle>
                    <CardDescription>
                      {players === 2
                        ? "A quick duel"
                        : players === 4
                        ? "Standard team game"
                        : "Large group match"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <div className="relative h-24 w-24 flex items-center justify-center">
                      <Users className="h-16 w-16 text-green-600" />
                      <div className="absolute top-0 right-0 bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                        {players}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="text-sm text-center text-gray-500 flex justify-center">
                    {players > 2
                      ? "Coming soon"
                      : session
                      ? "Play with friends"
                      : "Requires sign in"}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <SupportChat />
    </div>
  )
}
