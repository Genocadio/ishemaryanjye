"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

const suits = ["clubs", "spades", "diamonds", "hearts"]
const ranks = ["3", "4", "5", "6", "7", "A", "J", "K", "Q"]

const cardMeanings = {
  "3": "Basic reproductive health knowledge",
  "4": "Understanding gender equality",
  "5": "Safe practices and prevention",
  "6": "Communication and consent",
  "7": "Healthy relationships",
  "A": "Advanced concepts",
  "J": "Youth perspectives",
  "K": "Leadership in health",
  "Q": "Empowerment and rights"
}

export function CardViewer() {
  const { t } = useLanguage()
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  
  const allCards = suits.flatMap(suit =>
    ranks.map(rank => ({
      path: `/cards/${suit}/${rank}.webp`,
      suit,
      rank,
      meaning: cardMeanings[rank as keyof typeof cardMeanings]
    }))
  )

  const currentCard = allCards[currentCardIndex]

  const goToNextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % allCards.length)
  }

  const goToPreviousCard = () => {
    setCurrentCardIndex((prev) => (prev - 1 + allCards.length) % allCards.length)
  }

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      <div className="relative w-full max-w-md">
        <div className="aspect-[2/3] w-full rounded-lg overflow-hidden shadow-lg bg-white">
          <img
            src={currentCard.path}
            alt={`${currentCard.rank} of ${currentCard.suit}`}
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="absolute top-1/2 -translate-y-1/2 left-0 -translate-x-1/2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={goToPreviousCard}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="absolute top-1/2 -translate-y-1/2 right-0 translate-x-1/2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            onClick={goToNextCard}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-green-600">
          {currentCard.rank} of {currentCard.suit}
        </h3>
        <p className="text-gray-600 max-w-md">
          {currentCard.meaning}
        </p>
        <p className="text-sm text-gray-500">
          {currentCardIndex + 1} of {allCards.length}
        </p>
      </div>
    </div>
  )
} 