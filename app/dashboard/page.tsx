"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { Trophy, Award, Target, BarChart2, Calendar, Clock, Brain, Zap, ArrowLeft, UserCircle, ArrowRight, BookOpen, ChevronRight } from "lucide-react"
import { Header } from "@/components/layout/header"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { SupportChat } from "@/components/support-chat"
interface GameStats {
  totalGames: number
  wins: number
  losses: number
  winRate: number
  byDifficulty: {
    easy: { played: number; won: number }
    medium: { played: number; won: number }
    hard: { played: number; won: number }
  }
}

export default function DashboardPage() {
  const { t } = useLanguage()
  const { data: session } = useSession()
  const [gameStats, setGameStats] = useState<GameStats>({
    totalGames: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    byDifficulty: {
      easy: { played: 0, won: 0 },
      medium: { played: 0, won: 0 },
      hard: { played: 0, won: 0 }
    }
  })

  useEffect(() => {
    const fetchGameStats = async () => {
      try {
        const response = await fetch('/api/game-stats')
        if (response.ok) {
          const data = await response.json()
          
          // Process the game stats data
          const stats = data.gameStats || []
          const totalGames = stats.length
          const wins = stats.filter((game: any) => game.overallGameScore > 0).length
          const losses = totalGames - wins
          const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0

          // Calculate stats by difficulty
          const byDifficulty = {
            easy: { played: 0, won: 0 },
            medium: { played: 0, won: 0 },
            hard: { played: 0, won: 0 }
          }

          stats.forEach((game: any) => {
            const difficulty = game.gameLevel.toLowerCase()
            if (difficulty in byDifficulty) {
              byDifficulty[difficulty as keyof typeof byDifficulty].played++
              if (game.overallGameScore > 0) {
                byDifficulty[difficulty as keyof typeof byDifficulty].won++
              }
            }
          })

          setGameStats({
            totalGames,
            wins,
            losses,
            winRate,
            byDifficulty
          })
        }
      } catch (error) {
        console.error('Error fetching game stats:', error)
      }
    }

    if (session?.user) {
      fetchGameStats()
    }
  }, [session])

  return (
    <div className="flex min-h-screen flex-col">
      <Header variant="default" />

      <main className="flex-1 container max-w-5xl mx-auto px-4 bg-gradient-to-b from-green-50 to-white md:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          {/* <Link href="/game-selection" className="flex items-center text-sm text-gray-500 hover:text-gray-900">
            <ArrowRight className="mr-2 h-4 w-4" />
            {t("nav.getStarted")}
          </Link> */}

          <Link href="/profile" className="flex items-center text-sm text-green-600 hover:text-green-700">
            <UserCircle className="mr-2 h-4 w-4" />
            {t("nav.profile")}
          </Link>
        </div>

        <div className="space-y-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">{t("dashboard.title")}</h1>
            <p className="text-gray-500">{t("dashboard.subtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="bg-green-100 p-3 rounded-full mb-4">
                  <BarChart2 className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium mb-1">{t("dashboard.totalGames")}</h3>
                <p className="text-3xl font-bold">{gameStats.totalGames}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="bg-green-100 p-3 rounded-full mb-4">
                  <Trophy className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-lg font-medium mb-1">{t("dashboard.wins")}</h3>
                <p className="text-3xl font-bold">{gameStats.wins}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="bg-red-100 p-3 rounded-full mb-4">
                  <Target className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="text-lg font-medium mb-1">{t("dashboard.losses")}</h3>
                <p className="text-3xl font-bold">{gameStats.losses}</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="bg-blue-100 p-3 rounded-full mb-4">
                  <Award className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-medium mb-1">{t("dashboard.winRate")}</h3>
                <p className="text-3xl font-bold">{gameStats.winRate}%</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.byDifficulty")}</CardTitle>
                <CardDescription>{t("dashboard.statistics")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-400 mr-2"></div>
                      <span className="font-medium">{t("dashboard.easy")}</span>
                    </div>
                    <Badge variant="outline" className="bg-green-50">
                      {gameStats.byDifficulty.easy.won} / {gameStats.byDifficulty.easy.played}
                    </Badge>
                  </div>
                  <Progress
                    value={(gameStats.byDifficulty.easy.won / gameStats.byDifficulty.easy.played) * 100}
                    className="h-2 bg-gray-100"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                      <span className="font-medium">{t("dashboard.medium")}</span>
                    </div>
                    <Badge variant="outline" className="bg-yellow-50">
                      {gameStats.byDifficulty.medium.won} / {gameStats.byDifficulty.medium.played}
                    </Badge>
                  </div>
                  <Progress
                    value={(gameStats.byDifficulty.medium.won / gameStats.byDifficulty.medium.played) * 100}
                    className="h-2 bg-gray-100"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                      <span className="font-medium">{t("dashboard.hard")}</span>
                    </div>
                    <Badge variant="outline" className="bg-red-50">
                      {gameStats.byDifficulty.hard.won} / {gameStats.byDifficulty.hard.played}
                    </Badge>
                  </div>
                  <Progress
                    value={(gameStats.byDifficulty.hard.won / gameStats.byDifficulty.hard.played) * 100}
                    className="h-2 bg-gray-100"
                  />
                </div>
              </CardContent>
            </Card>

            {/* <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>{t("dashboard.recentGames")}</CardTitle>
                  <CardDescription>{t("dashboard.statistics")}</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="text-xs">
                  {t("dashboard.viewAll")}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {gameStats.recentGames.map((game) => (
                    <div key={game.id} className="flex items-center p-3 border rounded-lg">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          game.result === "win" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"
                        }`}
                      >
                        {game.result === "win" ? <Trophy className="h-5 w-5" /> : <Target className="h-5 w-5" />}
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between">
                          <span className="font-medium">
                            {game.result === "win" ? t("dashboard.won") : t("dashboard.lost")}
                          </span>
                          <span className="text-sm text-gray-500 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {game.date}
                          </span>
                        </div>
                        <div className="flex justify-between mt-1">
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant="outline"
                              className={
                                game.difficulty === "easy"
                                  ? "bg-green-50"
                                  : game.difficulty === "medium"
                                    ? "bg-yellow-50"
                                    : "bg-red-50"
                              }
                            >
                              {game.difficulty}
                            </Badge>
                            <span className="text-sm text-gray-500 flex items-center">
                              <Brain className="h-3 w-3 mr-1" />
                              {t("dashboard.score")}: {game.score}
                            </span>
                          </div>
                          <span className="text-sm text-gray-500 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {game.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card> */}
          </div>

          {/* <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.overview")}</CardTitle>
              <CardDescription>{t("dashboard.statistics")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="knowledge">
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="knowledge" className="flex items-center justify-center">
                    <Brain className="h-4 w-4 mr-2" />
                    {t("card.knowledge")}
                  </TabsTrigger>
                  <TabsTrigger value="action" className="flex items-center justify-center">
                    <Zap className="h-4 w-4 mr-2" />
                    {t("card.action")}
                  </TabsTrigger>
                  <TabsTrigger value="equality" className="flex items-center justify-center">
                    <Award className="h-4 w-4 mr-2" />
                    {t("card.equality")}
                  </TabsTrigger>
                  <TabsTrigger value="health" className="flex items-center justify-center">
                    <Target className="h-4 w-4 mr-2" />
                    {t("card.health")}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="knowledge">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">STI Prevention</span>
                        <span className="text-sm text-gray-500">85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Contraceptive Methods</span>
                        <span className="text-sm text-gray-500">70%</span>
                      </div>
                      <Progress value={70} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Reproductive Health</span>
                        <span className="text-sm text-gray-500">60%</span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="action">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Consent Discussion</span>
                        <span className="text-sm text-gray-500">75%</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Condom Usage</span>
                        <span className="text-sm text-gray-500">90%</span>
                      </div>
                      <Progress value={90} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Peer Pressure Resistance</span>
                        <span className="text-sm text-gray-500">65%</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="equality">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Gender Stereotypes</span>
                        <span className="text-sm text-gray-500">80%</span>
                      </div>
                      <Progress value={80} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Relationship Equality</span>
                        <span className="text-sm text-gray-500">85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Gender Rights</span>
                        <span className="text-sm text-gray-500">75%</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="health">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Health Warning Signs</span>
                        <span className="text-sm text-gray-500">70%</span>
                      </div>
                      <Progress value={70} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Reproductive Health Maintenance</span>
                        <span className="text-sm text-gray-500">65%</span>
                      </div>
                      <Progress value={65} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">STI Symptoms</span>
                        <span className="text-sm text-gray-500">80%</span>
                      </div>
                      <Progress value={80} className="h-2" />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card> */}

          <div className="flex justify-center gap-2">
          <Link href="/game-selection">
                  <Button className="inline-flex h-10 items-center justify-center rounded-md bg-green-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-green-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                    {t("hero.playNow")} <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                  </Link>
            <Link href="/info"><Button
                    variant="outline"
                    className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8"
                  >
                    {t("hero.learnMore")} <BookOpen className="ml-2 h-4 w-4" />
                  </Button></Link>
          </div>
        </div>
      </main>

      <footer className="py-6 border-t">
        <div className="container flex flex-col sm:flex-row justify-between items-center">
          <p className="text-xs text-gray-500">{t("footer.copyright")}</p>
        </div>
      </footer>
      <SupportChat />
    </div>
  )
}
