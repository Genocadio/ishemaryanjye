"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useLanguage } from "@/contexts/language-context"
import { BookOpen, Heart, Info, User, Loader2, ChevronDown, ChevronRight } from "lucide-react"
import { LanguageSelector } from "@/components/language-selector"
import Link from "next/link"
import { CardViewer } from "@/components/card-viewer"
import { DecorativeCards } from "@/components/decorative-cards"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { SupportChat } from "@/components/support-chat"
import { toast } from "sonner"
import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"

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

// Text formatting function
const formatText = (text: string) => {
  if (!text) return text;
  
  // First, normalize line breaks and split by them
  const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  // Split by bullet points first, then handle line breaks within each section
  const bulletSections = normalizedText.split(/(?=▪)/);
  
  return bulletSections.map((section, sectionIndex) => {
    if (!section.trim()) return null;
    
    // Handle bullet points
    if (section.trim().startsWith('▪')) {
      const bulletText = section.replace(/^▪\s*/, '').trim();
      const lines = bulletText.split('\n').filter(line => line.trim());
      
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
      );
    }
    
    // Handle regular text with line breaks
    const lines = section.split('\n').filter(line => line.trim());
    return lines.map((line, lineIndex) => {
      return (
        <div key={`${sectionIndex}-${lineIndex}`} className="mb-2">
          {formatInlineTextToReact(line.trim(), `${sectionIndex}-${lineIndex}`)}
        </div>
      );
    });
  }).flat().filter(Boolean);
};

// Format inline text to React components instead of HTML strings
const formatInlineTextToReact = (text: string, keyPrefix: string) => {
  if (!text) return text;
  
  // Split text by formatting patterns and create React elements
  const parts: (string | React.ReactElement)[] = [];
  let remainingText = text;
  let partIndex = 0;
  
  // Process the text and replace patterns with React components
  const processText = (input: string): (string | React.ReactElement)[] => {
    const result: (string | React.ReactElement)[] = [];
    let current = input;
    
    // Handle bold text **text**
    const boldRegex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;
    let match;
    
    while ((match = boldRegex.exec(current)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        result.push(current.slice(lastIndex, match.index));
      }
      // Add bold element
      result.push(
        <strong key={`${keyPrefix}-bold-${partIndex++}`} className="font-semibold">
          {match[1]}
        </strong>
      );
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < current.length) {
      result.push(current.slice(lastIndex));
    }
    
    return result;
  };
  
  // First pass: handle bold text
  let processedParts = processText(remainingText);
  
  // Second pass: handle other formatting on string parts only
  const finalParts = processedParts.map((part, index) => {
    if (typeof part === 'string') {
      // Handle italic text *text*
      const italicRegex = /(?<!\*)\*([^*]+)\*(?!\*)/g;
      let italicProcessed = part.replace(italicRegex, (match, p1) => {
        return `<ITALIC_PLACEHOLDER_${index}>${p1}</ITALIC_PLACEHOLDER_${index}>`;
      });
      
      // Handle references [1], [2] etc.
      italicProcessed = italicProcessed.replace(/\[(\d+)\]/g, (match, p1) => {
        return `<REF_PLACEHOLDER_${index}>${p1}</REF_PLACEHOLDER_${index}>`;
      });
      
      // Handle quotes
      italicProcessed = italicProcessed.replace(/"([^"]+)"/g, (match, p1) => {
        return `<QUOTE_PLACEHOLDER_${index}>${p1}</QUOTE_PLACEHOLDER_${index}>`;
      });
      
      // Split by placeholders and create React elements
      const segments = italicProcessed.split(/(<[A-Z_]+>.*?<\/[A-Z_]+>)/);
      
      return segments.map((segment, segIndex) => {
        if (segment.includes('ITALIC_PLACEHOLDER')) {
          const content = segment.replace(/<ITALIC_PLACEHOLDER_\d+>(.*?)<\/ITALIC_PLACEHOLDER_\d+>/, '$1');
          return <em key={`${keyPrefix}-italic-${index}-${segIndex}`} className="italic">{content}</em>;
        } else if (segment.includes('REF_PLACEHOLDER')) {
          const content = segment.replace(/<REF_PLACEHOLDER_\d+>(.*?)<\/REF_PLACEHOLDER_\d+>/, '$1');
          return <sup key={`${keyPrefix}-ref-${index}-${segIndex}`} className="text-blue-600 font-medium">[{content}]</sup>;
        } else if (segment.includes('QUOTE_PLACEHOLDER')) {
          const content = segment.replace(/<QUOTE_PLACEHOLDER_\d+>(.*?)<\/QUOTE_PLACEHOLDER_\d+>/, '$1');
          return <span key={`${keyPrefix}-quote-${index}-${segIndex}`} className="italic text-gray-600">"{content}"</span>;
        } else {
          return segment || null;
        }
      }).filter(Boolean);
    }
    return part;
  }).flat();
  
  return finalParts;
};

function GameInfoContent() {
  const { t, language } = useLanguage()
  const searchParams = useSearchParams()
  const [gameContent, setGameContent] = useState<GameContentItem[]>([])
  const [loading, setLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null)
  const [expandedSubtopics, setExpandedSubtopics] = useState<Set<string>>(new Set())
  
  console.log('Current language:', language);
  console.log('Download prompt translation:', t("game.health.downloadPrompt"));
  console.log('Cancel translation:', t("common.cancel"));
  console.log('Download translation:', t("common.download"));

  // Check if dialog should be opened automatically from query parameter
  useEffect(() => {
    const shouldOpenDialog = searchParams.get('openDialog')
    if (shouldOpenDialog === 'true') {
      fetchGameContent()
      setIsDialogOpen(true)
    }
  }, [searchParams])

  const fetchGameContent = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/game-content')
      const data = await response.json()
      if (data.success) {
        setGameContent(data.content)
        // Don't auto-expand any topics - let them be collapsed initially
      } else {
        toast.error('Failed to fetch content')
      }
    } catch (error) {
      console.error('Error fetching game content:', error)
      toast.error('Error loading content')
    } finally {
      setLoading(false)
    }
  }

  const toggleTopic = (topic: string) => {
    // If clicking on already expanded topic, collapse it
    // If clicking on different topic, expand it and collapse others
    setExpandedTopic(expandedTopic === topic ? null : topic)
    // Also collapse all subtopics when changing topics
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

  // Group content by topic, then by subtopic
  const groupedContent = gameContent.reduce((acc, item) => {
    if (!acc[item.topic]) {
      acc[item.topic] = {}
    }
    
    // Create separate sections for each subtopic
    item.all_subtopics.forEach(subtopic => {
      if (!acc[item.topic][subtopic.subtopic]) {
        acc[item.topic][subtopic.subtopic] = {
          items: [],
          subtopicData: subtopic,
          originalContent: item
        }
      }
      
      // Only add the item once per subtopic, using the current subtopic's data
      if (!acc[item.topic][subtopic.subtopic].items.find(existingItem => existingItem.id === item.id)) {
        acc[item.topic][subtopic.subtopic].items.push({
          ...item,
          currentSubtopic: subtopic
        })
      }
    })
    
    return acc
  }, {} as Record<string, Record<string, {
    items: Array<GameContentItem & { currentSubtopic: Subtopic }>,
    subtopicData: Subtopic,
    originalContent: GameContentItem
  }>>)

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
    },
    fr: {
      "Aperçu du Jeu": [
        "Le jeu suit les règles standard des jeux de cartes.",
        "Peut être joué entre 2, 4, 6 joueurs.",
        "Les cartes contiennent différents symboles (images) enseignant la santé reproductive, la violence basée sur le genre, et promouvant l'égalité.",
        "Ce jeu de cartes est principalement pour les jeunes de 10-24 ans."
      ],
      "Préparation du Jeu": [
        "Il est bon de lire ce livre et d'autres documents sur la santé reproductive avant de jouer.",
        "Les équipes peuvent utiliser ce livre et d'autres documents approuvés pour trouver des réponses."
      ],
      "Règles de Jeu": [
        "Le but est de répondre correctement aux questions sur les cartes.",
        "Quand une équipe gagne, elle pose une question à l'équipe perdante.",
        "Si la réponse est correcte, le but est retiré ou devient mort.",
        "Si la réponse est incorrecte, le but est compté.",
        "En cas d'égalité, utilisez une autre personne compétente dans l'équipe.",
        "Vous pouvez poser n'importe quelle question liée à l'image ou aux nombres sur la carte.",
        "Le jeu se termine lorsque toutes les cartes sont jouées."
      ],
      "Règles des Cartes Spéciales": [
        "Quand Monsieur prend la Reine, la personne avec la Reine pose des questions.",
        "Quand trois cartes de la même couleur sont jouées en premier, le joueur pose des questions.",
        "Quand l'As est joué en premier, utilisez des règles similaires à Monsieur et Reine."
      ],
      "Marquage des Points": [
        "Deux buts sont marqués quand une équipe ne peut pas jouer (15 points dans un jeu de 2 ou 6 joueurs ou 30 dans un jeu de 4 joueurs).",
        "D'autres buts peuvent être créés pendant le jeu.",
        "Si les équipes sont à égalité, rejouez avec l'équipe gagnante marquant deux buts."
      ]
    },
    rw: {
      "Ibyerekeye Umukino": [
        "Umukino w'aya makarita ukurikiza amabwiriza y'amakarita asanzwe.",
        "Uyu mukino ushobora gukinwa hagati y'abantu babiri 2, 4, 6.",
        "Aya makarita ariho ibimenyetso (amashusho) bitandukanye byose byigisha ubuzima bw'imyororokere, ihohotera rishingiye ku gitsina ndetse no guteza imbere uburinganire.",
        "Uyu mukino w'amakarita 'Ishema Ryanjye' ugenewe cyane cyane urubyiruko rufite y'imyaka hagati 10 na 24."
      ],
      "Gutegura Umukino": [
        "Ni byiza gukina uyu mukino wabanje gusoma aka gatabo n'ibindi bitabo byigisha ubuzima bw'imyororokere.",
        "Ikipe ibaza cyangwa umuntu ubaza yemerewe gukoresha aka gatabo k'Ishema Ryanjye n'ibindi bitabo byizewe."
      ],
      "Amabwiriza y'Umukino": [
        "Igitego ni ugusubiza neza ibibazo bijyanye n'amakarita.",
        "Igihe ikipe itsinze ibaza ikipe itsinzwe ikibazo.",
        "Iyo bagisubije neza igitego kiburizwamo/kivaho cyangwa kiba gipfuye.",
        "Iyo kibananiye nibwo habarwa igitego.",
        "Igihe ikibazo kinaniye uwabajijwe, hifashishwa undi muntu ukizi mu ikipe.",
        "Wemerewe kubaza ikibazo cyose ushaka gifite aho gihurira n'igishushanyo cyangwa imibare bigaragara ku ikarita.",
        "Umukino urangiye igihe amakarita yose ashize."
      ],
      "Amabwiriza y'Amakarita Asanzwe": [
        "Igihe Bwana yafashe Seti, uwari ufite Bwana wishe Seti abaza ikibazo.",
        "Igihe nganda tatu y'iturufu iriye ku mukino wa mbere, uwarishije nganda tatu abaza ikibazo.",
        "Igihe hariye ipigu ku mukino wa mbere, hakoreshwa amategeko cyangwa habazwa ibibazo ku makarita yicanye."
      ],
      "Gupima Ibitego": [
        "Ibitego bibiri bibaho iyo mukinnye umukino ukarangira ikipe ntibashe kuwuva (amanota 15 mu mukino w'abantu babiri  na batandatu cyangwa 30 mu mukino w'abantu 4).",
        "Ibindi bitego biboneka hagati mu mukino.",
        "Igihe ikipe zombi zinganyije amanota umukino urangiye, basubiramo umukino ariko ikipe itsinze ibara ibitego bibiri."
      ]
    }
  }

  // Define a deck of cards
  const deck = [
    "2H", "3H", "4H", "5H", "6H", "7H", "8H", "9H", "10H", "JH", "QH", "KH", "AH",
    "2D", "3D", "4D", "5D", "6D", "7D", "8D", "9D", "10D", "JD", "QD", "KD", "AD",
    "2C", "3C", "4C", "5C", "6C", "7C", "8C", "9C", "10C", "JC", "QC", "KC", "AC",
    "2S", "3S", "4S", "5S", "6S", "7S", "8S", "9S", "10S", "JS", "QS", "KS", "AS"
  ];

  // Function to randomly select two cards
  const selectRandomCards = () => {
    const shuffledDeck = [...deck].sort(() => 0.5 - Math.random());
    return shuffledDeck.slice(0, 2);
  };

  // Example usage of the random card selection
  const [card1, card2] = selectRandomCards();
  console.log(`Selected cards: ${card1}, ${card2}`);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <Header />
      <main className="flex-1 bg-gradient-to-b from-green-50 to-white">
        <div className="relative w-full">
          {/* Decorative cards */}
          <DecorativeCards />
          
          <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-12">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{t("game.title")}</h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t("game.title")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="hover:shadow-lg transition-shadow duration-300">
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
                      <DialogHeader>
                        <DialogTitle className="text-xl sm:text-2xl font-bold mb-4 text-green-600">{t("game.rules.title")}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-8">
                        {Object.entries(rules[language]).map(([section, items]) => (
                          <div key={section} className="space-y-2">
                            <h3 className="text-xl font-semibold text-gray-900">{section}</h3>
                            <div className="space-y-2 pl-4">
                              {items.map((rule, index) => (
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
                          console.log('Dialog opened with language:', language);
                          fetchGameContent()
                          setIsDialogOpen(true)
                        }}
                      >
                        Read Information
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[95vw] w-[95vw] sm:max-w-[85vw] sm:w-[85vw] max-h-[90vh] h-[90vh] sm:max-h-[85vh] sm:h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-xl sm:text-2xl font-bold mb-4 text-green-600">
                          Game Information & Educational Content
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {loading ? (
                          <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                            <span className="ml-2 text-gray-600">Loading content...</span>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {Object.keys(groupedContent).length > 0 ? (
                              Object.entries(groupedContent).map(([topic, subtopics]) => {
                                const totalSubtopics = Object.keys(subtopics).length;
                                return (
                                  <div key={topic} className="border rounded-lg bg-white shadow-sm">
                                    {/* Topic Header */}
                                    <button
                                      onClick={() => toggleTopic(topic)}
                                      className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                                    >
                                      <div className="flex items-center gap-3">
                                        {expandedTopic === topic ? (
                                          <ChevronDown className="h-5 w-5 text-green-600" />
                                        ) : (
                                          <ChevronRight className="h-5 w-5 text-green-600" />
                                        )}
                                        <h3 className="text-lg font-semibold text-gray-900">{topic}</h3>
                                      </div>
                                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                                        {totalSubtopics} {totalSubtopics === 1 ? 'subtopic' : 'subtopics'}
                                      </span>
                                    </button>
                                    
                                    {/* Topic Content - Subtopics */}
                                    {expandedTopic === topic && (
                                      <div className="border-t bg-gray-50">
                                        {Object.entries(subtopics).map(([subtopicName, subtopicGroup]) => {
                                          const subtopicKey = `${topic}-${subtopicName}`;
                                          const { items, subtopicData, originalContent } = subtopicGroup;
                                          const firstItem = items[0]; // Get first item for metadata
                                          return (
                                            <div key={subtopicKey} className="border-b last:border-b-0">
                                              {/* Subtopic Header */}
                                              <button
                                                onClick={() => toggleSubtopic(subtopicKey)}
                                                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-100 transition-colors"
                                              >
                                                <div className="flex items-center gap-3">
                                                  {expandedSubtopics.has(subtopicKey) ? (
                                                    <ChevronDown className="h-4 w-4 text-blue-600" />
                                                  ) : (
                                                    <ChevronRight className="h-4 w-4 text-blue-600" />
                                                  )}
                                                  <div>
                                                    <h4 className="font-medium text-gray-800">
                                                      {subtopicName}
                                                    </h4>
                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                                        {originalContent.language}
                                                      </span>
                                                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                                                        {originalContent.age_group}
                                                      </span>
                                                      <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs">
                                                        {originalContent.difficulty_level}
                                                      </span>
                                                      {subtopicData.is_primary && (
                                                        <span className="bg-green-200 text-green-800 px-1.5 py-0.5 rounded text-xs">
                                                          Primary
                                                        </span>
                                                      )}
                                                    </div>
                                                  </div>
                                                </div>
                                              </button>
                                              
                                              {/* Subtopic Content */}
                                              {expandedSubtopics.has(subtopicKey) && (
                                                <div className="px-4 pb-4 bg-white">
                                                  <div className="pl-7 space-y-4">
                                                    {/* Subtopic specific info */}
                                                    <div className="text-gray-700 leading-relaxed">
                                                      {formatText(subtopicData.info)}
                                                    </div>
                                                    
                                                    {/* Show additional content items only if they have different/additional information */}
                                                    {items.filter(content => 
                                                      content.info !== subtopicData.info || 
                                                      content.title || 
                                                      (content.tags && content.tags.length > 0)
                                                    ).map((content, itemIndex) => (
                                                      <div key={`${content.id}-${itemIndex}`} className="bg-gray-50 p-3 rounded border-l-4 border-green-400">
                                                        {content.title && (
                                                          <h5 className="font-medium text-gray-800 mb-2">{content.title}</h5>
                                                        )}
                                                        
                                                        {/* Only show content info if it's different from subtopic info */}
                                                        {content.info !== subtopicData.info && (
                                                          <div className="text-sm text-gray-600 mb-2">
                                                            {formatText(content.info)}
                                                          </div>
                                                        )}
                                                        
                                                        {content.tags && content.tags.length > 0 && (
                                                          <div className="mb-2">
                                                            <h6 className="text-xs font-semibold text-gray-700 mb-1">Tags:</h6>
                                                            <div className="flex flex-wrap gap-1">
                                                              {content.tags.map((tag: string, tagIndex: number) => (
                                                                <span key={tagIndex} className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs">
                                                                  #{tag}
                                                                </span>
                                                              ))}
                                                            </div>
                                                          </div>
                                                        )}
                                                        
                                                        <div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-1 border-t">
                                                          <span>Type: {content.content_type}</span>
                                                          {content.card_association && (
                                                            <span>Card: {content.card_association}</span>
                                                          )}
                                                          <span>Views: {content.view_count}</span>
                                                        </div>
                                                      </div>
                                                    ))}
                                                    
                                                    {/* Show metadata for the subtopic itself */}
                                                    <div className="bg-green-50 p-3 rounded border-l-4 border-green-500">
                                                      <h6 className="text-sm font-semibold text-green-800 mb-2">Subtopic Details</h6>
                                                      <div className="flex flex-wrap gap-4 text-xs text-green-600">
                                                        <span>Content Type: {originalContent.content_type}</span>
                                                        <span>Difficulty: {originalContent.difficulty_level}</span>
                                                        {originalContent.card_association && (
                                                          <span>Card Association: {originalContent.card_association}</span>
                                                        )}
                                                        <span>Total Views: {items.reduce((sum, item) => sum + item.view_count, 0)}</span>
                                                        <span>Items: {items.length}</span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            ) : (
                              !loading && (
                                <div className="text-center py-8">
                                  <p className="text-gray-600">No content available at the moment.</p>
                                </div>
                              )
                            )}
                          </div>
                        )}
                        <div className="flex justify-end pt-4">
                          <Button
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                          >
                            Close
                          </Button>
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
                      <Button className="w-full bg-green-600 hover:bg-green-700">
                        {t("game.cards.button")}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[95vw] w-[95vw] sm:max-w-[80vw] sm:w-[80vw] max-h-[90vh] h-[90vh] sm:max-h-[85vh] sm:h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-xl sm:text-2xl font-bold mb-4 text-green-600">
                          {t("game.cards.title")}
                        </DialogTitle>
                      </DialogHeader>
                      <CardViewer />
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <SupportChat />
    </div>
  )
}

export default function GameInfo() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col overflow-x-hidden">
        <Header />
        <main className="flex-1 bg-gradient-to-b from-green-50 to-white">
          <div className="relative w-full">
            <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-12">
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading...</p>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
        <SupportChat />
      </div>
    }>
      <GameInfoContent />
    </Suspense>
  )
} 