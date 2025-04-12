// AI Memory & Tracking

// Types for our card game
type Suit = 'Spades' | 'Hearts' | 'Clubs' | 'Diamonds';
type CardValue = '3' | '4' | '5' | '6' | '7' | 'J' | 'Q' | 'K' | 'A';

// Long-term opponent tracking
interface OpponentProfile {
  id: string;  // Unique identifier for the opponent
  gamesPlayed: number;
  wins: number;
  averageScore: number;
  behaviorHistory: {
    timestamp: number;
    savesTrumps: number;
    playsAggressively: number;
    avoidsRisk: number;
    predictability: number;
  }[];
  playStyle: {
    preferredSuits: Partial<Record<Suit, number>>;  // Frequency of leading each suit
    valuePreference: number;  // -1 to 1, preference for high vs low value cards
    trumpUsage: number;  // -1 to 1, how often they use trumps
  };
}

interface DecayFactors {
  behaviorDecay: number;  // How quickly behavior metrics decay (0 to 1)
  historyWeight: number;  // Weight given to historical data vs current game
  recentActionsWeight: number;  // Weight given to most recent actions
}

interface PredictabilityMetrics {
  patternStrength: number;  // How strong the detected patterns are (0 to 1)
  consistencyScore: number;  // How consistent the plays are (0 to 1)
  situationalVariance: number;  // How much play varies by situation (0 to 1)
}

interface Card {
  suit: Suit;
  value: CardValue;
  pointValue: number;
}

interface Player {
  hand: Card[];
  collectedCards: Card[];
  score: number;
}

export type RoundHistory = {
  player1Card: Card;
  player2Card: Card;
  winner: 0 | 1 | null; // null for tie
  stake: number;
};

export type GameState = {
  trumpSuit: Suit;
  players: [Player, Player];
  currentPlayer: 0 | 1;
  cardsOnTable: Card[];
  roundStake: number;
  roundHistory: RoundHistory[];
  currentRound: number;
  totalRounds: number;
};

// AI personality types
type PersonalityType = 'Cautious' | 'Aggressive' | 'Analytical' | 'Greedy' | 'TrapSetter' | 'Unpredictable';
type DifficultyLevel = 'Easy' | 'Medium' | 'Hard' | 'Very Hard' | 'Adaptive';
interface AIMemory {
    knownCards: Card[];
    playedCards: Card[];
    opponentFailedSuits: Record<Suit, boolean>;
    opponentBehavior: {
      savesTrumps: number; // -1 to 1 scale
      playsAggressively: number; // -1 to 1 scale
      avoidsRisk: number; // -1 to 1 scale
      predictability: number; // 0 to 1 scale
    };
    decayFactors: DecayFactors;
    predictabilityMetrics: PredictabilityMetrics;
    recentActions: {
      card: Card;
      situation: {
        roundStake: number;
        wasLeader: boolean;
        trumpPlayed: boolean;
      };
      timestamp: number;
    }[];
    currentGameStats: {
      trumpsPlayed: number;
      highValuePlays: number;
      totalPlays: number;
      suitLeads: Record<Suit, number>;
    };
    matchQuirks?: {
      preferredSuit: Suit;
      playStyle: 'aggressive' | 'defensive';
      valueThreshold: number;
    };
    opponentProfile: {
      behaviorHistory: Array<{
        card: Card;
        response: Card;
        outcome: 'win' | 'lose' | 'draw';
        timestamp: number;
      }>;
      bluffPatterns: Array<{
        situation: string;
        frequency: number;
        successRate: number;
      }>;
    };
    crossMatchLearning: {
      playerPatterns: Array<{
        playerId: string;
        bluffSituations: Array<{
          situation: string;
          frequency: number;
          successRate: number;
        }>;
      }>;
      globalPatterns: {
        bluffSituations: Array<{
          situation: string;
          frequency: number;
          successRate: number;
        }>;
      };
    };
    traitEvolution: {
      currentTraits: {
        aggressiveness: number;  // 0-100
        riskAversion: number;    // 0-100
        deceptionTendency: number; // 0-100
        adaptability: number;    // 0-100
      };
      successHistory: Array<{
        traits: {
          aggressiveness: number;
          riskAversion: number;
          deceptionTendency: number;
          adaptability: number;
        };
        successRate: number;
        timestamp: number;
      }>;
    };
    deceptionTracker: {
      baitAttempts: number;
      successfulBaits: number;
      opponentBaitResponses: Array<{
        card: Card;
        response: Card;
        wasBait: boolean;
      }>;
    };
  }

  const CARD_POINT_VALUES: Record<CardValue, number> = {
    'A': 11,
    'K': 4,
    'Q': 2,
    'J': 3,
    '7': 10,
    '6': 0,
    '5': 0,
    '4': 0,
    '3': 0
  };
  
  // Trump bonus value (only for battle comparison, not scoring)
  const TRUMP_BONUS = 20;
  
  export class CardGameAI {
    private personality: PersonalityType;
    private difficulty: DifficultyLevel;
    private memory: AIMemory;
    private gameState!: GameState;
    private playerIndex!: 0 | 1;
    private opponentProfile: OpponentProfile | null;
    private readonly MEMORY_DECAY_RATE = 0.95;  // 5% decay per round
    private readonly RECENT_ACTIONS_LIMIT = 10;  // Keep track of last 10 actions
    
    constructor(
      personality: PersonalityType = 'Analytical',
      difficulty: DifficultyLevel = 'Medium',
      opponentId?: string
    ) {
      this.personality = personality;
      this.difficulty = difficulty;
      this.opponentProfile = null;
      this.memory = this.initializeMemory();
    }
    
    private initializeMemory(): AIMemory {
      return {
        knownCards: [],
        playedCards: [],
        opponentFailedSuits: { 'Spades': false, 'Hearts': false, 'Clubs': false, 'Diamonds': false },
        opponentBehavior: {
          savesTrumps: 0,
          playsAggressively: 0,
          avoidsRisk: 0,
          predictability: 0.5
        },
        decayFactors: {
          behaviorDecay: 0.95,
          historyWeight: 0.3,
          recentActionsWeight: 0.7
        },
        predictabilityMetrics: {
          patternStrength: 0.5,
          consistencyScore: 0.5,
          situationalVariance: 0.5
        },
        recentActions: [],
        currentGameStats: {
          trumpsPlayed: 0,
          highValuePlays: 0,
          totalPlays: 0,
          suitLeads: { 'Spades': 0, 'Hearts': 0, 'Clubs': 0, 'Diamonds': 0 }
        },
        opponentProfile: {
          behaviorHistory: [],
          bluffPatterns: []
        },
        crossMatchLearning: {
          playerPatterns: [],
          globalPatterns: {
            bluffSituations: []
          }
        },
        traitEvolution: {
          currentTraits: {
            aggressiveness: 50,
            riskAversion: 50,
            deceptionTendency: 50,
            adaptability: 50
          },
          successHistory: []
        },
        deceptionTracker: {
          baitAttempts: 0,
          successfulBaits: 0,
          opponentBaitResponses: []
        }
      };
    }
    
    // Initialize the AI with game state and player index
    public initialize(gameState: GameState, playerIndex: 0 | 1): void {
      this.gameState = gameState;
      this.playerIndex = playerIndex;
      this.memory.knownCards = [...this.gameState.players[this.playerIndex].hand];
    }
    
    // Update AI memory after each round
    public updateMemory(gameState: GameState): void {
      this.gameState = gameState;
      
      // Get the latest round
      const lastRound = gameState.roundHistory[gameState.roundHistory.length - 1];
      if (lastRound) {
        // Add played cards to memory
        this.memory.playedCards.push(lastRound.player1Card, lastRound.player2Card);
        
        // Update opponent behavior analysis
        this.updateOpponentBehaviorAnalysis(lastRound);
        
        // Track if opponent failed to follow suit
        const opponentCard = this.playerIndex === 0 ? lastRound.player2Card : lastRound.player1Card;
        const leadCard = this.playerIndex === 0 ? lastRound.player1Card : lastRound.player2Card;
        
        if (leadCard.suit !== opponentCard.suit) {
          this.memory.opponentFailedSuits[leadCard.suit] = true;
        }
      }
      
      // Update known cards
      this.memory.knownCards = [...this.gameState.players[this.playerIndex].hand];
    }
    
    private updateOpponentBehaviorAnalysis(lastRound: GameState['roundHistory'][0]): void {
      const opponentCard = this.playerIndex === 0 ? lastRound.player2Card : lastRound.player1Card;
      const opponentIsLeader = this.playerIndex !== this.gameState.currentPlayer;
      
      // Apply memory decay
      this.updateMemoryWithDecay();
      
      // Record the action
      this.memory.recentActions.push({
        card: opponentCard,
        situation: {
          roundStake: this.gameState.roundStake,
          wasLeader: opponentIsLeader,
          trumpPlayed: opponentCard.suit === this.gameState.trumpSuit
        },
        timestamp: Date.now()
      });

      // Update current game stats
      this.memory.currentGameStats.totalPlays++;
      if (opponentCard.suit === this.gameState.trumpSuit) {
        this.memory.currentGameStats.trumpsPlayed++;
      }
      if (opponentCard.pointValue > 5) {
        this.memory.currentGameStats.highValuePlays++;
      }
      if (opponentIsLeader) {
        this.memory.currentGameStats.suitLeads[opponentCard.suit]++;
      }

      // Update behavior tracking with decay
      if (opponentCard.suit === this.gameState.trumpSuit) {
        if (this.gameState.roundStake > 10) {
          this.memory.opponentBehavior.savesTrumps -= 0.1 * this.memory.decayFactors.behaviorDecay;
          this.memory.opponentBehavior.playsAggressively += 0.1 * this.memory.decayFactors.behaviorDecay;
        } else {
          this.memory.opponentBehavior.savesTrumps -= 0.2 * this.memory.decayFactors.behaviorDecay;
        }
      }
      
      if (opponentIsLeader && CARD_POINT_VALUES[opponentCard.value] > 3) {
        this.memory.opponentBehavior.playsAggressively += 0.1 * this.memory.decayFactors.behaviorDecay;
        this.memory.opponentBehavior.avoidsRisk -= 0.1 * this.memory.decayFactors.behaviorDecay;
      }
      
      if (this.gameState.roundStake > 10 && CARD_POINT_VALUES[opponentCard.value] < 3) {
        this.memory.opponentBehavior.avoidsRisk += 0.2 * this.memory.decayFactors.behaviorDecay;
      }
      
      // Keep values in bounds
      this.memory.opponentBehavior.savesTrumps = Math.max(-1, Math.min(1, this.memory.opponentBehavior.savesTrumps));
      this.memory.opponentBehavior.playsAggressively = Math.max(-1, Math.min(1, this.memory.opponentBehavior.playsAggressively));
      this.memory.opponentBehavior.avoidsRisk = Math.max(-1, Math.min(1, this.memory.opponentBehavior.avoidsRisk));

      // Update predictability metrics
      this.calculatePredictability();
    }
    
    // Get a move when AI is the first player
    public getFirstPlayerMove(): number {
      if (!this.gameState) {
        throw new Error('Game state not initialized');
      }

      const aiHand = this.gameState.players[1].hand;
      if (!aiHand || aiHand.length === 0) {
        throw new Error('AI has no cards to play');
      }

      // Calculate scores for all cards
      const cardScores = aiHand.map((card, index) => {
        const cardValue = this.evaluateCard(card);
        return { index, score: cardValue };
      });

      cardScores.sort((a, b) => b.score - a.score);
      return cardScores[0].index;
    }
    
    private calculateRisk(card: Card, difficulty: DifficultyLevel): number {
      let risk = 0;
      
      // Base risk on card value
      if (card.pointValue > 5) risk += 0.3;
      if (card.pointValue > 8) risk += 0.2;
      
      // Risk of opponent having trump
      if (!this.memory.opponentFailedSuits[this.gameState.trumpSuit]) {
        risk += 0.2;
      }
      
      // Risk of opponent having higher cards in the same suit
      const opponentMayHaveHigher = !this.memory.opponentFailedSuits[card.suit];
      if (opponentMayHaveHigher) {
        risk += 0.2;
      }

      // Additional risk factors for leading with non-trump cards
      if (card.suit !== this.gameState.trumpSuit) {
        // Higher risk for leading with non-trump in early rounds
        const roundNumber = this.gameState.roundHistory.length + 1;
        if (roundNumber <= 5) {
          risk += 0.3; // Much more conservative in early rounds
        } else if (roundNumber <= 10) {
          risk += 0.2; // Still conservative in mid-game
        } else {
          risk += 0.1; // Less conservative in late game
        }

        // Additional risk if we have trump cards we could lead with instead
        const trumpCardsInHand = this.gameState.players[this.playerIndex].hand
          .filter(c => c.suit === this.gameState.trumpSuit).length;
        if (trumpCardsInHand > 0) {
          risk += 0.2; // Prefer leading with trump when available
        }

        // Higher risk for leading with low-value non-trump cards
        if (card.pointValue < 3) {
          risk += 0.15; // Especially risky to lead with low cards
        }
      } else {
        // Leading with trump is generally safer
        risk -= 0.2;
        
        // But be careful with high-value trumps early
        if (card.pointValue > 5 && this.gameState.roundHistory.length < 5) {
          risk += 0.1;
        }
      }
      
      // Adjust risk based on difficulty
      switch (difficulty) {
        case 'Medium':
          risk *= 0.8; // Less risk-averse
          break;
        case 'Hard':
          risk *= 1.0; // Standard risk assessment
          break;
        case 'Very Hard':
          risk *= 1.2; // More risk-averse
          break;
        case 'Adaptive':
          // Adaptive risk based on game state
          const myScore = this.gameState.players[this.playerIndex].score;
          const opponentScore = this.gameState.players[this.playerIndex === 0 ? 1 : 0].score;
          const scoreDifference = myScore - opponentScore;
          
          if (scoreDifference < -20) {
            risk *= 0.9; // Less risk-averse when behind
          } else if (scoreDifference > 20) {
            risk *= 1.1; // More risk-averse when ahead
          }
          break;
      }
      
      return Math.min(1, risk);
    }

    private simulateOpponentResponse(card: Card): { canWinWithZero: boolean; likelyResponse: Card | null } {
      const opponentHand = this.gameState.players[this.playerIndex === 0 ? 1 : 0].hand;
      const zeroValueCards = opponentHand.filter(c => c.pointValue === 0);
      
      return {
        canWinWithZero: zeroValueCards.length > 0,
        likelyResponse: this.predictOpponentResponse(card)
      };
    }

    private calculateDeceptionRisk(card: Card): number {
      if (!this.isVeryHardDifficulty()) return 0;
      
      let risk = 0;
      
      // Check if this card could be part of a bait pattern
      const similarSituations = this.memory.crossMatchLearning.globalPatterns.bluffSituations
        .filter(s => s.situation.includes(card.suit) || s.situation.includes(card.value));
      
      if (similarSituations.length > 0) {
        const avgSuccessRate = similarSituations.reduce((sum, s) => sum + s.successRate, 0) / 
                             similarSituations.length;
        risk += avgSuccessRate * 0.3;
      }
      
      // Check if opponent has shown deception patterns
      const recentDeception = this.memory.deceptionTracker.opponentBaitResponses
        .slice(-3)
        .filter(r => r.wasBait).length;
      
      if (recentDeception > 1) {
        risk += 0.2;
      }
      
      return Math.min(1, risk);
    }

    private predictOpponentResponse(card: Card): Card | null {
      const opponentHistory = this.memory.opponentProfile?.behaviorHistory || [];
      const similarSituations = opponentHistory.filter(h => 
        h.card.suit === card.suit || h.card.value === card.value
      );
      
      if (similarSituations.length > 0) {
        // Find most common response in similar situations
        const responseCounts = new Map<string, number>();
        similarSituations.forEach(h => {
          const key = `${h.response.suit}-${h.response.value}`;
          responseCounts.set(key, (responseCounts.get(key) || 0) + 1);
        });
        
        const mostCommon = Array.from(responseCounts.entries())
          .sort((a, b) => b[1] - a[1])[0];
        
        if (mostCommon) {
          const [suit, value] = mostCommon[0].split('-');
          return { suit: suit as Suit, value: value as CardValue, pointValue: CARD_POINT_VALUES[value as CardValue] };
        }
      }
      
      return null;
    }
    
    // Get a move when AI is the second player
    public getSecondPlayerMove(firstCard: Card): number {
      if (!this.gameState) {
        throw new Error('Game state not initialized');
      }

      const aiHand = this.gameState.players[1].hand;
      if (!aiHand || aiHand.length === 0) {
        throw new Error('AI has no cards to play');
      }

      // Filter valid moves based on game rules
      const validMoves = aiHand.map((card, index) => ({
        card,
        index,
        isValid: this.isValidMove(card, firstCard)
      })).filter(move => move.isValid);

      if (validMoves.length === 0) {
        // If no valid moves, play any card
        return Math.floor(Math.random() * aiHand.length);
      }

      // Calculate scores for valid moves
      const cardScores = validMoves.map(({ card, index }) => {
        const winProbability = this.calculateBaseWinProbability(firstCard);
        const cardValue = this.evaluateCard(card);
        const score = winProbability * cardValue;
        return { index, score };
      });

      cardScores.sort((a, b) => b.score - a.score);
      return cardScores[0].index;
    }

    private isValidMove(card: Card, firstCard: Card): boolean {
      if (!this.gameState) return false;
      
      // If player has cards of the same suit as first card, must play same suit
      const aiHand = this.gameState.players[1].hand;
      const hasSameSuit = aiHand.some(c => c.suit === firstCard.suit);
      
      if (hasSameSuit) {
        return card.suit === firstCard.suit;
      }
      
      // If no same suit, can play any card
      return true;
    }
    
    private calculateBaseWinProbability(firstCard: Card): number {
      if (!this.gameState) return 0;

      const aiHand = this.gameState.players[1].hand;
      const trumpSuit = this.gameState.trumpSuit;

      // Count how many cards can beat the first card
      const winningCards = aiHand.filter(card => {
        if (card.suit === trumpSuit && firstCard.suit !== trumpSuit) {
          return true; // Trump beats non-trump
        }
        if (card.suit === firstCard.suit) {
          return CARD_POINT_VALUES[card.value] > CARD_POINT_VALUES[firstCard.value];
        }
        return false;
      });

      return winningCards.length / aiHand.length;
    }
    
    private getTargetWinRate(): number {
      switch (this.difficulty) {
        case 'Easy':
          return 0.3; // 30% chance to try to win
        case 'Medium':
          return 0.5; // 50% chance to try to win
        case 'Hard':
          return 0.8; // 80% chance to try to win
        case 'Very Hard':
          return 0.9; // 90% chance to try to win
        case 'Adaptive':
          // Adaptive win rate based on game state
          const myScore = this.gameState.players[this.playerIndex].score;
          const opponentScore = this.gameState.players[this.playerIndex === 0 ? 1 : 0].score;
          const scoreDifference = myScore - opponentScore;
          
          if (scoreDifference < -20) {
            return 0.7; // Behind - try harder to win
          } else if (scoreDifference > 20) {
            return 0.5; // Ahead - can afford to be more unpredictable
          }
          return 0.6; // Default adaptive win rate
        default:
          return 0.5; // Default for unknown difficulty
      }
    }
    
    private getDifficultyRandomness(): number {
      switch (this.difficulty) {
        case 'Easy':
          return 15; // High randomness
        case 'Medium':
          return 10; // Medium randomness
        case 'Hard':
          return 5;  // Low randomness
        case 'Very Hard':
          return 3;  // Very low randomness
        case 'Adaptive':
          // For adaptive, randomness changes based on game state
          const myScore = this.gameState.players[this.playerIndex].score;
          const opponentScore = this.gameState.players[this.playerIndex === 0 ? 1 : 0].score;
          const scoreDifference = myScore - opponentScore;
          
          if (scoreDifference < -20) {
            return 8; // Behind - less random
          } else if (scoreDifference > 20) {
            return 12; // Ahead - more random
          }
          return 10; // Default adaptive randomness
        default:
          return 10; // Default for unknown difficulty
      }
    }
    
    // Get valid cards to play as the second player
    private getValidCards(hand: Card[], requiredSuit: Suit): { card: Card, index: number }[] {
      // Return all cards regardless of suit matching
      return hand.map((card, index) => ({ card, index }));
    }
    
    // Check for special A & 7 trump round scenario
    private isSpecialTrumpRound(card1: Card, card2: Card): boolean {
      return card1.suit === this.gameState.trumpSuit && 
             card2.suit === this.gameState.trumpSuit &&
             ((card1.value === 'A' && card2.value === '7') || 
              (card1.value === '7' && card2.value === 'A'));
    }
    
    // Score a card when AI is the first player
    private scoreCardAsFirstPlayer(card: Card, index: number): number {
      let score = 0;
      
      // Base score is the card's point value
      score += card.pointValue;
      
      // Adjust based on whether card is trump
      if (card.suit === this.gameState.trumpSuit) {
        // Special handling for A & 7 trump round
        if (card.value === 'A' || card.value === '7') {
          // Check if opponent might have the matching card
          const opponentMayHaveMatchingTrump = !this.memory.opponentFailedSuits[this.gameState.trumpSuit];
          
          if (opponentMayHaveMatchingTrump) {
            // Adjust score based on personality
            switch (this.personality) {
              case 'Cautious':
                // Cautious AI avoids A & 7 trump rounds
                score -= 20;
                break;
              case 'Aggressive':
                // Aggressive AI seeks A & 7 trump rounds
                score += 15;
                break;
              case 'Analytical':
                // Analytical AI considers the risk/reward
                if (this.gameState.roundStake > 10) {
                  score += 10; // More willing to risk for high stakes
                } else {
                  score -= 5; // More cautious with low stakes
                }
                break;
              case 'Greedy':
                // Greedy AI focuses on point values
                score += card.pointValue * 1.5;
                break;
              case 'TrapSetter':
                // TrapSetter AI uses A & 7 as bait
                if (card.value === '7') {
                  score += 8; // Prefer to lead with 7
                } else {
                  score -= 5; // Avoid leading with A
                }
                break;
              case 'Unpredictable':
                // Unpredictable AI adds randomness
                score += (Math.random() * 20) - 10;
                break;
            }
          }
        } else {
          // Regular trump card scoring
          if (this.personality === 'Cautious') {
            score -= 5;
          } else if (this.personality === 'Aggressive') {
            score += 3;
          }
        }
      }
      
      // Adjust based on opponent's likely responses
      const opponentMayHaveSuit = !this.memory.opponentFailedSuits[card.suit];
      
      if (opponentMayHaveSuit) {
        // If opponent likely has this suit, adjust score
        if (this.personality === 'TrapSetter') {
          // Trap Setter likes to bait with high cards
          score += card.pointValue * 0.5;
        } else if (this.personality === 'Greedy') {
          // Greedy AI prefers to lead with low cards to avoid losing value
          score -= card.pointValue * 0.3;
        }
      } else {
        // If opponent likely doesn't have this suit, they might trump
        if (this.personality === 'Analytical') {
          // Analytical AI is careful with high value cards when opponent might trump
          score -= card.pointValue * 0.5;
        }
      }
      
      // Adjust for remaining cards in hand
      score += this.getContextualCardBonus(card);
      
      // Personality-specific adjustments
      score += this.getPersonalityBonus(card);
      
      return score;
    }
    
    // Score a card when AI is the second player
    private scoreCardAsSecondPlayer(card: Card, firstCard: Card, index: number): number {
      let score = 0;
      
      // Check for special A & 7 trump round scenario
      if (this.isSpecialTrumpRound(firstCard, card)) {
        // Special scoring for A & 7 trump round
        switch (this.personality) {
          case 'Cautious':
            // Cautious AI tries to avoid completing the pair
            if (card.value === 'A' && firstCard.value === '7') {
              score -= 25;
            } else if (card.value === '7' && firstCard.value === 'A') {
              score -= 25;
            }
            break;
          case 'Aggressive':
            // Aggressive AI seeks to complete the pair
            if (card.value === 'A' && firstCard.value === '7') {
              score += 20;
            } else if (card.value === '7' && firstCard.value === 'A') {
              score += 20;
            }
            break;
          case 'Analytical':
            // Analytical AI considers the situation
            if (this.gameState.roundStake > 10) {
              score += 15; // More willing to risk for high stakes
            } else {
              score -= 10; // More cautious with low stakes
            }
            break;
          case 'Greedy':
            // Greedy AI focuses on point values
            score += card.pointValue * 2;
            break;
          case 'TrapSetter':
            // TrapSetter AI uses A & 7 as bait
            if (card.value === 'A' && firstCard.value === '7') {
              score += 15; // Complete the trap
            } else if (card.value === '7' && firstCard.value === 'A') {
              score += 15; // Complete the trap
            }
            break;
          case 'Unpredictable':
            // Unpredictable AI adds randomness
            score += (Math.random() * 30) - 15;
            break;
        }
      } else {
        // Regular scoring logic
        // If we're following suit, score based on comparison
        if (card.suit === firstCard.suit) {
          const cardValue = CARD_POINT_VALUES[card.value];
          const firstCardValue = CARD_POINT_VALUES[firstCard.value];
          
          if (cardValue > firstCardValue) {
            // Can win with this card
            score += 10 + (cardValue - firstCardValue);
            
            // Add the value of cards we'd win
            score += firstCard.pointValue + this.gameState.roundStake;
          } else {
            // Can't win with this card
            if (this.personality === 'Greedy') {
              // Greedy AI tries to minimize losses
              score -= cardValue * 2;
            } else {
              // Other AIs don't mind losing low cards
              score -= cardValue;
            }
          }
        } 
        // If playing trump when opponent didn't
        else if (card.suit === this.gameState.trumpSuit && firstCard.suit !== this.gameState.trumpSuit) {
          // Will win with trump - BUT make it less automatic
          score += Math.max(5, 15 - Math.random() * 10); // Reduce trump value sometimes
          
          // Add value of cards we'd win
          score += firstCard.pointValue + this.gameState.roundStake;
          
          // Adjust based on card value - more nuanced approach
          if (card.pointValue > 5) {
            // Less eager to use high value trumps
            score -= card.pointValue * (0.5 + Math.random() * 0.3);
          }
          
          // Add strategic variation - consider saving trumps for later
          const trumpsInHand = this.gameState.players[this.playerIndex].hand.filter(c => 
              c.suit === this.gameState.trumpSuit).length;
              
          // If we have few trumps left, be more conservative
          if (trumpsInHand <= 2) {
            score -= Math.random() * 8;
          }
          
          // Consider stake - sometimes don't waste trumps on low stakes
          if (this.gameState.roundStake < 5 && Math.random() < 0.4) {
            score -= Math.random() * 10;
          }
        }
        // If can't follow suit and not playing trump
        else {
          // We'll lose this round - dump lowest value card but with some variation
          score -= card.pointValue * (0.8 + Math.random() * 0.4);
          
          // Sometimes prefer to throw high value cards to confuse opponent
          if (Math.random() < 0.15 && card.pointValue > 5) {
            score += Math.random() * 5;
          }
        }
      }
      
      // Add contextual and personality bonuses
      score += this.getContextualCardBonus(card);
      score += this.getPersonalityBonus(card);
      
      return score;
    }
    
    // Get contextual bonus based on game state
    private getContextualCardBonus(card: Card): number {
      let bonus = 0;
      
      // Late game strategy (fewer cards left)
      const cardsLeft = this.gameState.players[this.playerIndex].hand.length;
      if (cardsLeft < 5) {
        // Late game - adjust strategy
        if (card.pointValue > 5) {
          // In late game, play high value cards more aggressively
          bonus += 3;
        }
      }
      
      // Higher stakes means we should try harder to win
      if (this.gameState.roundStake > 0) {
        bonus += Math.min(5, this.gameState.roundStake / 2);
      }
      
      return bonus;
    }
    
    // Get personality-specific bonus
    private getPersonalityBonus(card: Card): number {
      let bonus = 0;
      
      switch (this.personality) {
        case 'Cautious':
          // Cautious AI prefers to hold onto high value cards early
          if (card.pointValue > 5) {
            bonus -= 2;
          }
          break;
          
        case 'Aggressive':
          // Aggressive AI prefers to play high cards early
          if (card.pointValue > 5) {
            bonus += 3;
          }
          break;
          
        case 'Greedy':
          // Greedy AI really focuses on card point values
          bonus += (card.pointValue / 2);
          break;
          
        case 'TrapSetter':
          // TrapSetter likes to bait with mid-value cards
          if (card.pointValue >= 3 && card.pointValue <= 6) {
            bonus += 2;
          }
          break;
          
        case 'Unpredictable':
          // Add randomness
          bonus += (Math.random() * 6) - 3;
          break;
      }
      
      return bonus;
    }
    
    // Change AI personality mid-game (for Adaptive difficulty)
    public adaptPersonality(): void {
      // Always adapt regardless of difficulty level
      
      // Analyze game state
      const myScore = this.gameState.players[this.playerIndex].score;
      const opponentScore = this.gameState.players[this.playerIndex === 0 ? 1 : 0].score;
      const scoreDifference = myScore - opponentScore;
      const cardsLeft = this.gameState.players[this.playerIndex].hand.length;
      const isEndgame = cardsLeft < 4;
      
      // More dynamic adaptation based on context
      if (scoreDifference < -30) {
        // Critically behind - use high-risk personalities
        this.personality = Math.random() < 0.5 ? 'Aggressive' : 'TrapSetter';
        // If in endgame and really behind, go Unpredictable as last resort
        if (isEndgame && scoreDifference < -50) {
          this.personality = 'Unpredictable';
        }
      } else if (scoreDifference < -10) {
        // Significantly behind - use moderate risk approach
        const personalities: PersonalityType[] = ['Analytical', 'Aggressive', 'TrapSetter'];
        this.personality = personalities[Math.floor(Math.random() * personalities.length)];
      } else if (scoreDifference < 10) {
        // Close game - be strategic
        if (this.difficulty === 'Hard' || this.difficulty === 'Adaptive') {
          this.personality = 'Analytical';
        } else {
          // Lower difficulties still make some mistakes
          this.personality = Math.random() < 0.7 ? 'Analytical' : 'Unpredictable';
        }
      } else if (scoreDifference < 30) {
        // Ahead - consolidate lead
        this.personality = Math.random() < 0.7 ? 'Cautious' : 'Analytical';
      } else {
        // Far ahead - play it safe
        this.personality = 'Cautious';
      }
      
      // For hard difficulty, if opponent is predictable, counter their style
      if ((this.difficulty === 'Hard' || this.difficulty === 'Adaptive') && 
          this.memory.opponentBehavior.predictability > 0.7) {
        if (this.memory.opponentBehavior.playsAggressively > 0.5) {
          this.personality = scoreDifference < 0 ? 'Aggressive' : 'Cautious';
        } else if (this.memory.opponentBehavior.savesTrumps > 0.5) {
          this.personality = 'TrapSetter';
        }
      }
    }

    // Update memory with decay
    private updateMemoryWithDecay(): void {
      const { behaviorDecay } = this.memory.decayFactors;
      
      // Apply decay to behavior metrics
      this.memory.opponentBehavior.savesTrumps *= behaviorDecay;
      this.memory.opponentBehavior.playsAggressively *= behaviorDecay;
      this.memory.opponentBehavior.avoidsRisk *= behaviorDecay;
      
      // Remove old actions beyond the limit
      while (this.memory.recentActions.length > this.RECENT_ACTIONS_LIMIT) {
        this.memory.recentActions.shift();
      }
    }

    // Calculate predictability based on recent actions and patterns
    private calculatePredictability(): void {
      const recentActions = this.memory.recentActions;
      if (recentActions.length < 3) return;  // Need at least 3 actions to analyze

      let patternStrength = 0;
      let consistencyScore = 0;
      let situationalVariance = 0;

      // Analyze patterns in recent plays
      for (let i = 1; i < recentActions.length; i++) {
        const current = recentActions[i];
        const previous = recentActions[i - 1];

        // Check for consistent behavior in similar situations
        if (current.situation.roundStake > 10 === previous.situation.roundStake > 10) {
          if (current.card.pointValue > 5 === previous.card.pointValue > 5) {
            consistencyScore += 1;
          }
        }

        // Check for situational adaptation
        if (current.situation.roundStake > 10 && current.card.pointValue > 5) {
          situationalVariance += 1;
        }

        // Check for patterns in suit selection
        if (current.situation.wasLeader && previous.situation.wasLeader) {
          if (current.card.suit === previous.card.suit) {
            patternStrength += 1;
          }
        }
      }

      // Normalize scores
      const total = recentActions.length - 1;
      this.memory.predictabilityMetrics = {
        patternStrength: patternStrength / total,
        consistencyScore: consistencyScore / total,
        situationalVariance: situationalVariance / total
      };

      // Update overall predictability
      this.memory.opponentBehavior.predictability = 
        (this.memory.predictabilityMetrics.patternStrength * 0.4) +
        (this.memory.predictabilityMetrics.consistencyScore * 0.4) +
        (1 - this.memory.predictabilityMetrics.situationalVariance * 0.2);
    }

    // Update long-term opponent profile at the end of the game
    public updateOpponentProfile(gameResult: { won: boolean; score: number }): void {
      if (!this.opponentProfile) return;

      this.opponentProfile.gamesPlayed++;
      if (gameResult.won) this.opponentProfile.wins++;
      
      // Update average score
      this.opponentProfile.averageScore = 
        (this.opponentProfile.averageScore * (this.opponentProfile.gamesPlayed - 1) + gameResult.score) / 
        this.opponentProfile.gamesPlayed;

      // Update play style based on current game stats
      const stats = this.memory.currentGameStats;
      const totalPlays = stats.totalPlays || 1;  // Avoid division by zero

      // Update preferred suits
      Object.entries(stats.suitLeads).forEach(([suit, count]) => {
        const frequency = count / totalPlays;
        if (!this.opponentProfile!.playStyle.preferredSuits[suit as Suit]) {
          this.opponentProfile!.playStyle.preferredSuits[suit as Suit] = frequency;
        } else {
          this.opponentProfile!.playStyle.preferredSuits[suit as Suit] = 
            (this.opponentProfile!.playStyle.preferredSuits[suit as Suit]! * 0.7) + (frequency * 0.3);
        }
      });

      // Update value preference and trump usage
      this.opponentProfile.playStyle.valuePreference = 
        (stats.highValuePlays / totalPlays) * 2 - 1;  // Scale to -1 to 1
      this.opponentProfile.playStyle.trumpUsage = 
        (stats.trumpsPlayed / totalPlays) * 2 - 1;  // Scale to -1 to 1

      // Add current behavior to history
      this.opponentProfile.behaviorHistory.push({
        timestamp: Date.now(),
        ...this.memory.opponentBehavior
      });
    }

    // Create a method to try different personalities and evaluate their performance
    public tryDifferentPersonalities(firstCard: Card): number {
      // Only do this for Hard or Adaptive difficulty when losing
      if ((this.difficulty !== 'Hard' && this.difficulty !== 'Adaptive') || 
          this.gameState.players[this.playerIndex].score >= 
          this.gameState.players[this.playerIndex === 0 ? 1 : 0].score) {
        return this.getSecondPlayerMove(firstCard);
      }
      
      // Save current personality
      const originalPersonality = this.personality;
      const allPersonalities: PersonalityType[] = [
        'Cautious', 'Aggressive', 'Analytical', 'Greedy', 'TrapSetter', 'Unpredictable'
      ];
      
      let bestIndex = -1;
      let bestScore = -Infinity;
      
      // Try each personality
      for (const personality of allPersonalities) {
        this.personality = personality;
        const moveIndex = this.getSecondPlayerMove(firstCard);
        const moveCard = this.gameState.players[this.playerIndex].hand[moveIndex];
        // Estimate how good this move would be
        const estimatedScore = this.evaluateMove(moveCard, firstCard);
        
        if (estimatedScore > bestScore) {
          bestScore = estimatedScore;
          bestIndex = moveIndex;
        }
      }
      
      // Restore original personality
      this.personality = originalPersonality;
      return bestIndex;
    }

    // Helper method to evaluate a potential move
    private evaluateMove(myCard: Card, opponentCard: Card): number {
      let score = 0;
      
      // Will I win this round?
      let willWin = false;
      
      // Check for special A & 7 trump round
      if (this.isSpecialTrumpRound(opponentCard, myCard)) {
        // Special scoring for A & 7 trump round
        return -50; // Very risky, avoid unless desperate
      }
      
      // Check if I'll win
      if (myCard.suit === opponentCard.suit) {
        willWin = CARD_POINT_VALUES[myCard.value] > CARD_POINT_VALUES[opponentCard.value];
      } else if (myCard.suit === this.gameState.trumpSuit) {
        willWin = true;
      } else {
        willWin = false;
      }
      
      // Score based on outcome
      if (willWin) {
        score += opponentCard.pointValue + this.gameState.roundStake;
        score -= myCard.pointValue * 0.5; // Cost of using this card
      } else {
        score -= myCard.pointValue; // Lost card value
      }
      
      return score;
    }

    private calculateRoundImportance(): number {
      const myScore = this.gameState.players[this.playerIndex].score;
      const opponentScore = this.gameState.players[this.playerIndex === 0 ? 1 : 0].score;
      const scoreDifference = Math.abs(myScore - opponentScore);
      const cardsLeft = this.gameState.players[this.playerIndex].hand.length;
      
      // Base importance on score difference and remaining cards
      let importance = 0;
      
      // Critical rounds (endgame or close scores)
      if (cardsLeft < 4) {
        importance += 0.5; // Endgame bonus
      }
      
      if (scoreDifference < 10) {
        importance += 0.3; // Close game bonus
      }
      
      // High stakes rounds
      if (this.gameState.roundStake > 10) {
        importance += 0.2;
      }
      
      return Math.min(1, importance); // Cap at 1.0
    }

    private analyzeOpponentPattern(firstCard: Card): {
      likelyHasTrump: boolean;
      bluffing: boolean;
      aggressive: boolean;
    } {
      const pattern = {
        likelyHasTrump: false,
        bluffing: false,
        aggressive: false
      };
      
      // Check if opponent likely has trump
      if (!this.memory.opponentFailedSuits[this.gameState.trumpSuit]) {
        pattern.likelyHasTrump = true;
      }
      
      // Analyze recent actions for patterns
      if (this.memory.recentActions.length > 0) {
        const recentActions = this.memory.recentActions.slice(-3);
        const highValuePlays = recentActions.filter(action => 
          action.card.pointValue > 5
        ).length;
        
        pattern.aggressive = highValuePlays > 1;
        
        // Check for bluffing patterns
        const bluffingIndicators = recentActions.filter(action =>
          action.card.pointValue < 3 && 
          action.situation.roundStake > 5
        ).length;
        
        pattern.bluffing = bluffingIndicators > 1;
      }
      
      return pattern;
    }

    private getDifficultyMultiplier(): number {
      switch (this.difficulty) {
        case 'Easy':
          return 0.7; // More mistakes
        case 'Medium':
          return 0.85;
        case 'Hard':
          return 1.0;
        case 'Adaptive':
          return this.memory.opponentBehavior.predictability > 0.7 ? 1.1 : 0.9;
        default:
          return 1.0;
      }
    }

    private adjustForOpponentPattern(
      card: Card,
      firstCard: Card,
      pattern: ReturnType<typeof this.analyzeOpponentPattern>
    ): number {
      let adjustment = 0;
      
      // If opponent likely has trump and we're not playing trump
      if (pattern.likelyHasTrump && card.suit !== this.gameState.trumpSuit) {
        adjustment -= 5; // Penalize non-trump plays
      }
      
      // If opponent is bluffing
      if (pattern.bluffing) {
        if (card.pointValue > 5) {
          adjustment += 3; // More willing to call bluffs
        } else {
          adjustment -= 2; // Less likely to play low cards
        }
      }
      
      // If opponent is aggressive
      if (pattern.aggressive) {
        if (card.suit === this.gameState.trumpSuit) {
          adjustment += 4; // More likely to use trump
        }
      }
      
      return adjustment;
    }

    private getPersonalityAdjustment(card: Card, firstCard: Card): number {
      let adjustment = 0;
      
      switch (this.personality) {
        case 'Cautious':
          // Prefer to save high cards and trumps
          if (card.pointValue > 5) {
            adjustment -= 3;
          }
          if (card.suit === this.gameState.trumpSuit) {
            adjustment -= 2;
          }
          break;
          
        case 'Aggressive':
          // More willing to play high cards and trumps
          if (card.pointValue > 5) {
            adjustment += 3;
          }
          if (card.suit === this.gameState.trumpSuit) {
            adjustment += 2;
          }
          break;
          
        case 'Analytical':
          // Balanced approach based on situation
          if (this.gameState.roundStake > 10) {
            if (card.pointValue > 5) {
              adjustment += 2;
            }
          } else {
            if (card.pointValue > 5) {
              adjustment -= 1;
            }
          }
          break;
          
        case 'Greedy':
          // Focus on point values
          adjustment += card.pointValue * 0.5;
          break;
          
        case 'TrapSetter':
          // Prefer to set up future plays
          if (card.pointValue >= 3 && card.pointValue <= 6) {
            adjustment += 2;
          }
          break;
          
        case 'Unpredictable':
          // Add randomness
          adjustment += (Math.random() * 6) - 3;
          break;
      }
      
      return adjustment;
    }

    private evaluateTrumpPlay(card: Card, firstCard: Card, roundImportance: number): number {
      let score = 0;
      
      // Base trump value
      score += 5;
      
      // Adjust based on card value
      if (card.pointValue > 5) {
        score -= 3; // Less eager to use high value trumps
      }
      
      // Consider round importance
      score *= (1 + roundImportance);
      
      // Special case for A & 7 trump round
      if (this.isSpecialTrumpRound(firstCard, card)) {
        score -= 10; // Generally avoid unless necessary
      }
      
      // If opponent led with a high card
      if (firstCard.pointValue > 5) {
        score += 3; // More willing to use trump
      }
      
      return score;
    }

    private getLetWinChance(): number {
      const myScore = this.gameState.players[this.playerIndex].score;
      const opponentScore = this.gameState.players[this.playerIndex === 0 ? 1 : 0].score;
      const scoreDifference = myScore - opponentScore;
      const isBehind = scoreDifference < 0;
      const isSignificantlyBehind = scoreDifference < -20;
      
      switch (this.difficulty) {
        case 'Easy':
          return 0.3; // 30% chance to let opponent win with low card
        case 'Medium':
          return isBehind ? 0.4 : 0.6; // Adjust based on score
        case 'Hard':
          return isSignificantlyBehind ? 0.4 : 0.7; // More aggressive when behind
        case 'Very Hard':
          return isSignificantlyBehind ? 0.3 : 0.8; // Even more aggressive when behind
        case 'Adaptive':
          if (isSignificantlyBehind) {
            return 0.4; // Less likely to let them win when far behind
          } else if (scoreDifference > 20) {
            return 0.8; // More likely to let them win when ahead
          }
          return 0.6; // Default adaptive let-win chance
        default:
          return 0.5; // Default for unknown difficulty
      }
    }

    private runMonteCarloSimulation(card: Card, firstCard: Card): number {
      let totalScore = 0;
      const numSimulations = 100;
      
      for (let i = 0; i < numSimulations; i++) {
        // Simulate possible opponent responses
        const simulatedResponses = this.simulatePossibleResponses(card, this.gameState);
        let roundTotalScore = 0;
        
        for (const response of simulatedResponses) {
          // Evaluate each possible outcome
          const outcomeScore = this.evaluateOutcome(card, response, this.gameState);
          roundTotalScore += outcomeScore;
        }
        
        // Average score for this simulation
        totalScore += roundTotalScore / simulatedResponses.length;
      }
      
      // Return average score across all simulations
      return totalScore / numSimulations;
    }

    private simulatePossibleResponses(card: Card, gameState: GameState): Card[] {
      // Use opponent's history to simulate likely responses
      const opponentHistory = this.memory.opponentProfile.behaviorHistory;
      const similarSituations = opponentHistory.filter(h => 
        h.card.suit === card.suit || h.card.value === card.value
      );
      
      // If we have history, use it to weight possible responses
      if (similarSituations.length > 0) {
        return similarSituations.map(h => h.response);
      }
      
      // Otherwise, simulate random responses from remaining cards
      const remainingCards = this.getRemainingCards(gameState);
      return remainingCards.slice(0, 5); // Return 5 possible responses
    }

    private evaluateOutcome(card: Card, response: Card, gameState: GameState): number {
      // Basic card comparison
      let score = this.compareCards(card, response, gameState.trumpSuit);
      
      // Adjust score based on psychological impact
      if (this.detectBluff(response, gameState)) {
        score *= 1.2; // Bonus for detecting bluff
      }
      
      // Consider sequence potential
      score += this.calculateSequencePotential(card, gameState);
      
      return score;
    }

    private detectBluff(opponentCard: Card, gameState: GameState): boolean {
      const recentHistory = this.memory.opponentProfile?.behaviorHistory
        .slice(-5) || []; // Look at last 5 plays
      
      if (recentHistory.length === 0) return false;
      
      const bluffPattern = recentHistory.some(h => 
        h.card.value === 'A' || h.card.value === 'K'
      );
      
      return bluffPattern;
    }

    private updateTraits(success: boolean, moveType: 'aggressive' | 'defensive' | 'bluff'): void {
      const traits = this.memory.traitEvolution.currentTraits;
      const history = this.memory.traitEvolution.successHistory;
      
      // Update trait based on success and move type
      if (success) {
        switch (moveType) {
          case 'aggressive':
            traits.aggressiveness = Math.min(100, traits.aggressiveness + 5);
            break;
          case 'defensive':
            traits.riskAversion = Math.min(100, traits.riskAversion + 5);
            break;
          case 'bluff':
            traits.deceptionTendency = Math.min(100, traits.deceptionTendency + 5);
            break;
        }
      } else {
        switch (moveType) {
          case 'aggressive':
            traits.aggressiveness = Math.max(0, traits.aggressiveness - 5);
            break;
          case 'defensive':
            traits.riskAversion = Math.max(0, traits.riskAversion - 5);
            break;
          case 'bluff':
            traits.deceptionTendency = Math.max(0, traits.deceptionTendency - 5);
        }
      }
      
      // Record trait change
      history.push({
        traits: { ...traits },
        successRate: success ? 1 : 0,
        timestamp: Date.now()
      });
      
      // If a trait has failed 3 times in a row, reduce it
      const recentFailures = history
        .slice(-3)
        .filter(h => h.successRate === 0);
      
      if (recentFailures.length === 3) {
        switch (moveType) {
          case 'aggressive':
            traits.aggressiveness *= 0.8;
            break;
          case 'defensive':
            traits.riskAversion *= 0.8;
            break;
          case 'bluff':
            traits.deceptionTendency *= 0.8;
        }
      }
    }

    private updateCrossMatchLearning(gameState: GameState): void {
      const lastRound = gameState.roundHistory[gameState.roundHistory.length - 1];
      if (!lastRound) return;
      
      // Update global patterns
      const situation = `${lastRound.player1Card.value} of ${lastRound.player1Card.suit}`;
      const existingPattern = this.memory.crossMatchLearning.globalPatterns.bluffSituations
        .find(p => p.situation === situation);
      
      if (existingPattern) {
        existingPattern.frequency++;
        if (this.detectBluff(lastRound.player1Card, gameState)) {
          existingPattern.successRate = (existingPattern.successRate * (existingPattern.frequency - 1) + 1) / existingPattern.frequency;
        } else {
          existingPattern.successRate = (existingPattern.successRate * (existingPattern.frequency - 1)) / existingPattern.frequency;
        }
      } else {
        this.memory.crossMatchLearning.globalPatterns.bluffSituations.push({
          situation,
          frequency: 1,
          successRate: this.detectBluff(lastRound.player1Card, gameState) ? 1 : 0
        });
      }
    }

    private suppressPredictability(): void {
      if (!this.isVeryHardDifficulty()) return;

      const recentHistory = this.memory.opponentProfile?.behaviorHistory.slice(-5) || [];
      if (recentHistory.length < 3) return;

      // Calculate pattern strength
      let patternStrength = 0;
      for (let i = 1; i < recentHistory.length; i++) {
        const current = recentHistory[i];
        const previous = recentHistory[i - 1];
        
        if (current.card.suit === previous.card.suit) patternStrength += 0.2;
        if (current.card.value === previous.card.value) patternStrength += 0.2;
        if (current.response.suit === previous.response.suit) patternStrength += 0.2;
      }

      // If pattern is too strong, randomize some traits
      if (patternStrength > 0.7) {
        const { currentTraits } = this.memory.traitEvolution;
        currentTraits.aggressiveness += (Math.random() - 0.5) * 0.3;
        currentTraits.riskAversion += (Math.random() - 0.5) * 0.3;
        currentTraits.deceptionTendency += (Math.random() - 0.5) * 0.3;
        
        // Ensure traits stay within bounds
        currentTraits.aggressiveness = Math.max(0, Math.min(100, currentTraits.aggressiveness));
        currentTraits.riskAversion = Math.max(0, Math.min(100, currentTraits.riskAversion));
        currentTraits.deceptionTendency = Math.max(0, Math.min(100, currentTraits.deceptionTendency));
      }
    }

    private isHardDifficulty(): boolean {
      return this.difficulty === 'Hard';
    }

    private isVeryHardDifficulty(): boolean {
      return this.difficulty === 'Very Hard';
    }

    private evolveTraits(success: boolean): void {
      if (!this.isVeryHardDifficulty()) return;

      const { currentTraits, successHistory } = this.memory.traitEvolution;
      const recentSuccessRate = this.calculateRecentSuccessRate();

      // Record current traits and success
      successHistory.push({
        traits: { ...currentTraits },
        successRate: recentSuccessRate,
        timestamp: Date.now()
      });

      // Keep only recent history
      while (successHistory.length > 10) {
        successHistory.shift();
      }

      // Calculate trait adjustments based on success
      const adjustment = success ? 0.1 : -0.1;
      const randomFactor = (Math.random() - 0.5) * 0.2; // Add some randomness

      // Evolve traits based on success and recent history
      currentTraits.aggressiveness = Math.max(0, Math.min(100, 
        currentTraits.aggressiveness + adjustment + randomFactor));
      currentTraits.riskAversion = Math.max(0, Math.min(100, 
        currentTraits.riskAversion - adjustment + randomFactor));
      currentTraits.deceptionTendency = Math.max(0, Math.min(100, 
        currentTraits.deceptionTendency + Math.abs(randomFactor)));
      currentTraits.adaptability = Math.max(0, Math.min(100, 
        currentTraits.adaptability + Math.abs(randomFactor)));
    }

    private calculateRecentSuccessRate(): number {
      const recentHistory = this.memory.traitEvolution.successHistory.slice(-5);
      if (recentHistory.length === 0) return 0.5;
      return recentHistory.reduce((sum, h) => sum + h.successRate, 0) / recentHistory.length;
    }

    private detectDeception(firstCard: Card): boolean {
      if (!this.isVeryHardDifficulty()) return false;

      const { opponentBaitResponses } = this.memory.deceptionTracker;
      
      // Check for bait patterns
      const currentSituation = this.createSituationString(firstCard);
      const matchingPattern = this.memory.crossMatchLearning.globalPatterns.bluffSituations
        .find((p: { situation: string; frequency: number; successRate: number }) => 
          p.situation === currentSituation);
      
      if (matchingPattern && matchingPattern.successRate > 0.7) {
        return true;
      }

      // Analyze card value and stake
      const isSuspiciousValue = CARD_POINT_VALUES[firstCard.value] < 3;
      const isHighStake = this.gameState.roundStake > 10;
      
      if (isSuspiciousValue && isHighStake) {
        // Check cross-match learning for similar situations
        const similarSituations = this.memory.crossMatchLearning.globalPatterns.bluffSituations
          .filter((s: { situation: string; frequency: number; successRate: number }) => 
            Math.abs(s.successRate - this.memory.opponentBehavior.predictability) < 0.2);
            
        if (similarSituations.length > 0) {
          const avgFrequency = similarSituations.reduce((sum, s) => sum + s.frequency, 0) / 
                             similarSituations.length;
          return avgFrequency > 0.6;
        }
      }

      return false;
    }

    private createSituationString(card: Card): string {
      return `${card.suit}-${card.value}-${this.gameState.roundStake}-${this.gameState.players[this.playerIndex].score}`;
    }

    private compareCards(card1: Card, card2: Card, trumpSuit: Suit): number {
      if (card1.suit === trumpSuit && card2.suit !== trumpSuit) return 1;
      if (card1.suit !== trumpSuit && card2.suit === trumpSuit) return -1;
      if (card1.suit === trumpSuit && card2.suit === trumpSuit) {
        return CARD_POINT_VALUES[card1.value] - CARD_POINT_VALUES[card2.value];
      }
      if (card1.suit === card2.suit) {
        return CARD_POINT_VALUES[card1.value] - CARD_POINT_VALUES[card2.value];
      }
      return 0;
    }

    private calculateSequencePotential(card: Card, gameState: GameState): number {
      const hand = gameState.players[this.playerIndex].hand;
      const sameSuitCards = hand.filter(c => c.suit === card.suit);
      const sequenceLength = sameSuitCards.length;
      return sequenceLength * 2; // Bonus for potential sequences
    }

    private getRemainingCards(gameState: GameState): Card[] {
      const allCards = this.generateAllCards();
      const playedCards = gameState.roundHistory.flatMap(round => 
        [round.player1Card, round.player2Card]
      );
      return allCards.filter(card => 
        !playedCards.some(played => 
          played.suit === card.suit && played.value === card.value
        )
      );
    }

    private generateAllCards(): Card[] {
      const suits: Suit[] = ['Spades', 'Hearts', 'Clubs', 'Diamonds'];
      const values: CardValue[] = ['3', '4', '5', '6', '7', 'J', 'Q', 'K', 'A'];
      const cards: Card[] = [];
      
      for (const suit of suits) {
        for (const value of values) {
          cards.push({
            suit,
            value,
            pointValue: CARD_POINT_VALUES[value]
          });
        }
      }
      
      return cards;
    }

    private evaluateCard(card: Card): number {
      if (!this.gameState) return 0;

      const CARD_POINT_VALUES: Record<string, number> = {
        'Ace': 11,
        'King': 4,
        'Queen': 3,
        'Jack': 2,
        '10': 10,
        '9': 0,
        '8': 0,
        '7': 0,
        '6': 0,
        '5': 0,
        '4': 0,
        '3': 0,
        '2': 0
      };

      // Base value of the card
      let value = CARD_POINT_VALUES[card.value] || 0;

      // Add bonus for trump cards
      if (card.suit === this.gameState.trumpSuit) {
        value *= 1.5;
      }

      // Add bonus for high-value cards
      if (value >= 10) {
        value *= 1.2;
      }

      return value;
    }
  }

  export type { PersonalityType, DifficultyLevel, OpponentProfile, AIMemory, Card, Player, Suit, CardValue };