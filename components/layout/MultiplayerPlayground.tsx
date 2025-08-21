import React from "react";
import MultiplayerCard from "./MultiplayerCard";
import { PlaygroundEntry, Player } from "@/app/multiplayer/types";

interface MultiplayerPlaygroundProps {
    playground: PlaygroundEntry[];
    allPlayers: Player[];
    currentPlayerName?: string;
    isPlayerTurn?: boolean;
}

const MultiplayerPlayground: React.FC<MultiplayerPlaygroundProps> = ({ playground, allPlayers, currentPlayerName, isPlayerTurn }) => {
    // Determine what to show in the title
    const getPlaygroundTitle = () => {
        if (playground.length === 0) {
            return "Playground";
        }
        
        if (currentPlayerName) {
            return `Waiting for ${currentPlayerName} to play...`;
        }
        
        return "Playground";
    };

    return (
        <div className="my-4">
            <h3 className="text-lg font-semibold text-center mb-2">{getPlaygroundTitle()}</h3>
            <div className="p-4 min-h-[220px] bg-green-50/50 border rounded-lg">
                {playground.length > 0 ? (
                    <div className="flex justify-center">
                        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 max-w-full">
                            {playground.map(({ playerId, card }) => {
                                const pName = allPlayers.find(p => p.id === playerId)?.name ?? "Player";
                                return (
                                    <div key={card.id} className="flex flex-col items-center flex-shrink-0">
                                        <MultiplayerCard card={card} />
                                        <p className="text-xs text-gray-500 mt-1">{pName}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full min-h-[140px]">
                        <p className="text-gray-500 text-center">
                            {isPlayerTurn
                                ? "It's your turn to play."
                                : currentPlayerName 
                                    ? `Waiting for ${currentPlayerName} to play...` 
                                    : "No cards played yet in this round."}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MultiplayerPlayground; 