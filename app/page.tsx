"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronRight, BookOpen, Target, Brain, Users, Heart, Info, Loader2, ChevronDown, ChevronRight as ChevronRightIcon } from "lucide-react"
import { LanguageSelector } from "@/components/language-selector"
import { useLanguage } from "@/contexts/language-context"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SupportChat } from "@/components/support-chat"
import { motion, AnimatePresence } from "framer-motion"
import { useHPOAuth } from "@/contexts/hpo-auth-context"
import { Dialog, DialogContent, DialogHeader as UIDialogHeader, DialogTitle as UIDialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { CardViewer } from "@/components/card-viewer"

export default function Home() {
  const { t, language } = useLanguage()
  const router = useRouter()
  const { isAuthenticated, isLoading } = useHPOAuth()
  const [shuffledCards, setShuffledCards] = useState<string[]>([])

  interface Subtopic {
    subtopic: string
    info: string
    is_primary: boolean
  }

  interface GameContentItem {
    id: number
    title: string | null
    language: string
    age_group: string
    topic: string
    subtopic: string
    all_subtopics: Subtopic[]
    subtopics_count: number
    hierarchy: string
    info: string
    content_type: string
    difficulty_level: string
    status: string
    tags: string[]
    card_association: string | null
    view_count: number
    usage_count: number
    created_at: string
    updated_at: string
  }

  const [gameContent, setGameContent] = useState<GameContentItem[]>([])
  const [loadingContent, setLoadingContent] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null)
  const [expandedSubtopics, setExpandedSubtopics] = useState<Set<string>>(new Set())

  const formatInlineTextToReact = (text: string, keyPrefix: string) => {
    if (!text) return text
    const parts: (string | React.ReactElement)[] = []
    let partIndex = 0
    const processText = (input: string): (string | React.ReactElement)[] => {
      const result: (string | React.ReactElement)[] = []
      let current = input
      const boldRegex = /\*\*(.*?)\*\*/g
      let lastIndex = 0
      let match
      while ((match = boldRegex.exec(current)) !== null) {
        if (match.index > lastIndex) {
          result.push(current.slice(lastIndex, match.index))
        }
        result.push(
          <strong key={`${keyPrefix}-bold-${partIndex++}`} className="font-semibold">
            {match[1]}
          </strong>
        )
        lastIndex = match.index + match[0].length
      }
      if (lastIndex < current.length) {
        result.push(current.slice(lastIndex))
      }
      return result
    }
    let processedParts = processText(text)
    const finalParts = processedParts.map((part, index) => {
      if (typeof part === 'string') {
        const italicRegex = /(?<!\*)\*([^*]+)\*(?!\*)/g
        let italicProcessed = part.replace(italicRegex, (m, p1) => {
          return `<ITALIC_PLACEHOLDER_${index}>${p1}</ITALIC_PLACEHOLDER_${index}>`
        })
        italicProcessed = italicProcessed.replace(/\[(\d+)\]/g, (m, p1) => {
          return `<REF_PLACEHOLDER_${index}>${p1}</REF_PLACEHOLDER_${index}>`
        })
        italicProcessed = italicProcessed.replace(/"([^"]+)"/g, (m, p1) => {
          return `<QUOTE_PLACEHOLDER_${index}>${p1}</QUOTE_PLACEHOLDER_${index}>`
        })
        const segments = italicProcessed.split(/(<[A-Z_]+>.*?<\/[A-Z_]+>)/)
        return segments
          .map((segment, segIndex) => {
            if (segment.includes('ITALIC_PLACEHOLDER')) {
              const content = segment.replace(/<ITALIC_PLACEHOLDER_\d+>(.*?)<\/ITALIC_PLACEHOLDER_\d+>/, '$1')
              return (
                <em key={`${keyPrefix}-italic-${index}-${segIndex}`} className="italic">{content}</em>
              )
            } else if (segment.includes('REF_PLACEHOLDER')) {
              const content = segment.replace(/<REF_PLACEHOLDER_\d+>(.*?)<\/REF_PLACEHOLDER_\d+>/, '$1')
              return (
                <sup key={`${keyPrefix}-ref-${index}-${segIndex}`} className="text-blue-600 font-medium">[{content}]</sup>
              )
            } else if (segment.includes('QUOTE_PLACEHOLDER')) {
              const content = segment.replace(/<QUOTE_PLACEHOLDER_\d+>(.*?)<\/QUOTE_PLACEHOLDER_\d+>/, '$1')
              return (
                <span key={`${keyPrefix}-quote-${index}-${segIndex}`} className="italic text-gray-600">"{content}"</span>
              )
            } else {
              return segment || null
            }
          })
          .filter(Boolean)
      }
      return part
    }).flat()
    return finalParts
  }

  const formatText = (text: string) => {
    if (!text) return text
    const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
    const bulletSections = normalizedText.split(/(?=▪)/)
    return bulletSections
      .map((section, sectionIndex) => {
        if (!section.trim()) return null
        if (section.trim().startsWith('▪')) {
          const bulletText = section.replace(/^▪\s*/, '').trim()
          const lines = bulletText.split('\n').filter(line => line.trim())
          return (
            <div key={sectionIndex} className="flex items-start gap-2 mb-2">
              <span className="text-blue-600 font-bold mt-0.5">•</span>
              <div className="flex-1">
                {lines.map((line, lineIndex) => (
                  <div key={lineIndex} className={lineIndex > 0 ? 'mt-1' : ''}>
                    {formatInlineTextToReact(line.trim(), `${sectionIndex}-${lineIndex}`)}
                  </div>
                ))}
              </div>
            </div>
          )
        }
        const lines = section.split('\n').filter(line => line.trim())
        return lines
          .map((line, lineIndex) => (
            <div key={`${sectionIndex}-${lineIndex}`} className="mb-2">
              {formatInlineTextToReact(line.trim(), `${sectionIndex}-${lineIndex}`)}
            </div>
          ))
      })
      .flat()
      .filter(Boolean)
  }

  const getApiLanguage = (uiLanguage: string) => {
    switch (uiLanguage) {
      case 'en':
        return 'english'
      case 'fr':
        return 'french'
      case 'rw':
        return 'kinyarwanda'
      default:
        return 'english'
    }
  }

  const fetchGameContent = async () => {
    try {
      setLoadingContent(true)
      const apiLanguage = getApiLanguage(language)
      const response = await fetch(`/api/game-content?language=${apiLanguage}`)
      const data = await response.json()
      if (data.success && data.content && data.content.length > 0) {
        setGameContent(data.content)
      } else {
        if (apiLanguage !== 'english') {
          const fallbackResponse = await fetch('/api/game-content?language=english')
          const fallbackData = await fallbackResponse.json()
          if (fallbackData.success) {
            setGameContent(fallbackData.content)
          } else {
            toast.error('Failed to fetch content')
          }
        } else {
          toast.error('Failed to fetch content')
        }
      }
    } catch (error) {
      toast.error('Error loading content')
    } finally {
      setLoadingContent(false)
    }
  }

  const toggleTopic = (topic: string) => {
    setExpandedTopic(expandedTopic === topic ? null : topic)
    setExpandedSubtopics(new Set())
  }

  const toggleSubtopic = (subtopicKey: string) => {
    const newExpanded = new Set(expandedSubtopics)
    if (newExpanded.has(subtopicKey)) {
      newExpanded.delete(subtopicKey)
    } else {
      newExpanded.add(subtopicKey)
    }
    setExpandedSubtopics(newExpanded)
  }

  const rules = {
    en: {
      "Game Overview": [
        "The game follows standard card game rules.",
        "Can be played between 2, 4, 6 players.",
        "Cards contain different symbols (images) teaching reproductive health, gender-based violence, and promoting equality.",
        "This card game is mainly for youth aged 10-24."
      ],
      "Game Setup": [
        "It's good to read this book and other materials about reproductive health before playing.",
        "Teams can use this book and other approved materials to find answers."
      ],
      "Gameplay Rules": [
        "The goal is to answer questions correctly about the cards.",
        "When a team wins, they ask a question to the losing team.",
        "If the answer is correct, the goal is removed or becomes dead.",
        "If the answer is wrong, the goal is counted.",
        "When there's a tie, use another knowledgeable person in the team.",
        "You can ask any question related to the card's image or numbers.",
        "The game ends when all cards are played."
      ],
      "Special Card Rules": [
        "When Mr. takes Queen, the person with Queen asks questions.",
        "When three cards of the same suit are played first, the player asks questions.",
        "When Ace is played first, use rules similar to Mr. and Queen."
      ],
      "Scoring": [
        "Two goals are scored when a team can't play (15 points in 2 or 6 player game or 30 in 4 player game).",
        "Other goals can be created during the game.",
        "If teams tie, play again with the winning team scoring two goals."
      ]
    }
  }

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 justify-items-center md:justify-items-stretch">
              <Card className="hover:shadow-lg transition-shadow duration-300 w-full max-w-sm mx-auto md:max-w-none md:mx-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <Info className="h-5 w-5" />
                    {t("game.rules.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-6">{t("game.rules.description")}</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        {t("game.rules.button")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[95vw] w-[95vw] sm:max-w-[80vw] sm:w-[80vw] max-h-[90vh] h-[90vh] sm:max-h-[85vh] sm:h-[85vh] overflow-y-auto">
                      <UIDialogHeader>
                        <UIDialogTitle className="text-xl sm:text-2xl font-bold mb-4 text-green-600">{t("game.rules.title")}</UIDialogTitle>
                      </UIDialogHeader>
                      <div className="space-y-8">
                        {Object.entries(rules['en']).map(([section, items]) => (
                          <div key={section} className="space-y-2">
                            <h3 className="text-xl font-semibold text-gray-900">{section}</h3>
                            <div className="space-y-2 pl-4">
                              {(items as string[]).map((rule, index) => (
                                <p key={index} className="text-gray-700">
                                  {index + 1}. {rule}
                                </p>
                              ))}
            </div>
          </div>
                        ))}
            </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <Heart className="h-5 w-5" />
                    {t("game.health.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-6">{t("game.health.description")}</p>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          fetchGameContent()
                          setIsDialogOpen(true)
                        }}
                      >
                        {t("game.health.button")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[95vw] w-[95vw] sm:max-w-[85vw] sm:w-[85vw] max-h-[90vh] h-[90vh] sm:max-h-[85vh] sm:h-[85vh] overflow-y-auto">
                      <UIDialogHeader>
                        <UIDialogTitle className="text-xl sm:text-2xl font-bold mb-4 text-green-600">
                          Game Information & Educational Content
                        </UIDialogTitle>
                      </UIDialogHeader>
                      <div className="space-y-4">
                        {loadingContent ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                            <span className="ml-2 text-gray-600">{t("waitingRoom.waiting_btn")}</span>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {Object.keys(gameContent.reduce((acc: any, item: any) => { acc[item.topic] = acc[item.topic] || {}; item.all_subtopics.forEach((s: any) => { acc[item.topic][s.subtopic] = acc[item.topic][s.subtopic] || { items: [], subtopicData: s, originalContent: item }; if (!acc[item.topic][s.subtopic].items.find((e: any) => e.id === item.id)) { acc[item.topic][s.subtopic].items.push({ ...item, currentSubtopic: s }); } }); return acc }, {} as any)).length > 0 ? (
                              Object.entries(gameContent.reduce((acc: any, item: any) => { acc[item.topic] = acc[item.topic] || {}; item.all_subtopics.forEach((s: any) => { acc[item.topic][s.subtopic] = acc[item.topic][s.subtopic] || { items: [], subtopicData: s, originalContent: item }; if (!acc[item.topic][s.subtopic].items.find((e: any) => e.id === item.id)) { acc[item.topic][s.subtopic].items.push({ ...item, currentSubtopic: s }); } }); return acc }, {} as any)).map(([topic, subtopics]: any) => {
                                const totalSubtopics = Object.keys(subtopics).length
                                return (
                                  <div key={topic} className="border rounded-lg bg-white shadow-sm">
                                    <button
                                      onClick={() => toggleTopic(topic as string)}
                                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                                    >
                                      <div className="flex items-center gap-3">
                                        {expandedTopic === topic ? (
                                          <ChevronDown className="h-5 w-5 text-green-600" />
                                        ) : (
                                          <ChevronRightIcon className="h-5 w-5 text-green-600" />
                                        )}
                                        <h3 className="text-lg font-semibold text-gray-900">{topic as string}</h3>
                                      </div>
                                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                        {totalSubtopics} {totalSubtopics === 1 ? 'subtopic' : 'subtopics'}
                                      </span>
                                    </button>
                                    {expandedTopic === topic && (
                                      <div className="border-t bg-gray-50">
                                        {Object.entries(subtopics).map(([subtopicName, subtopicGroup]: any) => {
                                          const subtopicKey = `${topic}-${subtopicName}`
                                          const { items, subtopicData, originalContent } = subtopicGroup
                                          return (
                                            <div key={subtopicKey} className="border-b last:border-b-0">
                                              <button
                                                onClick={() => toggleSubtopic(subtopicKey)}
                                                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-100 transition-colors"
                                              >
                                                <div className="flex items-center gap-3">
                                                  {expandedSubtopics.has(subtopicKey) ? (
                                                    <ChevronDown className="h-4 w-4 text-blue-600" />
                                                  ) : (
                                                    <ChevronRightIcon className="h-4 w-4 text-blue-600" />
                                                  )}
                                                  <div>
                                                    <h4 className="font-medium text-gray-800">{subtopicName}</h4>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">{originalContent.language}</span>
                                                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">{originalContent.age_group}</span>
                                                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">{originalContent.difficulty_level}</span>
                                                      {subtopicData.is_primary && (
                                                        <span className="bg-green-200 text-green-800 px-1.5 py-0.5 rounded text-xs">Primary</span>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                              </button>
                                              {expandedSubtopics.has(subtopicKey) && (
                                                <div className="px-4 pb-4 bg-white">
                                                  <div className="pl-7 space-y-4">
                                                    <div className="text-gray-700 leading-relaxed">{formatText(subtopicData.info)}</div>
                                                    {items
                                                      .filter((content: any) => content.info !== subtopicData.info || content.title || (content.tags && content.tags.length > 0))
                                                      .map((content: any, itemIndex: number) => (
                                                        <div key={`${content.id}-${itemIndex}`} className="bg-gray-50 p-3 rounded border-l-4 border-green-400">
                                                          {content.title && (
                                                            <h5 className="font-medium text-gray-800 mb-2">{content.title}</h5>
                                                          )}
                                                          {content.info !== subtopicData.info && (
                                                            <div className="text-sm text-gray-600 mb-2">{formatText(content.info)}</div>
                                                          )}
                                                          {content.tags && content.tags.length > 0 && (
                                                            <div className="mb-2">
                                                              <h6 className="text-xs font-semibold text-gray-700 mb-1">Tags:</h6>
                                                              <div className="flex flex-wrap gap-1">
                                                                {content.tags.map((tag: string, tagIndex: number) => (
                                                                  <span key={tagIndex} className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">#{tag}</span>
                                                                ))}
                                                              </div>
                                                            </div>
                                                          )}
                                                          <div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-1 border-t">
                                                            <span>Type: {content.content_type}</span>
                                                            {content.card_association && <span>Card: {content.card_association}</span>}
                                                            <span>Views: {content.view_count}</span>
                                                          </div>
                                                        </div>
                                                      ))}
                                                    <div className="bg-green-50 p-3 rounded border-l-4 border-green-500">
                                                      <h6 className="text-sm font-semibold text-green-800 mb-2">Subtopic Details</h6>
                                                      <div className="flex flex-wrap gap-4 text-xs text-green-600">
                                                        <span>Content Type: {originalContent.content_type}</span>
                                                        <span>Difficulty: {originalContent.difficulty_level}</span>
                                                        {originalContent.card_association && <span>Card Association: {originalContent.card_association}</span>}
                                                        <span>Total Views: {items.reduce((sum: number, item: any) => sum + item.view_count, 0)}</span>
                                                        <span>Items: {items.length}</span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          )
                                        })}
                                      </div>
                                    )}
                                  </div>
                                )
                              })
                            ) : (
                              !loadingContent && (
                                <div className="text-center py-8">
                                  <p className="text-gray-600">No content available at the moment.</p>
                                </div>
                              )
                            )}
                          </div>
                        )}
                        <div className="flex justify-end pt-4">
                          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Close</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <BookOpen className="h-5 w-5" />
                    {t("game.cards.title")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-6">{t("game.cards.description")}</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full bg-green-600 hover:bg-green-700">{t("game.cards.button")}</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[95vw] w-[95vw] sm:max-w-[80vw] sm:w-[80vw] max-h-[90vh] h-[90vh] sm:max-h-[85vh] sm:h-[85vh] overflow-y-auto">
                      <UIDialogHeader>
                        <UIDialogTitle className="text-xl sm:text-2xl font-bold mb-4 text-green-600">{t("game.cards.title")}</UIDialogTitle>
                      </UIDialogHeader>
                      <CardViewer />
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Removed About, Features, and CTA sections as requested */}
      </main>
      <Footer />
      <SupportChat />
    </div>
  )
}
