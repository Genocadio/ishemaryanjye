import { Card as GameCard } from "@/lib/gamer/aigamer"
import CardComponent from "./Card"

interface CardHandProps {
  cards: GameCard[]
  onCardSelect: (index: number) => void
  className?: string
  disabled?: boolean
}

export default function CardHand({ cards, onCardSelect, className, disabled = false }: CardHandProps) {
  // Calculate if we need 2 rows (more than 9 cards) for larger screens
  const needsTwoRows = cards.length > 9
  const cardsPerRow = needsTwoRows ? Math.ceil(cards.length / 2) : cards.length

  return (
    <div className={`w-full ${className}`}>
      {/* First row - always visible */}
      <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
        {cards.map((card, index) => (
          <div key={index} className="flex-shrink-0 md:hidden">
            <CardComponent
              card={card}
              onClick={() => !disabled && onCardSelect(index)}
              isPlayable={!disabled}
            />
          </div>
        ))}
        {/* First row for larger screens */}
        {cards.slice(0, cardsPerRow).map((card, index) => (
          <div key={index} className="flex-shrink-0 hidden md:block">
            <CardComponent
              card={card}
              onClick={() => !disabled && onCardSelect(index)}
              isPlayable={!disabled}
            />
          </div>
        ))}
      </div>

      {/* Second row - only visible on larger screens */}
      {needsTwoRows && (
        <div className="hidden md:flex overflow-x-auto gap-4 scrollbar-hide">
          {cards.slice(cardsPerRow).map((card, index) => (
            <div key={index + cardsPerRow} className="flex-shrink-0">
              <CardComponent
                card={card}
                onClick={() => !disabled && onCardSelect(index + cardsPerRow)}
                isPlayable={!disabled}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 