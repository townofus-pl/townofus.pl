import { getPrismaClient } from '../../_database';
import { withoutDeleted } from '../../schema/common';
import type { GameData } from '../../schema/games';
import { calculateRankingForGame } from '../../_utils/rankingCalculator';

export interface CreateGameResult {
  gameId: number;
  gameIdentifier: string;
  playersCreated: number;
  eventsCreated: number;
  meetingsCreated: number;
  rankingCalculated?: boolean;
  rankingError?: string;
}

export async function createGameFromData(
  prisma: ReturnType<typeof getPrismaClient>,
  gameData: GameData
): Promise<CreateGameResult> {
  const { metadata, players, gameEvents, meetings } = gameData;

  // Parse start and end times (handle format "2025-08-27 21:56:26")
  const startTime = new Date(metadata.startTime.replace(' ', 'T'));
  const endTime = new Date(metadata.endTime.replace(' ', 'T'));
  
  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
    throw new Error('Invalid date format in metadata. Expected format: YYYY-MM-DD HH:MM:SS');
  }

  // Generate gameIdentifier from startTime (YYYYMMDD_HHMM format)
  const year = startTime.getFullYear();
  const month = String(startTime.getMonth() + 1).padStart(2, '0');
  const day = String(startTime.getDate()).padStart(2, '0');
  const hours = String(startTime.getHours()).padStart(2, '0');
  const minutes = String(startTime.getMinutes()).padStart(2, '0');
  const gameIdentifier = `${year}${month}${day}_${hours}${minutes}`;

  // Check if game already exists
  const existingGame = await prisma.game.findUnique({
    where: { gameIdentifier }
  });

  if (existingGame) {
    throw new Error(`Game with identifier ${gameIdentifier} already exists`);
  }

  // Determine winner team from player stats
  const winners = players.filter(p => p.win === 1);
  let winnerTeam: string | null = null;
  let winCondition: string | null = null;

  if (winners.length > 0) {
    // For simplicity, determine team based on common roles
    // This is a basic implementation - you might want to enhance this logic
    const winnerRoles = winners.map(w => w.roleHistory[0]?.toLowerCase() || '');
    
    const impostorRoles = ['impostor', 'shapeshifter', 'morphling', 'swooper', 'glitch', 'venerer'];
    const neutralRoles = ['jester', 'executioner', 'arsonist', 'plaguebearer', 'doomsayer', 'amnesiac'];
    
    if (winnerRoles.some(role => impostorRoles.includes(role))) {
      winnerTeam = 'Impostor';
    } else if (winnerRoles.some(role => neutralRoles.includes(role))) {
      winnerTeam = 'Neutral';
    } else {
      winnerTeam = 'Crewmate';
    }
    
    if (winners.length === 1) {
      winCondition = `${winners[0].roleHistory[0]} victory`;
    } else {
      winCondition = `${winnerTeam} victory`;
    }
  }

  try {
    // Step 1: Create or get players (each player is independent)
    const playerMap = new Map<string, number>();
    
    for (const playerData of players) {
      const playerName = playerData.playerName.trim();
      
      // Try to find existing player
      let player = await prisma.player.findFirst({
        where: {
          name: playerName,
          ...withoutDeleted
        }
      });

      // Create player if doesn't exist
      if (!player) {
        player = await prisma.player.create({
          data: {
            name: playerName
          }
        });
      }

      playerMap.set(playerName, player.id);
    }

    // Step 2: Create the game
    const game = await prisma.game.create({
      data: {
        gameIdentifier,
        startTime,
        endTime,
        map: metadata.map,
        maxTasks: metadata.maxTasks || null,
        winnerTeam,
        winCondition
      }
    });

    // Step 3: Create game player statistics
    const gamePlayerStatsMap = new Map<string, number>();
    
    for (const playerData of players) {
      const playerId = playerMap.get(playerData.playerName.trim())!;
      
      const gamePlayerStats = await prisma.gamePlayerStatistics.create({
        data: {
          gameId: game.id,
          playerId,
          win: playerData.win === 1,
          disconnected: playerData.disconnected === 1,
          initialRolePoints: playerData.initialRolePoints,
          correctKills: playerData.correctKills,
          incorrectKills: playerData.incorrectKills,
          correctProsecutes: playerData.correctProsecutes,
          incorrectProsecutes: playerData.incorrectProsecutes,
          correctGuesses: playerData.correctGuesses,
          incorrectGuesses: playerData.incorrectGuesses,
          correctDeputyShoots: playerData.correctDeputyShoots,
          incorrectDeputyShoots: playerData.incorrectDeputyShoots,
          correctJailorExecutes: playerData.correctJailorExecutes,
          incorrectJailorExecutes: playerData.incorrectJailorExecutes,
          correctMedicShields: playerData.correctMedicShields,
          incorrectMedicShields: playerData.incorrectMedicShields,
          correctWardenFortifies: playerData.correctWardenFortifies,
          incorrectWardenFortifies: playerData.incorrectWardenFortifies,
          janitorCleans: playerData.janitorCleans,
          completedTasks: playerData.completedTasks,
          survivedRounds: playerData.survivedRounds,
          correctAltruistRevives: playerData.correctAltruistRevives,
          incorrectAltruistRevives: playerData.incorrectAltruistRevives,
          correctSwaps: playerData.correctSwaps,
          incorrectSwaps: playerData.incorrectSwaps,
          totalPoints: playerData.totalPoints
        }
      });

      gamePlayerStatsMap.set(playerData.playerName.trim(), gamePlayerStats.id);

      // Create role history for this player
      for (let i = 0; i < playerData.roleHistory.length; i++) {
        await prisma.playerRole.create({
          data: {
            gamePlayerStatisticsId: gamePlayerStats.id,
            roleName: playerData.roleHistory[i],
            order: i
          }
        });
      }

      // Create modifiers for this player
      for (const modifier of playerData.modifiers) {
        await prisma.playerModifier.create({
          data: {
            gamePlayerStatisticsId: gamePlayerStats.id,
            modifierName: modifier
          }
        });
      }
    }

    // Step 4: Create game events
    for (const event of gameEvents) {
      // Extract player information from event description if possible
      const playerId: number | null = null;
      const targetId: number | null = null;
      let eventType: string | null = null;

      // Basic event type detection
      const description = event.description.toLowerCase();
      if (description.includes('killed')) {
        eventType = 'kill';
      } else if (description.includes('meeting') || description.includes('reported')) {
        eventType = 'meeting';
      } else if (description.includes('voted') || description.includes('exiled')) {
        eventType = 'vote';
      } else if (description.includes('task')) {
        eventType = 'task';
      } else if (description.includes('sabotage')) {
        eventType = 'sabotage';
      } else if (description.includes('vent')) {
        eventType = 'vent';
      } else {
        eventType = 'other';
      }

      await prisma.gameEvent.create({
        data: {
          gameId: game.id,
          timestamp: event.timestamp,
          description: event.description,
          eventType,
          playerId,
          targetId
        }
      });
    }

    // Step 5: Create meetings and related data
    for (const meetingData of meetings) {
      const meeting = await prisma.meeting.create({
        data: {
          gameId: game.id,
          meetingNumber: meetingData.meetingNumber,
          deathsSinceLastMeeting: JSON.stringify(meetingData.deathsSinceLastMeeting),
          wasTie: meetingData.wasTie,
          wasBlessed: meetingData.wasBlessed
        }
      });

      // Create votes
      for (const [targetName, voterNames] of Object.entries(meetingData.votes)) {
        const targetPlayerId = playerMap.get(targetName.trim());
        if (targetPlayerId) {
          for (const voterName of voterNames) {
            const voterPlayerId = playerMap.get(voterName.trim());
            if (voterPlayerId) {
              await prisma.meetingVote.create({
                data: {
                  meetingId: meeting.id,
                  targetId: targetPlayerId,
                  voterId: voterPlayerId
                }
              });
            }
          }
        }
      }

      // Create skip votes
      for (const playerName of meetingData.skipVotes) {
        const playerId = playerMap.get(playerName.trim());
        if (playerId) {
          await prisma.meetingSkipVote.create({
            data: {
              meetingId: meeting.id,
              playerId
            }
          });
        }
      }

      // Create no votes
      for (const playerName of meetingData.noVotes) {
        const playerId = playerMap.get(playerName.trim());
        if (playerId) {
          await prisma.meetingNoVote.create({
            data: {
              meetingId: meeting.id,
              playerId
            }
          });
        }
      }

      // Create blackmailed players
      for (const playerName of meetingData.blackmailedPlayers) {
        const playerId = playerMap.get(playerName.trim());
        if (playerId) {
          await prisma.meetingBlackmailedPlayer.create({
            data: {
              meetingId: meeting.id,
              playerId
            }
          });
        }
      }

      // Create jailed players
      for (const playerName of meetingData.jailedPlayers) {
        const playerId = playerMap.get(playerName.trim());
        if (playerId) {
          await prisma.meetingJailedPlayer.create({
            data: {
              meetingId: meeting.id,
              playerId
            }
          });
        }
      }
    }

    // Automatically calculate ranking after game creation
    let rankingCalculated = false;
    let rankingError: string | undefined;

    try {
      console.log(`🎯 Auto-calculating ranking for game ${game.id}`);
      await calculateRankingForGame(prisma, game.id);
      rankingCalculated = true;
      console.log(`✅ Ranking calculated successfully for game ${game.gameIdentifier}`);
    } catch (rankingErr) {
      console.warn(`⚠️ Failed to calculate ranking for game ${game.gameIdentifier}:`, rankingErr);
      rankingError = rankingErr instanceof Error ? rankingErr.message : 'Unknown ranking error';
      // Don't throw the error - game creation should succeed even if ranking fails
    }

    return {
      gameId: game.id,
      gameIdentifier: game.gameIdentifier,
      playersCreated: players.length,
      eventsCreated: gameEvents.length,
      meetingsCreated: meetings.length,
      rankingCalculated,
      rankingError
    };

  } catch (error) {
    // If any step fails, the error will be thrown and handled by the caller
    // Since we can't use transactions, partial data might exist
    throw error;
  }
}