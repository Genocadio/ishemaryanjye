import React from 'react';
import { Card as GameCard } from '@/lib/gamer/aigamer';
import PlaygroundCard from './PlaygroundCard';

interface PlaygroundAreaProps {
  player1Card: GameCard | null;
  player2Card: GameCard | null;
  player1Name?: string;
  player2Name?: string;
  currentTurn?: 'player1' | 'player2';
}

const PlaygroundArea: React.FC<PlaygroundAreaProps> = ({ player1Card, player2Card, player1Name, player2Name, currentTurn }) => {
  return (
    <div className="w-full h-[180px] bg-green-200 rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="h-full flex items-center justify-center">
        <div className="flex gap-8 items-center justify-center">
          <div className={`flex-shrink-0 ${currentTurn === 'player1' ? 'border-4 border-green-600 rounded-lg scale-105 shadow-lg' : 'border-2 border-gray-200 rounded-lg'}`}">
            {player1Card ? (
              <PlaygroundCard label="" card={player1Card} />
            ) : (
              <div className="w-[120px] h-[180px]" />
            )}
          </div>
          <div className={`flex-shrink-0 ${currentTurn === 'player2' ? 'border-4 border-green-600 rounded-lg scale-105 shadow-lg' : 'border-2 border-gray-200 rounded-lg'}`}">
            {player2Card ? (
              <PlaygroundCard label="" card={player2Card} />
            ) : (
              <div className="w-[120px] h-[180px]" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaygroundArea; 