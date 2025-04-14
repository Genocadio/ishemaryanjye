"use client";

import { useEffect } from 'react';

const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

export default function CardPreloader() {
    useEffect(() => {
        // Preload all card images
        suits.forEach(suit => {
            values.forEach(value => {
                const img = new Image();
                img.src = `/cards/${value}_of_${suit}.png`;
            });
        });
    }, []);

    return null; // This component doesn't render anything
} 