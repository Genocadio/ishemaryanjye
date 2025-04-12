import React from 'react';
import CardComponent from './Card';
import { Card as GameCard } from '@/lib/gamer/aigamer';

interface PlaygroundCardProps {
  label: string;
  card: GameCard;
}

const PlaygroundCard: React.FC<PlaygroundCardProps> = ({ label, card }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full">
      <div className="scale-75 transform origin-center -mt-1">
        <CardComponent card={card} />
      </div>
    </div>
  );
};

export default PlaygroundCard; 