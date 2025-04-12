"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/contexts/language-context"
import { LanguageSelector } from "@/components/language-selector"
import { Users, ArrowLeft } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useSession } from "next-auth/react"

export default function GameSelection() {
  const { t } = useLanguage()
  const router = useRouter()
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const { data: session } = useSession()

  const handleContinue = () => {
    if (selectedOption === 2) {
      router.push("/game")
    } else if (selectedOption === 4 || selectedOption === 6) {
      if (session) {
        router.push(`/connect?players=${selectedOption}`)
      } else {
        router.push(`/multiplayer?players=${selectedOption}`)
      }
    }
  }

  const getCardFooterText = (players: number) => {
    if (players === 2) {
      return "Play immediately"
    }
    return session ? "Play with your friends" : "Requires sign in"
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container max-w-5xl mx-auto px-4 md:px-8 py-12">
        <div className="space-y-6">
          <div className="text-center space-y-2 mb-8">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Choose Game Mode</h1>
            <p className="text-gray-500 md:text-xl max-w-[700px] mx-auto">
              Select the number of players for your Ishema Ryanjye game session
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {[2, 4, 6].map((players) => (
              <Card
                key={players}
                className={`cursor-pointer transition-all ${
                  selectedOption === players ? "border-green-500 ring-2 ring-green-500" : "hover:border-gray-300"
                }`}
                onClick={() => setSelectedOption(players)}
              >
                <CardHeader className="text-center">
                  <CardTitle>{players} Players</CardTitle>
                  <CardDescription>
                    {players === 2 ? "Quick game for two" : players === 4 ? "Standard game" : "Extended game"}
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
                  {getCardFooterText(players)}
                </CardFooter>
              </Card>
            ))}
          </div>

          <div className="flex justify-center mt-8">
            <Button
              size="lg"
              disabled={!selectedOption}
              onClick={handleContinue}
              className="bg-green-600 hover:bg-green-700 text-white px-8"
            >
              Continue
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
