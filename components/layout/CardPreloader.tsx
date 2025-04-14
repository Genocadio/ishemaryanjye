"use client";

import { useEffect } from 'react';

const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const values = [ '3', '4', '5', '6', '7', 'J', 'Q', 'K', 'A'];

export default function CardPreloader() {
    useEffect(() => {
        // Preload all card images
        suits.forEach(suit => {
            values.forEach(value => {
                const img = new Image();
                img.src = `/cards/${suit}/${value}.webp`;
            });
        });
    }, []);

    return null; // This component doesn't render anything
} 