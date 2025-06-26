export type Player = {
  id: string
  name: string
  teamId: string
  connected: boolean
  isAnonymous: boolean
  cardsRemaining: number
}

export type CardType = {
  suit: "Hearts" | "Diamonds" | "Clubs" | "Spades";
  value: "A" | "K" | "Q" | "J" | "7" | "6" | "5" | "4" | "3";
  pointValue: number
  id: string
}

export type PlaygroundEntry = {
  playerId: string
  playerName?: string
  card: CardType
}

export type Team = {
  id: string
  players: Player[]
  connectedCount: number
  totalSlots: number
  missingCount: number
  score: number
  roundWins: number
}

export type Teams = {
  team1: Team
  team2: Team
}

export type RoundResult = {
  winner: Player
  winningTeam: "team1" | "team2"
  pointsEarned: number
  playedCards: PlaygroundEntry[]
  analysis: {
    roundQuality: string
    roundAnalysis: string
  }
}

export type ConnectionState = {
  matchId?: string
  matchStatus?: "waiting" | "paused" | "active" | "finished" | "completed" | "cancelled"
  currentRound?: number
  totalRounds?: number;
  cardHolder?: CardType[];
  teamSize?: number
  playersCount?: number
  maxPlayers?: number
  trumpSuit?: string
  currentPlayerId?: string
  currentPlayerName?: string
  firstPlayerName?: string
} 