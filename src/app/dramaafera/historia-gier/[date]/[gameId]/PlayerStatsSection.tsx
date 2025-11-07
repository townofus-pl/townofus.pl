"use client";

import { useState } from 'react';
import Link from "next/link";
import Image from "next/image";
import { TeamColors } from "@/constants/teams";
import type { UIPlayerData } from '../../../_services/gameDataService';
import { formatPlayerStatsWithColors, getRoleColor } from '../../../_services/gameDataService';

// Funkcja pomocnicza do generowania ścieżki avatara
function getPlayerAvatarPath(playerName: string): string {
    return `/images/avatars/${playerName}.png`;
}

// Funkcja pomocnicza do konwersji nicku na format URL-friendly
function convertNickToUrlSlug(nick: string): string {
    return nick.replace(/\s+/g, '-').toLowerCase();
}

// Funkcja pomocnicza do konwersji nazwy roli na format URL-friendly
function convertRoleToUrlSlug(role: string): string {
    return role.toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]/g, '');
}

// Helper function to convert database role names to display names
function convertRoleNameForDisplay(roleName: string): string {
    const roleNameMapping: Record<string, string> = {
        'SoulCollector': 'Soul Collector',
        'Soul Collector': 'Soul Collector',
        'GuardianAngel': 'Guardian Angel',
        'Guardian Angel': 'Guardian Angel',
    };
    return roleNameMapping[roleName] || roleName;
}

function renderRoleHistory(roleHistory: string[] | undefined) {
    if (!roleHistory || roleHistory.length <= 1) {
        const role = roleHistory?.[roleHistory.length - 1] || 'Unknown';
        const displayRoleName = convertRoleNameForDisplay(role);
        const roleColor = getRoleColor(displayRoleName);
        return (
            <Link href={`/dramaafera/role/${convertRoleToUrlSlug(displayRoleName)}`}>
                <span 
                    className="px-3 py-1 rounded-lg text-base font-semibold hover:opacity-80 transition-opacity cursor-pointer inline-flex items-center h-8"
                    style={{ 
                        backgroundColor: `${roleColor}20`, 
                        color: roleColor,
                        border: `1px solid ${roleColor}40`
                    }}
                >
                    {displayRoleName}
                </span>
            </Link>
        );
    }

    return (
        <div className="flex items-center gap-1">
            {roleHistory.map((role, roleIndex) => {
                const displayRoleName = convertRoleNameForDisplay(role);
                const roleColor = getRoleColor(displayRoleName);
                return (
                    <span key={roleIndex} className="flex items-center">
                        <Link href={`/dramaafera/role/${convertRoleToUrlSlug(displayRoleName)}`}>
                            <span 
                                className="px-3 py-1 rounded-lg text-base font-semibold hover:opacity-80 transition-opacity cursor-pointer inline-flex items-center h-8"
                                style={{ 
                                    backgroundColor: `${roleColor}20`, 
                                    color: roleColor,
                                    border: `1px solid ${roleColor}40`
                                }}
                            >
                                {displayRoleName}
                            </span>
                        </Link>
                        {roleIndex < roleHistory.length - 1 && (
                            <span className="mx-2 text-white font-bold text-lg">{'>'}</span>
                        )}
                    </span>
                );
            })}
        </div>
    );
}

interface PlayerStatsSectionProps {
    playersData: UIPlayerData[];
    maxTasks: number;
}

type SortType = 'points' | 'alphabetical';

export function PlayerStatsSection({ playersData, maxTasks }: PlayerStatsSectionProps) {
    const [sortType, setSortType] = useState<SortType>('points');

    const sortedPlayers = [...playersData].sort((a, b) => {
        if (sortType === 'points') {
            return b.totalPoints - a.totalPoints;
        } else {
            return a.nickname.localeCompare(b.nickname);
        }
    });

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-bold">📊 Statystyki Graczy</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setSortType('points')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            sortType === 'points'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                        Standardowo
                    </button>
                    <button
                        onClick={() => setSortType('alphabetical')}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                            sortType === 'alphabetical'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                    >
                        Alfabetycznie
                    </button>
                </div>
            </div>
            <div className="space-y-4">
                {sortedPlayers.map((player, index) => (
                    <div key={index} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
                        <div className="flex flex-col space-y-3">
                            {/* Nazwa gracza */}
                            <div className="flex items-center space-x-3">
                                <Image
                                    src={getPlayerAvatarPath(player.nickname)}
                                    alt={`Avatar ${player.nickname}`}
                                    width={48}
                                    height={48}
                                    className="rounded-full border-2"
                                    style={{
                                        borderColor: 
                                            player.team === 'Crewmate' ? TeamColors.Crewmate :
                                            player.team === 'Impostor' ? TeamColors.Impostor :
                                            TeamColors.Neutral
                                    }}
                                />
                                <div className="flex items-center space-x-3">
                                    <Link 
                                        href={`/dramaafera/user/${convertNickToUrlSlug(player.nickname)}`}
                                        className="text-xl font-bold text-white hover:text-orange-300 transition-colors"
                                    >
                                        {player.nickname}
                                    </Link>
                                    <span 
                                        className="text-lg"
                                        style={{
                                            color: 
                                                player.team === 'Crewmate' ? TeamColors.Crewmate :
                                                player.team === 'Impostor' ? TeamColors.Impostor :
                                                TeamColors.Neutral
                                        }}
                                    >
                                        ({player.team})
                                    </span>
                                    {player.win && (
                                        <span className="text-yellow-400 text-lg">🏆</span>
                                    )}
                                </div>
                            </div>
                            
                            {/* Rola i modyfikatory */}
                            <div className="flex flex-wrap items-center gap-2">
                                {renderRoleHistory(player.roleHistory)}
                                
                                {player.modifiers.length > 0 && player.modifiers.map((modifier, modIndex) => (
                                    <span 
                                        key={modIndex}
                                        className="px-3 py-1 rounded-lg text-base font-semibold hover:opacity-80 transition-opacity inline-flex items-center h-8"
                                        style={{
                                            backgroundColor: `${player.modifierColors[modIndex] || '#6B7280'}30`,
                                            color: player.modifierColors[modIndex] || '#9CA3AF',
                                            border: `1px solid ${player.modifierColors[modIndex] || '#6B7280'}40`
                                        }}
                                    >
                                        {modifier}
                                    </span>
                                ))}
                            </div>
                            
                            {/* Statystyki jako tekst */}
                            <div className="text-base leading-relaxed flex flex-wrap items-center gap-1">
                                {formatPlayerStatsWithColors(player, maxTasks).length > 0 ? (
                                    formatPlayerStatsWithColors(player, maxTasks).map((stat, statIndex) => (
                                        <span key={statIndex}>
                                            <span 
                                                style={{ color: stat.color || '#D1D5DB' }}
                                                className="font-medium"
                                            >
                                                {stat.text}
                                            </span>
                                            {statIndex < formatPlayerStatsWithColors(player, maxTasks).length - 1 && (
                                                <span className="text-gray-400 mx-1">•</span>
                                            )}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-gray-400">No additional statistics</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
