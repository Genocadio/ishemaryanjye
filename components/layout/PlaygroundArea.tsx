import React from 'react';
import { Card as GameCard } from '@/lib/gamer/aigamer';
import PlaygroundCard from './PlaygroundCard';

interface PlaygroundAreaProps {
  humanCard: GameCard | null;
  aiCard: GameCard | null;
}

const PlaygroundArea: React.FC<PlaygroundAreaProps> = ({ humanCard, aiCard }) => {
  return (
    <div className="w-full h-[180px] bg-green-200 rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="h-full flex items-center justify-center">
        <div className="flex gap-8 items-center justify-center">
          {humanCard ? (
            <div className="flex-shrink-0">
              <PlaygroundCard label="Your Card" card={humanCard} />
            </div>
          ) : (
            <div className="w-[120px] h-[180px] flex-shrink-0" />
          )}
          {aiCard ? (
            <div className="flex-shrink-0">
              <PlaygroundCard label="AI's Card" card={aiCard} />
            </div>
          ) : (
            <div className="w-[120px] h-[180px] flex-shrink-0" />
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaygroundArea; 