"use client";

import Image from 'next/image';
import { CardType } from '@/app/multiplayer/types';

interface CardProps {
  card: CardType;
  isSelected?: boolean;
  isPlayable?: boolean;
  onClick?: () => void;
}

export default function MultiplayerCard({ card, isSelected = false, isPlayable = true, onClick }: CardProps) {
  const suitLower = card.suit.toLowerCase();
  const value = card.value;

  return (
    <div 
      className={`relative w-[120px] h-[180px] cursor-pointer transition-transform duration-200 border-2 border-gray-200 rounded-lg ${
        isSelected ? 'transform -translate-y-4' : ''
      } ${isPlayable ? 'hover:scale-105' : 'opacity-50'}`}
      onClick={onClick}
    >
      <Image
        src={`/cards/${suitLower}/${value}.webp`}
        alt={`${value} of ${card.suit}`}
        fill
        style={{ objectFit: 'cover' }}
        priority={isPlayable}
        sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw'
        className={`rounded-lg shadow-md ${isSelected ? 'ring-4 ring-blue-500' : ''}`}
      />
    </div>
  );
} 