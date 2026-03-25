"use client";

import { useState } from 'react';
import Link from "next/link";
import Image from "next/image";
import { TeamColors } from "@/constants/teams";
import type { UIPlayerData } from '../../../_services/games/types';
import { formatPlayerStatsWithColors } from '@/app/dramaafera/_utils/formatPlayerStats';
import { getRoleColor, convertRoleNameForDisplay, convertNickToUrlSlug, convertRoleToUrlSlug, getPlayerAvatarPath } from '@/app/dramaafera/_utils/gameUtils';
import { buildSeasonUrl } from '@/app/dramaafera/_utils/seasonHelpers';

function renderRoleHistory(roleHistory: string[] | undefined, seasonId: number) {
    if (!roleHistory || roleHistory.length <= 1) {
        const role = roleHistory?.[roleHistory.length - 1] || 'Unknown';
        const displayRoleName = convertRoleNameForDisplay(role);
        const roleColor = getRoleColor(displayRoleName);
        return (
            <Link href={buildSeasonUrl(`/role/${convertRoleToUrlSlug(displayRoleName)}`, seasonId)}>
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
                        <Link href={buildSeasonUrl(`/role/${convertRoleToUrlSlug(displayRoleName)}`, seasonId)}>
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
    seasonId: number;
}

type SortType = 'points' | 'alphabetical';

export function PlayerStatsSection({ playersData, maxTasks, seasonId }: PlayerStatsSectionProps) {
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
                                        href={buildSeasonUrl(`/user/${convertNickToUrlSlug(player.nickname)}`, seasonId)}
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
                                {renderRoleHistory(player.roleHistory, seasonId)}
                                
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
                                {(() => {
                                    const stats = formatPlayerStatsWithColors(player, maxTasks);
                                    return stats.length > 0 ? (
                                        stats.map((stat, statIndex) => (
                                            <span key={statIndex}>
                                                <span 
                                                    style={{ color: stat.color || '#D1D5DB' }}
                                                    className="font-medium"
                                                >
                                                    {stat.text}
                                                </span>
                                                {statIndex < stats.length - 1 && (
                                                    <span className="text-gray-400 mx-1">•</span>
                                                )}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-400">No additional statistics</span>
                                    );
                                })()}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
