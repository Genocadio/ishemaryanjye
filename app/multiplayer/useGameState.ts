"use client";

import { useState, useCallback } from "react";
import {
  Player,
  CardType,
  PlaygroundEntry,
  Teams,
  ConnectionState,
} from "./types";

// This is the structure of the gameState object received from the backend.
// It's not fully typed here to avoid duplicating the backend types, but it's
// compatible with the structures defined in the multiplayer page.
type GameState = any;

export const useGameState = () => {
  const [connectionState, setConnectionState] = useState<ConnectionState>({});
  const [teams, setTeams] = useState<Teams | null>(null);
  const [hand, setHand] = useState<CardType[]>([]);
  const [playground, setPlayground] = useState<PlaygroundEntry[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [teamSize, setTeamSize] = useState<number>(1);

  const updateStateFromGameState = useCallback((gameState: GameState) => {
    if (!gameState) return;

    // 1. Update players
    if (gameState.players?.all) {
      setAllPlayers(gameState.players.all);
    }

    // 2. Update teams with combined score data
    if (gameState.teams && gameState.scores) {
      const updatedTeams: Teams = {
        team1: {
          ...gameState.teams.team1,
          score: gameState.scores.totalPoints.team1,
          roundWins: gameState.scores.roundWins.team1,
        },
        team2: {
          ...gameState.teams.team2,
          score: gameState.scores.totalPoints.team2,
          roundWins: gameState.scores.roundWins.team2,
        },
      };
      setTeams(updatedTeams);
      
      // Extract team size from teams data
      if (gameState.teams.team1?.totalSlots) {
        setTeamSize(gameState.teams.team1.totalSlots);
      }
    }

    // 3. Update hand and playground from gameplay object
    if (gameState.gameplay) {
      setHand(gameState.gameplay.yourHand || []);
      setPlayground(gameState.gameplay.playground || []);
    }

    // 4. Update overall connection state from match and players objects
    if (gameState.match && gameState.players) {
      const currentPlayerId = gameState.players.current;
      const currentPlayer = currentPlayerId
        ? gameState.players.all.find((p: Player) => p.id === currentPlayerId)
        : null;

      setConnectionState((prev: ConnectionState) => ({
        ...prev,
        matchId: gameState.match.id ?? prev.matchId,
        matchStatus: gameState.match.status,
        trumpSuit: gameState.match.trumpSuit,
        currentRound: gameState.match.currentRound,
        currentPlayerId: currentPlayerId,
        currentPlayerName: currentPlayer?.name,
      }));
    }
  }, []);

  return {
    connectionState,
    setConnectionState,
    teams,
    setTeams,
    hand,
    setHand,
    playground,
    setPlayground,
    allPlayers,
    teamSize,
    setTeamSize,
    updateStateFromGameState,
  };
}; 