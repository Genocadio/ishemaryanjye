"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight as ChevronRightIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"

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

interface HealthContentProps {
  autoOpen?: boolean
}

export function HealthContent({ autoOpen = false }: HealthContentProps) {
  const { t, language } = useLanguage()
  const [gameContent, setGameContent] = useState<GameContentItem[]>([])
  const [loadingContent, setLoadingContent] = useState(false)
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

  // Auto-fetch content when component mounts if autoOpen is true
  useEffect(() => {
    if (autoOpen) {
      fetchGameContent()
    }
  }, [autoOpen])

  return (
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
                      {totalSubtopics} {totalSubtopics === 1 ? t("game.health.subtopic") : t("game.health.subtopics")}
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
                                            <h6 className="text-xs font-semibold text-gray-700 mb-1">{t("game.health.tags")}</h6>
                                            <div className="flex flex-wrap gap-1">
                                              {content.tags.map((tag: string, tagIndex: number) => (
                                                <span key={tagIndex} className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">#{tag}</span>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        <div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-1 border-t">
                                          <span>{t("game.health.type")} {content.content_type}</span>
                                          {content.card_association && <span>{t("game.health.card")} {content.card_association}</span>}
                                          <span>{t("game.health.views")} {content.view_count}</span>
                                        </div>
                                      </div>
                                    ))}
                                  <div className="bg-green-50 p-3 rounded border-l-4 border-green-500">
                                    <h6 className="text-sm font-semibold text-green-800 mb-2">{t("game.health.subtopicDetails")}</h6>
                                    <div className="flex flex-wrap gap-4 text-xs text-green-600">
                                      <span>{t("game.health.contentType")} {originalContent.content_type}</span>
                                      <span>{t("game.health.difficulty")} {originalContent.difficulty_level}</span>
                                      {originalContent.card_association && <span>{t("game.health.cardAssociation")} {originalContent.card_association}</span>}
                                      <span>{t("game.health.totalViews")} {items.reduce((sum: number, item: any) => sum + item.view_count, 0)}</span>
                                      <span>{t("game.health.items")} {items.length}</span>
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
                <p className="text-gray-600">{t("game.health.noContent")}</p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}
