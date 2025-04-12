import { useState } from "react"
import { Card as GameCard } from "@/lib/gamer/aigamer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Diamond, Club, Spade } from "lucide-react"

interface CardChoiceProps {
    cards: {
        playerCard: GameCard;
        aiCard: GameCard;
    };
    onSelect: (card: GameCard) => void;
}

const getSuitIcon = (suit: string) => {
    switch (suit) {
        case 'Hearts':
            return <Heart className="h-5 w-5 text-red-500" />;
        case 'Diamonds':
            return <Diamond className="h-5 w-5 text-red-500" />;
        case 'Clubs':
            return <Club className="h-5 w-5 text-black" />;
        case 'Spades':
            return <Spade className="h-5 w-5 text-black" />;
        default:
            return null;
    }
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
                        selectedCard === cards.playerCard && isFlipped ? 'rotate-y-180' : ''
                    }`}
                    onClick={() => !isFlipped && handleCardSelect(cards.playerCard)}
                >
                    <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                        {!isFlipped ? (
                            <div className="text-center">
                                <p className="text-lg font-bold">Card 1</p>
                                <p className="text-sm text-gray-500">Click to reveal</p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="text-2xl font-bold mb-2">{cards.playerCard.value}</div>
                                {getSuitIcon(cards.playerCard.suit)}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="relative">
                <Card
                    className={`w-32 h-48 cursor-pointer transition-all duration-500 transform ${
                        selectedCard === cards.aiCard && isFlipped ? 'rotate-y-180' : ''
                    }`}
                    onClick={() => !isFlipped && handleCardSelect(cards.aiCard)}
                >
                    <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                        {!isFlipped ? (
                            <div className="text-center">
                                <p className="text-lg font-bold">Card 2</p>
                                <p className="text-sm text-gray-500">Click to reveal</p>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="text-2xl font-bold mb-2">{cards.aiCard.value}</div>
                                {getSuitIcon(cards.aiCard.suit)}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 