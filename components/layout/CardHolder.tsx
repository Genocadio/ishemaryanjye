import { Card } from "@/lib/gamer/aigamer";
import { motion } from "framer-motion";
import { Heart, Diamond, Club, Spade } from "lucide-react";

interface CardHolderProps {
    cards?: Card[];
    onCardDrawn?: () => void;
}

const getSuitIcon = (index: number) => {
    const suits = [
        <Heart key="heart" className="w-4 h-4 text-red-400 opacity-20" />,
        <Diamond key="diamond" className="w-4 h-4 text-red-400 opacity-20" />,
        <Club key="club" className="w-4 h-4 text-gray-400 opacity-20" />,
        <Spade key="spade" className="w-4 h-4 text-gray-400 opacity-20" />
    ];
    return suits[index % suits.length];
};

export default function CardHolder({ cards = [], onCardDrawn }: CardHolderProps) {
    return (
        <div className="relative w-24 h-32 hidden md:block ml-8">
            {cards.map((card, index) => (
                <motion.div
                    key={`${card.suit}-${card.value}-${index}`}
                    className="absolute w-full h-full"
                    initial={{ x: 0, y: 0 }}
                    animate={{ 
                        x: index * 0.8,
                        y: index * 0.8,
                        rotate: index * 1
                    }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-md border-2 border-gray-300">
                        <div className="absolute inset-0 flex flex-wrap gap-2 p-2">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="w-4 h-4">
                                    {getSuitIcon(index)}
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
} 