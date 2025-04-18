import { useState } from "react"
import { Card as GameCard } from "@/lib/gamer/aigamer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"

interface CardChoiceProps {
    cards: {
        playerCard: GameCard;
        aiCard: GameCard;
    };
    onSelect: (card: GameCard) => void;
}

const getCardImagePath = (card: GameCard) => {
    const suit = card.suit.toLowerCase();
    const value = card.value;
    return `/exp/${suit}/${value}.webp`;
};

export default function CardChoice({ cards, onSelect }: CardChoiceProps) {
    const [selectedCard, setSelectedCard] = useState<GameCard | null>(null);
    const [isFlipped, setIsFlipped] = useState(false);

    const handleCardSelect = async (card: GameCard) => {
        setSelectedCard(card);
        setIsFlipped(true);
        try {
            const response = await onSelect(card);
            console.log('Backend response:', response);
        } catch (error) {
            console.error('Error selecting card:', error);
        }
    };

    return (
        <div className="flex justify-center gap-8">
            <div className="relative">
                <Card
                    className={`w-32 h-48 cursor-pointer transition-all duration-500 transform ${
                        selectedCard === cards.playerCard ? 'rotate-y-180' : ''
                    }`}
                    onClick={() => !isFlipped && handleCardSelect(cards.playerCard)}
                >
                    <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                        {selectedCard !== cards.playerCard ? (
                            <div className="text-center">
                                <p className="text-lg font-bold">Card 1</p>
                                <p className="text-sm text-gray-500">Click to reveal</p>
                            </div>
                        ) : (
                            <div className="relative w-full h-full [transform:rotateY(180deg)]">
                                <Image
                                    src={getCardImagePath(cards.playerCard)}
                                    alt={`${cards.playerCard.value} of ${cards.playerCard.suit}`}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="relative">
                <Card
                    className={`w-32 h-48 cursor-pointer transition-all duration-500 transform ${
                        selectedCard === cards.aiCard ? 'rotate-y-180' : ''
                    }`}
                    onClick={() => !isFlipped && handleCardSelect(cards.aiCard)}
                >
                    <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                        {selectedCard !== cards.aiCard ? (
                            <div className="text-center">
                                <p className="text-lg font-bold">Card 2</p>
                                <p className="text-sm text-gray-500">Click to reveal</p>
                            </div>
                        ) : (
                            <div className="relative w-full h-full [transform:rotateY(180deg)]">
                                <Image
                                    src={getCardImagePath(cards.aiCard)}
                                    alt={`${cards.aiCard.value} of ${cards.aiCard.suit}`}
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}