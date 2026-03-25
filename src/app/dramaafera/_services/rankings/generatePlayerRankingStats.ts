import type { PlayerRankingStats } from './types';
import { getAllGamesData } from '../games/getAllGamesData';

// Player ranking points data (manually maintained)
const playerRankingPoints: Record<string, number> = {
  "Cleopatrie": 2303,
  "ziomson": 2224,
  "brubel": 2165,
  "Dziekansqr": 2133,
  "DawDu": 2122,
  "Mamika": 2077,
  "Jakubeq": 2016,
  "Nudna": 1983,
  "QukaVadi": 1969,
  "Zieloony": 1961,
  "Miras": 1926,
  "Budyn": 1907,
};

// Generate player ranking statistics
export async function generatePlayerRankingStats(seasonId?: number): Promise<PlayerRankingStats[]> {
  const allGames = await getAllGamesData(seasonId);
  const playerStats = new Map<string, { played: number; won: number }>();

  allGames.forEach(game => {
    game.detailedStats.playersData.forEach(player => {
      const playerName = player.nickname;
      if (!playerStats.has(playerName)) {
        playerStats.set(playerName, { played: 0, won: 0 });
      }
      const stats = playerStats.get(playerName)!;
      stats.played += 1;
      if (player.win) {
        stats.won += 1;
      }
    });
  });

  const rankingStats: PlayerRankingStats[] = Array.from(playerStats.entries()).map(([playerName, stats]) => ({
    name: playerName,
    gamesPlayed: stats.played,
    wins: stats.won,
    winRate: stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0,
    rankingPoints: playerRankingPoints[playerName]
  }));

  rankingStats.sort((a, b) => {
    if (a.winRate !== b.winRate) {
      return b.winRate - a.winRate;
    }
    return b.gamesPlayed - a.gamesPlayed;
  });

  return rankingStats;
}
