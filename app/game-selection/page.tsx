"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Bot } from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useHPOAuth } from "@/contexts/hpo-auth-context"
import { useLanguage } from "@/contexts/language-context"
import { SupportChat } from "@/components/support-chat"
import { useEffect } from "react"

export default function GameSelection() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useHPOAuth()
  const { t } = useLanguage()

  // Redirect unauthenticated users to home page
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, isLoading, router])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        </main>
      </div>
    )
  }

  // Don't render the content if user is not authenticated (they'll be redirected)
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Redirecting to home page...</p>
          </div>
        </main>
      </div>
    )
  }

  const handleMultiplayerSelection = (players: number) => {
    if (isAuthenticated) {
      router.push(`/connect?players=${players}`)
    } else {
      router.push(`/multiplayer?players=${players}`)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-gradient-to-b from-green-50 to-white">
        <div className="container max-w-5xl mx-auto px-4 md:px-8 py-12">
        <div className="space-y-12">
          <div className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{t("gameSelection.singlePlayer")}</h1>
              <p className="text-gray-500 md:text-xl max-w-[700px] mx-auto">
                {t("gameSelection.singlePlayerDescription")}
              </p>
            </div>
            <div className="flex justify-center">
              <Card
                className="cursor-pointer transition-all hover:border-green-500 w-full max-w-sm"
                onClick={() => router.push("/game")}
              >
                <CardHeader className="text-center">
                  <CardTitle>{t("gameSelection.playerVsAi")}</CardTitle>
                  <CardDescription>{t("gameSelection.quickGame")}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <div className="relative h-24 w-24 flex items-center justify-center">
                    <Bot className="h-16 w-16 text-green-600" />
                  </div>
                </CardContent>
                <CardFooter className="text-sm text-center text-gray-500 flex justify-center">
                  {t("gameSelection.playImmediately")}
                </CardFooter>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <div className="text-center space-y-2 mb-8">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{t("gameSelection.multiplayer")}</h2>
              <p className="text-gray-500 md:text-xl max-w-[700px] mx-auto">
                {t("gameSelection.multiplayerDescription")}
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              {[2, 4, 6].map((players) => (
                <Card
                  key={players}
                  className={
                    "cursor-pointer transition-all hover:border-green-500"
                  }
                  onClick={() => handleMultiplayerSelection(players)}
                >
                  <CardHeader className="text-center">
                    <CardTitle>{players} {t("gameSelection.players")}</CardTitle>
                    <CardDescription>
                      {players === 2
                        ? t("gameSelection.quickDuel")
                        : players === 4
                        ? t("gameSelection.standardTeamGame")
                        : t("gameSelection.largeGroupMatch")}
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
                    {isLoading ? t("gameSelection.loading") : isAuthenticated ? t("gameSelection.playWithFriends") : t("gameSelection.requiresSignIn")}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
        </div>
      </main>
      <Footer />
      <SupportChat />
    </div>
  )
}
