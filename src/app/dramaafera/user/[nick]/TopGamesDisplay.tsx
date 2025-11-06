"use client";

import type { PlayerTopGame } from '../../_services/gameDataService';
import Link from 'next/link';

interface TopGamesDisplayProps {
  bestGames: PlayerTopGame[];
}

export function TopGamesDisplay({ bestGames }: TopGamesDisplayProps) {
  const games = bestGames;

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  };

  const formatDateForUrl = (date: Date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
  };

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0: return 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/50';
      case 1: return 'from-gray-400/20 to-gray-500/20 border-gray-400/50';
      case 2: return 'from-orange-600/20 to-orange-700/20 border-orange-600/50';
      default: return 'from-zinc-800/20 to-zinc-900/20 border-zinc-700/50';
    }
  };

  const getMedalIcon = (index: number) => {
    switch (index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '🏅';
    }
  };

  if (games.length === 0) return null;

  return (
    <div className="space-y-4">
      {games.map((game, index) => (
          <Link
            key={game.gameIdentifier}
            href={`/dramaafera/historia-gier/${formatDateForUrl(game.date)}/${game.gameIdentifier}`}
            className="block"
          >
            <div className={`bg-gradient-to-r ${getMedalColor(index)} rounded-xl border p-4 hover:scale-[1.02] transition-all duration-200 cursor-pointer`}>
              <div className="flex items-center gap-4">
                {/* Medal/Position */}
                <div className="text-4xl flex-shrink-0">
                  {getMedalIcon(index)}
                </div>

                {/* Game Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-white">
                      {formatDate(game.date)}
                    </span>
                    <span className="text-sm text-gray-400">•</span>
                    <span 
                      className="font-semibold"
                      style={{ color: game.roleColor }}
                    >
                      {game.role}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-300">
                    <div className="flex items-center gap-1">
                      {game.win ? (
                        <span className="text-green-400">✓ Wygrana</span>
                      ) : (
                        <span className="text-red-400">✗ Przegrana</span>
                      )}
                    </div>
                    <span className="text-gray-500">•</span>
                    <span>{game.map}</span>
                    <span className="text-gray-500">•</span>
                    <span>{game.duration}</span>
                  </div>
                </div>

                {/* Arrow indicator */}
                <div className="text-gray-400 flex-shrink-0">
                  →
                </div>
              </div>
            </div>
          </Link>
        ))}
      
      <div className="mt-4 text-center text-sm text-gray-400">
        Kliknij aby zobaczyć szczegóły gry
      </div>
    </div>
  );
}

export default TopGamesDisplay;
