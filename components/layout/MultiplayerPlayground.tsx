import React from "react";
import MultiplayerCard from "./MultiplayerCard";
import { PlaygroundEntry, Player } from "@/app/multiplayer/types";

interface MultiplayerPlaygroundProps {
    playground: PlaygroundEntry[];
    allPlayers: Player[];
    currentPlayerName?: string;
}

const MultiplayerPlayground: React.FC<MultiplayerPlaygroundProps> = ({ playground, allPlayers, currentPlayerName }) => {
    return (
        <div className="my-4">
            <h3 className="text-lg font-semibold text-center mb-2">Playground</h3>
            <div className="flex justify-center items-center gap-4 p-4 min-h-[220px] bg-green-50/50 border rounded-lg">
                {playground.length > 0 ? (
                    playground.map(({ playerId, card }) => {
                        const pName = allPlayers.find(p => p.id === playerId)?.name ?? "Player";
                        return (
                            <div key={card.id} className="flex flex-col items-center">
                                <MultiplayerCard card={card} />
                                <p className="text-xs text-gray-500 mt-1">{pName}</p>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-gray-500">
                        {currentPlayerName ? `Waiting for ${currentPlayerName} to play...` : "No cards played yet in this round."}
                    </p>
                )}
            </div>
        </div>
    );
};

export default MultiplayerPlayground; 