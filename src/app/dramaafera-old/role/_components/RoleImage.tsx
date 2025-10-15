"use client";

import Image from "next/image";
import { useState } from "react";

// Funkcja pomocnicza do generowania ścieżki obrazka roli
function getRoleImagePath(roleName: string): string {
    // Mapowanie specjalnych przypadków
    const specialCases: Record<string, string> = {
        'SoulCollector': 'soul_collector',
        'Soul Collector': 'soul_collector',
        'GuardianAngel': 'guardian_angel',
        'Guardian Angel': 'guardian_angel',
        'TimeLord': 'time_lord',
        'Time Lord': 'time_lord'
    };
    
    // Sprawdź czy to specjalny przypadek
    if (specialCases[roleName]) {
        return `/images/roles/${specialCases[roleName]}.png`;
    }
    
    // Standardowa konwersja: usuń spacje, zamień na małe litery
    const fileName = roleName.toLowerCase().replace(/\s+/g, '');
    return `/images/roles/${fileName}.png`;
}

interface RoleImageProps {
    roleName: string;
    width?: number;
    height?: number;
    className?: string;
}

export function RoleImage({ roleName, width = 128, height = 128, className = "scale-[1.7]" }: RoleImageProps) {
    const [hasError, setHasError] = useState(false);
    
    return (
        <Image
            src={hasError ? "/images/roles/placeholder.png" : getRoleImagePath(roleName)}
            alt={roleName}
            width={width}
            height={height}
            className={className}
            onError={() => setHasError(true)}
        />
    );
}
