"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronRight, BookOpen } from "lucide-react"
import { LanguageSelector } from "@/components/language-selector"
import { useLanguage } from "@/contexts/language-context"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SupportChat } from "@/components/support-chat"
import { motion, AnimatePresence } from "framer-motion"
import { useHPOAuth } from "@/contexts/hpo-auth-context"
import { InfoCardsSection } from "@/components/info-cards-section"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ContactForm } from "@/components/contact-form"

export default function Home() {
  const { t, language } = useLanguage()
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
          <div className="container mx-auto max-w-7xl px-4 md:px-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2 text-center">
                  <h1 className="text-2xl sm:text-3xl md:text-5xl xl:text-6xl/none font-bold tracking-tighter flex items-center justify-center gap-2 px-2 sm:px-0">
                    <img 
                      src="/cards/spades/Q.webp" 
                      alt="Spade Q" 
                      className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 xl:w-12 xl:h-12 object-contain flex-shrink-0"
                    />
                    <span className="break-words">{t("hero.title")}</span>
                  </h1>
                  <h2 className="text-lg sm:text-xl md:text-3xl xl:text-4xl/none font-bold tracking-tighter px-2 sm:px-0">
                    {t("hero.subtitle")}
                  </h2>
                  <p className="max-w-[600px] text-gray-500 text-sm sm:text-base md:text-xl mx-auto px-4 sm:px-0">{t("hero.description")}</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex flex-col sm:flex-row gap-2 w-full max-w-md sm:max-w-none">
                    <motion.div
                      animate={{ scale: [1, 1, 1.06, 1] }}
                      transition={{ duration: 1.2, ease: "easeInOut", repeat: Infinity, repeatDelay: 2.5 }}
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full sm:w-auto"
                    >
                      <Link href="/game-selection">
                        <Button className="group inline-flex h-14 items-center justify-center rounded-xl bg-green-600 px-6 sm:px-12 text-base sm:text-lg font-semibold text-white shadow-lg transition-colors duration-300 ease-out hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 disabled:pointer-events-none disabled:opacity-50 w-full sm:w-auto">
                          {t("hero.playNow")} <ChevronRight className="ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6 transition-transform duration-300 group-hover:translate-x-1" />
                        </Button>
                      </Link>
                    </motion.div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="inline-flex h-14 items-center justify-center rounded-xl border border-input bg-background px-4 sm:px-12 text-sm sm:text-lg font-semibold shadow-sm transition-colors duration-300 w-full sm:w-auto"
                        >
                          {t("contact.button")} <img src="/cards/spades/A.webp" alt="Card" className="ml-2 sm:ml-3 h-5 w-5 sm:h-6 sm:w-6 object-contain" />
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
                  {/* Services button removed per request */}
                </div>
                {/* Removed services CTA to keep home localized and minimal */}
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

        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container mx-auto max-w-7xl px-4 md:px-6">
            <InfoCardsSection />
          </div>
        </section>

        {/* Removed About, Features, and CTA sections as requested */}
      </main>
      <Footer />
      <SupportChat />
    </div>
  )
}
