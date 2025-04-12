"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronRight, BookOpen, Target, Brain, Users } from "lucide-react"
import { LanguageSelector } from "@/components/language-selector"
import { useLanguage } from "@/contexts/language-context"
import { useState, useEffect } from "react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SupportChat } from "@/components/support-chat"

export default function Home() {
  const { t } = useLanguage()
  const [shuffledCards, setShuffledCards] = useState<string[]>([])

  useEffect(() => {
    const suits = ["clubs", "spades", "diamonds", "hearts"]
    const ranks = ["3", "4", "5", "6", "7", "A", "J", "K", "Q"]

    // Create all possible card combinations
    const allCards = suits.flatMap(suit =>
      ranks.map(rank => `/cards/${suit}/${rank}.webp`)
    )

    // Shuffle all cards
    const shuffled = [...allCards]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }

    // Take first 3 cards
    setShuffledCards(shuffled.slice(0, 3))
  }, [])

  return (
    <div className="flex min-h-screen flex-col">
      <Header variant="home" />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-green-50 to-white">
          <div className="container mx-auto px-4 md:px-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    {t("hero.title")}
                  </h1>
                  <p className="max-w-[600px] text-gray-500 md:text-xl">{t("hero.description")}</p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
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
              <div className="flex items-center justify-center">
                <div className="relative h-[350px] w-[350px] rotate-6 overflow-hidden rounded-2xl bg-green-100 shadow-xl">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="grid grid-cols-2 gap-4 p-6">
                      {shuffledCards.map((card, index) => (
                        <div
                          key={index}
                          className="h-32 w-24 rounded-lg bg-white shadow-md overflow-hidden"
                          style={{ transform: `rotate(${(index - 1) * 5}deg)` }}
                        >
                          <img
                            src={card}
                            alt={`Card ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      <div
                        className="h-32 w-24 rounded-lg bg-white shadow-md overflow-hidden flex items-center justify-center"
                        style={{ transform: "rotate(3deg)" }}
                      >
                        <div className="text-4xl font-bold">🎴</div>
                      </div>
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
