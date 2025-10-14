"use client";

import { useState, useEffect } from "react";

// Mapowanie wartości slotów na nazwę kategorii
const SLOT_CATEGORIES = {
    0: "Crew Investigative",
    1: "Crew Killing", 
    2: "Crew Power",
    3: "Crew Protective",
    4: "Crew Support",
    5: "Common Crew",
    6: "Special Crew",
    7: "Random Crew",
    8: "Neutral Benign",
    9: "Neutral Evil",
    10: "Neutral Killing",
    11: "Common Neutral",
    12: "Random Neutral", 
    13: "Imp Concealing",
    14: "Imp Killing",
    15: "Imp Support",
    16: "Common Imp",
    17: "Random Imp",
    18: "Non-Imp",
    19: "Any"
};

// Kolory dla kategorii
const CATEGORY_COLORS = {
    "Crew Investigative": "#00FFFF",
    "Crew Killing": "#00FFFF",
    "Crew Power": "#00FFFF",
    "Crew Protective": "#00FFFF",
    "Crew Support": "#00FFFF",
    "Common Crew": "#00FFFF",
    "Special Crew": "#00FFFF",
    "Random Crew": "#00FFFF",
    "Neutral Benign": "#B3FFFF",
    "Neutral Evil": "#8C4005",
    "Neutral Killing": "#E6FFB3",
    "Common Neutral": "#FFE64D",
    "Random Neutral": "#FFF2B3",
    "Imp Concealing": "#FF0000",
    "Imp Killing": "#FF0000",
    "Imp Support": "#FF0000",
    "Common Imp": "#FF0000",
    "Random Imp": "#FF0000",
    "Non-Imp": "#CCCCCC",
    "Any": "#FFFFFF"
};

interface Slot {
    number: number;
    categoryValue: number;
    categoryName: string;
    color: string;
}

interface SlotsDisplayProps {
    fileContent: string | null;
}

export function SlotsDisplay({ fileContent }: SlotsDisplayProps) {
    const [slots, setSlots] = useState<Slot[]>([]);

    useEffect(() => {
        if (!fileContent) return;

        const lines = fileContent.split("\n").map(l => l.trim()).filter(Boolean);
        const slotData: Slot[] = [];

        for (let i = 0; i < lines.length - 1; i += 2) {
            const line = lines[i];
            if (line.startsWith("Slot ")) {
                const slotNumber = parseInt(line.replace("Slot ", ""));
                const categoryValue = parseInt(lines[i + 1]);
                const categoryName = SLOT_CATEGORIES[categoryValue as keyof typeof SLOT_CATEGORIES] || "Unknown";
                const color = CATEGORY_COLORS[categoryName as keyof typeof CATEGORY_COLORS] || "#CCCCCC";

                slotData.push({
                    number: slotNumber,
                    categoryValue,
                    categoryName,
                    color
                });
            }
        }

        // Sortuj według numeru slotu
        slotData.sort((a, b) => a.number - b.number);
        setSlots(slotData);
    }, [fileContent]);

    if (slots.length === 0) {
        return null;
    }

    return (
        <div className="bg-zinc-900/50 backdrop-blur-md rounded-xl border border-zinc-700/50 p-4 mb-6">
            <h3 className="text-lg font-semibold text-yellow-400 mb-3">
                Sloty (1-15)
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-8 gap-2">
                {slots.map((slot) => (
                    <div 
                        key={slot.number}
                        className="bg-zinc-800/30 rounded-lg p-2 border border-zinc-700/30 hover:bg-zinc-700/30 transition-colors text-center"
                    >
                        <div className="text-sm font-bold text-white mb-1">
                            {slot.number}
                        </div>
                        <div 
                            className="text-xs px-2 py-1 rounded text-black font-medium"
                            style={{ 
                                backgroundColor: slot.color,
                                opacity: 0.8
                            }}
                        >
                            {slot.categoryName}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
