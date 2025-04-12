import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, UserRound } from 'lucide-react';
import { Suit } from '@/lib/gamer/aigamer';

interface GameStatusCardProps {
  currentTurn: 'player' | 'character';
  selectedCharacter: 'Shema' | 'Teta';
  playerScore: number;
  aiScore: number;
  trumpSuit: Suit;
  username?: string;
}

const getTrumpSuitIcon = (suit: Suit) => {
  switch (suit) {
    case 'Hearts':
      return <span className="text-red-500">♥</span>;
    case 'Diamonds':
      return <span className="text-red-500">♦</span>;
    case 'Clubs':
      return <span className="text-black">♣</span>;
    case 'Spades':
      return <span className="text-black">♠</span>;
    default:
      return null;
  }
};

const getInitials = (name: string) => {
  if (!name) return 'G';
  return name.charAt(0).toUpperCase();
};

const GameStatusCard: React.FC<GameStatusCardProps> = ({
  currentTurn,
  selectedCharacter,
  playerScore,
  aiScore,
  trumpSuit,
  username = 'Guest',
}) => {
  return (
    <div className="flex justify-between items-center p-2">
      <div className="flex items-center space-x-2 min-w-0">
        <Avatar
          className={`h-8 w-8 border-2 ${currentTurn === 'player' ? 'border-green-500' : 'border-gray-300'} hidden md:flex`}
        >
          {selectedCharacter === 'Shema' ? (
            <User className="h-5 w-5 text-blue-600" />
          ) : (
            <UserRound className="h-5 w-5 text-pink-600" />
          )}
          <AvatarFallback>{getInitials(username)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="font-bold text-sm truncate">{username}</div>
          <div className="text-xs text-gray-500">Score: {playerScore}</div>
        </div>
      </div>

      <div
        className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 flex-shrink-0 ${
          currentTurn === 'player' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}
      >
        {currentTurn === 'player' ? 'Your Turn' : `${selectedCharacter}'s Turn`}
        <div className="flex items-center gap-1">
          <span>Trump:</span>
          {getTrumpSuitIcon(trumpSuit)}
        </div>
      </div>

      <div className="flex items-center space-x-2 min-w-0">
        <div className="text-right min-w-0">
          <div className="font-bold text-sm truncate">{selectedCharacter}</div>
          <div className="text-xs text-gray-500">Score: {aiScore}</div>
        </div>
        <Avatar
          className={`h-8 w-8 border-2 ${currentTurn === 'character' ? 'border-green-500' : 'border-gray-300'} hidden md:flex`}
        >
          {selectedCharacter !== 'Shema' ? (
            <User className="h-5 w-5 text-blue-600" />
          ) : (
            <UserRound className="h-5 w-5 text-pink-600" />
          )}
          <AvatarFallback>{selectedCharacter === 'Shema' ? 'S' : 'T'}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

export default GameStatusCard; 