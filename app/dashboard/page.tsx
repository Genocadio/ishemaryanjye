"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/contexts/language-context"
import { Trophy, Award, Target, BarChart2, Calendar, Clock, Brain, Zap, ArrowLeft, UserCircle, ArrowRight, BookOpen, ChevronRight, Store } from "lucide-react"
import { Header } from "@/components/layout/header"
import { useEffect, useState } from "react"
import { useHPOAuth } from "@/contexts/hpo-auth-context"
import { SupportChat } from "@/components/support-chat"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { InfoCardsSection } from "@/components/info-cards-section"
import { ContactForm } from "@/components/contact-form"
import { HealthContent } from "@/components/health-content"
interface GameStats {
  total_games: number
  wins: number
  losses: number
  win_rate: number
  total_marks: number
  average_marks_per_game: number
  current_streak: number
  longest_streak: number
  answer_accuracy: number
  last_played: string
  last_result: string
}

interface RecentGame {
  match_id: string
  date: string
  participants: number
  team: number
  won: boolean
  marks_earned: number
  card_assigned: string | null
  question_answered: boolean
  answer_correct: boolean
  game_status: string
}

interface PlayerStats {
  success: boolean
  player: {
    username: string
    player_name: string
    created_at: string
    last_active: string
  }
  statistics: GameStats
  recent_games: RecentGame[]
}

export default function DashboardPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const { player, isAuthenticated, isLoading } = useHPOAuth()
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [healthDialogOpen, setHealthDialogOpen] = useState(false)
  const [autoOpenHealth, setAutoOpenHealth] = useState(false)

  // Redirect unauthenticated users to home page
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    const fetchPlayerStats = async () => {
      if (!isAuthenticated || !player?.username) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await fetch(`${process.env.NEXT_PUBLIC_HPO_API_BASE_URL}/api/players/${player.username}/stats/`)
        
        if (response.ok) {
          const data = await response.json()
          setPlayerStats(data)
        } else {
          console.error('Failed to fetch player stats:', response.statusText)
        }
      } catch (error) {
        console.error('Error fetching player stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlayerStats()
  }, [isAuthenticated, player])

  // Reset autoOpenHealth after it's been used
  useEffect(() => {
    if (autoOpenHealth) {
      setAutoOpenHealth(false)
    }
  }, [autoOpenHealth])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header variant="default" />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        </main>
      </div>
    )
  }

  // Don't render the dashboard content if user is not authenticated (they'll be redirected)
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header variant="default" />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Redirecting to home page...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header variant="default" />

      <main className="flex-1 bg-gradient-to-b from-green-50 to-white">
        <div className="container max-w-5xl mx-auto px-4 md:px-8 py-12">
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

          <div className="flex justify-center gap-2">
          <Link href="/game-selection">
                  <Button className="inline-flex h-10 items-center justify-center rounded-md bg-green-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-green-700 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                    {t("hero.playNow")} <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                  </Link>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="inline-flex h-10 items-center justify-center rounded-md bg-gradient-to-r from-yellow-500 to-orange-500 px-6 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:from-yellow-600 hover:to-orange-600 hover:shadow-xl">
                  <img src="/cards/spades/A.webp" alt="Card" className="mr-2 h-4 w-4 object-contain" />
                  {t("contact.button")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] w-[95vw] sm:max-w-[80vw] sm:w-[80vw] max-h-[90vh] h-[90vh] sm:max-h-[85vh] sm:h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl sm:text-2xl font-bold mb-4 text-green-600">
                    {t("contact.form.title")}
                  </DialogTitle>
                </DialogHeader>
                <ContactForm />
              </DialogContent>
            </Dialog>
          </div>
          
          <div className="flex justify-center mt-4">
            <Dialog open={healthDialogOpen} onOpenChange={setHealthDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8"
                  onClick={() => {
                    setAutoOpenHealth(true)
                    setHealthDialogOpen(true)
                  }}
                >
                  Read Health Info <BookOpen className="ml-2 h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] w-[95vw] sm:max-w-[85vw] sm:w-[85vw] max-h-[90vh] h-[90vh] sm:max-h-[85vh] sm:h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl sm:text-2xl font-bold mb-4 text-green-600">
                    {t("game.health.modalTitle")}
                  </DialogTitle>
                </DialogHeader>
                <div className="container mx-auto max-w-7xl px-4 md:px-6">
                  <HealthContent autoOpen={autoOpenHealth} />
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-500">Loading statistics...</div>
            </div>
          ) : playerStats ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="bg-green-100 p-3 rounded-full mb-4">
                      <BarChart2 className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">{t("dashboard.totalGames")}</h3>
                    <p className="text-3xl font-bold">{playerStats.statistics.total_games}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="bg-green-100 p-3 rounded-full mb-4">
                      <Trophy className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">{t("dashboard.wins")}</h3>
                    <p className="text-3xl font-bold">{playerStats.statistics.wins}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="bg-red-100 p-3 rounded-full mb-4">
                      <Target className="h-6 w-6 text-red-500" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">{t("dashboard.losses")}</h3>
                    <p className="text-3xl font-bold">{playerStats.statistics.losses}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="bg-blue-100 p-3 rounded-full mb-4">
                      <Award className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">{t("dashboard.winRate")}</h3>
                    <p className="text-3xl font-bold">{Math.round(playerStats.statistics.win_rate)}%</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="bg-purple-100 p-3 rounded-full mb-4">
                      <Zap className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">Total Marks</h3>
                    <p className="text-3xl font-bold">{playerStats.statistics.total_marks}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="bg-orange-100 p-3 rounded-full mb-4">
                      <Brain className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">Accuracy</h3>
                    <p className="text-3xl font-bold">{Math.round(playerStats.statistics.answer_accuracy)}%</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="bg-yellow-100 p-3 rounded-full mb-4">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">Current Streak</h3>
                    <p className="text-3xl font-bold">{playerStats.statistics.current_streak}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="bg-indigo-100 p-3 rounded-full mb-4">
                      <Target className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-medium mb-1">Best Streak</h3>
                    <p className="text-3xl font-bold">{playerStats.statistics.longest_streak}</p>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-500">No statistics available</div>
            </div>
          )}

          {playerStats && playerStats.recent_games && playerStats.recent_games.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Games</CardTitle>
                  <CardDescription>Your latest game activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {playerStats.recent_games.slice(0, 5).map((game) => (
                      <div key={game.match_id} className="flex items-center p-3 border rounded-lg">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            game.won ? "bg-green-100 text-green-600" : "bg-red-100 text-red-500"
                          }`}
                        >
                          {game.won ? <Trophy className="h-5 w-5" /> : <Target className="h-5 w-5" />}
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between">
                            <span className="font-medium">
                              {game.won ? "Won" : "Lost"}
                            </span>
                            <span className="text-sm text-gray-500 flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(game.date).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between mt-1">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="bg-blue-50">
                                Team {game.team}
                              </Badge>
                              <span className="text-sm text-gray-500 flex items-center">
                                <Zap className="h-3 w-3 mr-1" />
                                {game.marks_earned} marks
                              </span>
                            </div>
                            <span className="text-sm text-gray-500 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {game.participants} players
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                  <CardDescription>Your gaming statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Win Rate</span>
                      <span className="text-sm text-gray-500">{Math.round(playerStats.statistics.win_rate)}%</span>
                    </div>
                    <Progress
                      value={playerStats.statistics.win_rate}
                      className="h-2 bg-gray-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Answer Accuracy</span>
                      <span className="text-sm text-gray-500">{Math.round(playerStats.statistics.answer_accuracy)}%</span>
                    </div>
                    <Progress
                      value={playerStats.statistics.answer_accuracy}
                      className="h-2 bg-gray-100"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Average Marks per Game</span>
                      <span className="text-sm text-gray-500">{playerStats.statistics.average_marks_per_game.toFixed(2)}</span>
                    </div>
                    <Progress
                      value={(playerStats.statistics.average_marks_per_game / 10) * 100}
                      className="h-2 bg-gray-100"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

        </div>

        {/* Learn More section at bottom */}
        <div className="flex justify-center mt-12">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-8"
              >
                {t("hero.learnMore")} <BookOpen className="ml-2 h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] w-[95vw] sm:max-w-[90vw] sm:w-[90vw] max-h-[90vh] h-[90vh] sm:max-h-[85vh] sm:h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl font-bold mb-4 text-green-600 text-center">
                  {t("game.health.modalTitle")}
                </DialogTitle>
              </DialogHeader>
                <div className="container mx-auto max-w-7xl px-4 md:px-6">
                  <InfoCardsSection 
                    excludeHealthCard={true}
                  />
                </div>
            </DialogContent>
          </Dialog>
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
