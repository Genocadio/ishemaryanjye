import { Card, Suit, CardValue } from '@/lib/gamer/aigamer';
import { Heart, Diamond, Club, Spade } from 'lucide-react';

const SUITS: Suit[] = ['Spades', 'Hearts', 'Diamonds', 'Clubs'];
const VALUES: CardValue[] = ['A', 'K', 'Q', 'J', '7', '6', '5', '4', '3'];

export function createDeck(): Card[] {
  const deck: Card[] = [];
  
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push({
        suit,
        value,
        pointValue: getCardPointValue(value)
      });
    }
  }
  
  return shuffleDeck(deck);
}

export function getTrumpSuitIcon(suit: Suit): string {
  switch (suit) {
    case 'Hearts':
      return '♥';
    case 'Diamonds':
      return '♦';
    case 'Clubs':
      return '♣';
    case 'Spades':
      return '♠';
    default:
      return '';
  }
}

function getCardPointValue(value: CardValue): number {
  switch (value) {
    case 'A': return 11;
    case 'K': return 4;
    case 'Q': return 2;
    case 'J': return 3;
    case '7': return 10;
    default: return 0;
  }
}

function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function dealCards(deck: Card[], players: number, cardsPerPlayer: number): Card[][] {
  const hands: Card[][] = [];
  
  for (let i = 0; i < players; i++) {
    hands.push([]);
  }
  
  for (let i = 0; i < cardsPerPlayer; i++) {
    for (let j = 0; j < players; j++) {
      if (deck.length > 0) {
        hands[j].push(deck.pop()!);
      }
    }
  }
  
  return hands;
}

export function getRandomTrumpSuit(): Suit {
  return SUITS[Math.floor(Math.random() * SUITS.length)];
} 