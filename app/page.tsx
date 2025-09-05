"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronRight, BookOpen, Target, Brain, Users, Heart, Store } from "lucide-react"
import { LanguageSelector } from "@/components/language-selector"
import { useLanguage } from "@/contexts/language-context"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SupportChat } from "@/components/support-chat"
import { motion, AnimatePresence } from "framer-motion"
import { useHPOAuth } from "@/contexts/hpo-auth-context"

export default function Home() {
  const { t } = useLanguage()
  const router = useRouter()
  const { isAuthenticated, isLoading } = useHPOAuth()
  const [shuffledCards, setShuffledCards] = useState<string[]>([])

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  const generateShuffledCards = (count = 4) => {
    const suits = ["clubs", "spades", "diamonds", "hearts"]
    const ranks = ["3", "4", "5", "6", "7", "A", "J", "K", "Q"]
    const allCards = suits.flatMap(suit => ranks.map(rank => `/cards/${suit}/${rank}.webp`))
    const shuffled = [...allCards]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled.slice(0, count)
  }

  useEffect(() => {
    // Only set up card animations if not authenticated (to avoid flash during redirect)
    if (!isAuthenticated) {
      // initial draw
      setShuffledCards(generateShuffledCards())

      // periodic reshuffle after page load
      const intervalId = setInterval(() => {
        setShuffledCards(generateShuffledCards())
      }, 8000)

      return () => clearInterval(intervalId)
    }
  }, [isAuthenticated])

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header variant="home" />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
        </main>
      </div>
    )
  }

  // Don't render the home page content if user is authenticated (they'll be redirected)
  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header variant="home" />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Redirecting to dashboard...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header variant="home" />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-green-50 to-white">
          <div className="container mx-auto px-4 md:px-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2 text-center">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none flex items-center justify-center gap-2">
                    <img 
                      src="/cards/spades/Q.webp" 
                      alt="Spade Q" 
                      className="w-8 h-8 sm:w-10 sm:h-10 xl:w-12 xl:h-12 object-contain"
                    />
                    {t("hero.title")}
                  </h1>
                  <h2 className="text-xl font-bold tracking-tighter sm:text-3xl xl:text-4xl/none">
                    {t("hero.subtitle")}
                  </h2>
                  <p className="max-w-[600px] text-gray-500 md:text-xl mx-auto">{t("hero.description")}</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex flex-row gap-2">
                    <motion.div
                      animate={{ scale: [1, 1, 1.06, 1] }}
                      transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity, repeatDelay: 2.5 }}
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link href="/game-selection">
                        <Button className="group inline-flex h-14 items-center justify-center rounded-xl bg-green-600 px-12 text-lg font-semibold text-white shadow-lg transition-colors duration-300 ease-out hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 disabled:pointer-events-none disabled:opacity-50">
                          {t("hero.playNow")} <ChevronRight className="ml-3 h-6 w-6 transition-transform duration-300 group-hover:translate-x-1" />
                        </Button>
                      </Link>
                    </motion.div>
                    <Link href="/info"><Button
                      variant="outline"
                      className="inline-flex h-14 items-center justify-center rounded-xl border border-input bg-background px-12 text-lg font-semibold shadow-sm transition-colors duration-300"
                    >
                      {t("hero.learnMore")} <BookOpen className="ml-3 h-6 w-6" />
                    </Button></Link>
                  </div>
                  <Link href="/info?openDialog=true"><Button
                    variant="outline"
                    className="inline-flex h-14 items-center justify-center rounded-xl border border-input bg-background px-12 text-lg font-semibold shadow-sm transition-colors duration-300"
                  >
                    {t("hero.readHealthInfo")} <Heart className="ml-3 h-6 w-6" />
                  </Button></Link>
                </div>
                <div className="flex justify-center mt-4">
                  <motion.div
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
{/*                     <Link href="/premium">
                      <Button className="inline-flex h-12 items-center justify-center rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 px-8 text-lg font-semibold text-white shadow-lg transition-all duration-300 hover:from-yellow-600 hover:to-orange-600 hover:shadow-xl">
                        <Store className="mr-2 h-5 w-5" />
                        Get Premium Offer
                      </Button>
                    </Link> */}
                  </motion.div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative h-[350px] w-[350px] rotate-6 overflow-hidden rounded-2xl bg-green-100 shadow-xl">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-3 p-4">
                                             <AnimatePresence mode="popLayout" initial={false}>
                         {shuffledCards.map((card, index) => {
                           const baseRotation = (index - 1) * 5
                           return (
                             <motion.div
                               key={card}
                               initial={{ opacity: 0, y: 10 }}
                               animate={{ opacity: 1, y: 0 }}
                               exit={{ opacity: 0, y: -10 }}
                               transition={{ duration: 0.35 }}
                             >
                               <motion.div
                                 className="h-32 w-24 rounded-lg bg-white shadow-md overflow-hidden"
                                 animate={{
                                   rotate: [baseRotation - 1.5, baseRotation + 1.5, baseRotation - 1.5],
                                   y: [0, -6, 0, 6, 0],
                                   scale: [1, 1.02, 1]
                                 }}
                                 transition={{
                                   duration: 6 + index,
                                   repeat: Infinity,
                                   repeatType: "mirror",
                                   ease: "easeInOut",
                                   delay: index * 0.25
                                 }}
                               >
                                 <img
                                   src={card}
                                   alt={`Card ${index + 1}`}
                                   className="w-full h-full object-cover"
                                 />
                               </motion.div>
                             </motion.div>
                           )
                         })}
                       </AnimatePresence>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
              <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">{t("about.title")}</h2>
              <p className="max-w-[85%] leading-normal text-gray-500 sm:text-lg sm:leading-7">
                {t("about.description")}
              </p>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-gray-50">
          <div className="container px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
              <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">{t("features.title")}</h2>
              <p className="max-w-[85%] leading-normal text-gray-500 sm:text-lg sm:leading-7 mb-8">
                {t("features.subtitle")}
              </p>
            </div>

            <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:grid-cols-3 lg:max-w-5xl">
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Target className="h-12 w-12 text-green-600 mb-4" />
                  <h3 className="text-lg font-bold">{t("features.purpose.title")}</h3>
                  <p className="text-sm text-gray-500 text-center mt-2">{t("features.purpose.description")}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Users className="h-12 w-12 text-green-600 mb-4" />
                  <h3 className="text-lg font-bold">{t("features.experts.title")}</h3>
                  <p className="text-sm text-gray-500 text-center mt-2">{t("features.experts.description")}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <Brain className="h-12 w-12 text-green-600 mb-4" />
                  <h3 className="text-lg font-bold">{t("features.fun.title")}</h3>
                  <p className="text-sm text-gray-500 text-center mt-2">{t("features.fun.description")}</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-green-600 text-white">
          <div className="container px-4 md:px-6">
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
              <h2 className="text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">{t("cta.title")}</h2>
              <p className="max-w-[85%] leading-normal text-white/80 sm:text-lg sm:leading-7">{t("cta.description")}</p>
              <Link href="/auth"><Button className="bg-white text-green-600 hover:bg-gray-100 mt-4">{t("cta.button")}</Button></Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <SupportChat />
    </div>
  )
}
