// Types for better type safety
import { withoutDeleted } from '../schema/common';
import type { PrismaClient, Player, GamePlayerStatistics, PlayerRanking } from '@prisma/client';
import { PlayerRankingReason } from '../_constants/rankingTypes';

// Stałe systemu rankingowego (eksportowane — używane też w serwisach rankingowych)
export const RANKING_CONSTANTS = {
  W: 9,              // Współczynnik wpływu gry na ranking
  PEN: 5,            // Kara za nieobecność
  START_RATING: 2000 // Startowy ranking dla nowych graczy
};

interface PlayerGameData {
  id: number;
  name: string;
  totalPoints: number;
  previousRating: number;
  isPresent: boolean;
}

interface RankingCalculationResult {
  playersUpdated: number;
  presentPlayers: number;
  absentPlayers: number;
  calculations: {
    sumP: number;
    sumR: number;
    absentCount: number;
  };
}

/**
 * Oblicza ranking dla wszystkich graczy po danej grze
 */
export async function calculateRankingForGame(
  prisma: PrismaClient,
  gameId: number
): Promise<RankingCalculationResult> {
  
  console.log(`🎯 Starting ranking calculation for game ${gameId}`);

  // Cloudflare D1 nie obsługuje interaktywnych transakcji, więc robimy bez transakcji
  try {
    
    // 1. Pobierz dane gry
    const game = await prisma.game.findFirst({
      where: { id: gameId, ...withoutDeleted },
      select: { 
        id: true, 
        startTime: true, 
        gameIdentifier: true,
        season: true,
        gamePlayerStatistics: {
          include: {
            player: true
          }
        }
      }
    });

    if (!game) {
      throw new Error(`Game ${gameId} not found`);
    }

    // 2. Sprawdź czy gra nie jest za stara dla rankingu
    const lastRanking = await prisma.playerRanking.findFirst({
      orderBy: { createdAt: 'desc' },
      include: { game: true }
    });

    if (lastRanking?.game && lastRanking.game.startTime >= game.startTime) {
      throw new Error(`Game too old for ranking. Last ranking game: ${lastRanking.game.gameIdentifier}`);
    }

    // 3. Sprawdź czy ranking dla tej gry już istnieje
    const existingRanking = await prisma.playerRanking.findFirst({
      where: { 
        gameId: gameId,
        ...withoutDeleted 
      }
    });

    if (existingRanking) {
      throw new Error(`Ranking already calculated for game ${game.gameIdentifier}`);
    }

    console.log(`📊 Processing ${game.gamePlayerStatistics.length} present players`);

    // 4. Pobierz wszystkich graczy w systemie
    const allPlayers = await prisma.player.findMany({
      where: withoutDeleted,
      include: {
        currentRanking: true
      }
    });

    console.log(`👥 Found ${allPlayers.length} total players in system`);

    // 5. Przygotuj dane graczy - obecnych i nieobecnych
    const presentPlayerIds = new Set(game.gamePlayerStatistics.map((gps: GamePlayerStatistics) => gps.playerId));
    
    const playersData: PlayerGameData[] = allPlayers.map((player: Player & { currentRanking?: PlayerRanking | null }) => {
      const isPresent = presentPlayerIds.has(player.id);
      const gameStats = isPresent 
        ? game.gamePlayerStatistics.find((gps: GamePlayerStatistics) => gps.playerId === player.id)
        : null;
      
      return {
        id: player.id,
        name: player.name,
        totalPoints: gameStats?.totalPoints || 0,
        previousRating: player.currentRanking?.score || RANKING_CONSTANTS.START_RATING,
        isPresent
      };
    });

    const presentPlayers = playersData.filter(p => p.isPresent);
    const absentPlayers = playersData.filter(p => !p.isPresent);

    console.log(`✅ Present: ${presentPlayers.length}, ❌ Absent: ${absentPlayers.length}`);

    // 6. Oblicz zmienne wzoru
    const sumP = presentPlayers.reduce((sum, p) => sum + p.totalPoints, 0);
    const sumR = presentPlayers.reduce((sum, p) => sum + p.previousRating, 0);
    const absentCount = absentPlayers.filter(p => p.previousRating > 2000).length;

    console.log(`📈 Calculations: SumP=${sumP}, SumR=${sumR}, AbsentCount=${absentCount}`);

    if (sumR === 0) {
      throw new Error('Sum of previous ratings cannot be zero');
    }

    // 7. Oblicz nowe rankingi
    const newRankings: Array<{ playerId: number; newRating: number; reason: PlayerRankingReason }> = [];

    // Dla obecnych graczy
    for (const player of presentPlayers) {
      const { W, PEN } = RANKING_CONSTANTS;
      const P_i = player.totalPoints;
      const Rs_i = player.previousRating;
      
      const expectedPoints = sumP * (Rs_i / sumR);
      const bonusPoints = PEN * absentCount * Rs_i / sumR;
      const ratingChange = W * (P_i - expectedPoints) + bonusPoints;
      
      const newRating = Rs_i + ratingChange;
      
      newRankings.push({
        playerId: player.id,
        newRating,
        reason: PlayerRankingReason.GameResult
      });

      console.log(`🎮 ${player.name}: ${Rs_i} + ${ratingChange.toFixed(2)} = ${newRating.toFixed(2)}`);
    }

    // Dla nieobecnych graczy
    for (const player of absentPlayers) {
      const { PEN } = RANKING_CONSTANTS;
      const Rs_i = player.previousRating;
      const penalty = Rs_i > 2000 ? PEN : 0;
      const newRating = Rs_i - penalty;
      
      newRankings.push({
        playerId: player.id,
        newRating,
        reason: penalty > 0 ? PlayerRankingReason.AbsencePenalty : PlayerRankingReason.AbsenceNoPenalty
      });

      if (penalty > 0) {
        console.log(`❌ ${player.name}: ${Rs_i} - ${penalty} = ${newRating} (penalty)`);
      }
    }

    // 8. Zapisz nowe rankingi do bazy
    const createdRankings = [];
    
    for (const ranking of newRankings) {
      const newRankingRecord = await prisma.playerRanking.create({
        data: {
          playerId: ranking.playerId,
          gameId: gameId,
          score: ranking.newRating,
          reason: ranking.reason,
          season: game.season
        }
      });
      
      createdRankings.push(newRankingRecord);
    }

    // 9. Aktualizuj currentRankingId dla wszystkich graczy
    for (const ranking of createdRankings) {
      await prisma.player.update({
        where: { id: ranking.playerId },
        data: { currentRankingId: ranking.id }
      });
    }

    console.log(`✅ Updated rankings for ${newRankings.length} players`);

    return {
      playersUpdated: newRankings.length,
      presentPlayers: presentPlayers.length,
      absentPlayers: absentPlayers.length,
      calculations: {
        sumP,
        sumR,
        absentCount
      }
    };

  } catch (error) {
    console.error(`❌ Ranking calculation failed for game ${gameId}:`, error);
    throw error;
  }
}