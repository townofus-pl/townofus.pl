import { NextRequest } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { getPrismaClient } from '../../_database';
import { IdParamSchema } from '../../schema/base';
import { createSuccessResponse, createErrorResponse } from '../../_utils';
import { formatZodError, withoutDeleted } from '../../schema/common';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, authContext: { user: { username: string } }, context: RouteContext) {
  try {
    // Get Cloudflare context for D1 database
    const { env } = await getCloudflareContext();
    const prisma = getPrismaClient(env.DB);

    // Parse and validate route parameters
    const { id } = await context.params;
    const parseResult = IdParamSchema.safeParse({ id });
    
    if (!parseResult.success) {
      return createErrorResponse('Invalid game ID: ' + JSON.stringify(formatZodError(parseResult.error)), 400);
    }

    const gameId = parseInt(id, 10);

    // Fetch game with comprehensive data
    const game = await prisma.game.findFirst({
      where: {
        id: gameId,
        ...withoutDeleted
      },
      include: {
        gamePlayerStatistics: {
          include: {
            player: {
              select: {
                id: true,
                name: true
              }
            },
            roleHistory: {
              orderBy: {
                order: 'asc'
              }
            },
            modifiers: true
          }
        },
        gameEvents: {
          where: {
            ...withoutDeleted
          },
          orderBy: {
            timestamp: 'asc'
          }
        },
        meetings: {
          where: {
            ...withoutDeleted
          },
          orderBy: {
            meetingNumber: 'asc'
          },
          include: {
            meetingVotes: {
              include: {
                target: {
                  select: { id: true, name: true }
                },
                voter: {
                  select: { id: true, name: true }
                }
              }
            },
            skipVotes: {
              include: {
                player: {
                  select: { id: true, name: true }
                }
              }
            },
            noVotes: {
              include: {
                player: {
                  select: { id: true, name: true }
                }
              }
            },
            blackmailedPlayers: {
              include: {
                player: {
                  select: { id: true, name: true }
                }
              }
            },
            jailedPlayers: {
              include: {
                player: {
                  select: { id: true, name: true }
                }
              }
            }
          }
        }
      }
    });

    if (!game) {
      return createErrorResponse('Game not found', 404);
    }

    // Calculate game duration
    let duration = 'Unknown';
    if (game.startTime && game.endTime) {
      const durationMs = game.endTime.getTime() - game.startTime.getTime();
      const minutes = Math.floor(durationMs / 60000);
      const seconds = Math.floor((durationMs % 60000) / 1000);
      duration = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    // Extract and format date
    let gameDate = 'Unknown';
    if (game.gameIdentifier) {
      const datePart = game.gameIdentifier.split('_')[0];
      if (datePart && datePart.length === 8) {
        const year = datePart.substring(0, 4);
        const month = datePart.substring(4, 6);
        const day = datePart.substring(6, 8);
        gameDate = `${day}.${month}.${year}`;
      }
    } else if (game.startTime) {
      gameDate = game.startTime.toLocaleDateString('pl-PL');
    }

    // Transform player statistics
    const players = game.gamePlayerStatistics.map(stat => ({
      id: stat.id,
      playerId: stat.playerId,
      playerName: stat.player.name,
      
      // Game result
      win: stat.win,
      disconnected: stat.disconnected,
      
      // Points and performance
      initialRolePoints: stat.initialRolePoints,
      totalPoints: stat.totalPoints,
      
      // Combat statistics
      correctKills: stat.correctKills,
      incorrectKills: stat.incorrectKills,
      correctProsecutes: stat.correctProsecutes,
      incorrectProsecutes: stat.incorrectProsecutes,
      correctGuesses: stat.correctGuesses,
      incorrectGuesses: stat.incorrectGuesses,
      correctDeputyShoots: stat.correctDeputyShoots,
      incorrectDeputyShoots: stat.incorrectDeputyShoots,
      correctJailorExecutes: stat.correctJailorExecutes,
      incorrectJailorExecutes: stat.incorrectJailorExecutes,
      
      // Support statistics
      correctMedicShields: stat.correctMedicShields,
      incorrectMedicShields: stat.incorrectMedicShields,
      correctWardenFortifies: stat.correctWardenFortifies,
      incorrectWardenFortifies: stat.incorrectWardenFortifies,
      correctAltruistRevives: stat.correctAltruistRevives,
      incorrectAltruistRevives: stat.incorrectAltruistRevives,
      correctSwaps: stat.correctSwaps,
      incorrectSwaps: stat.incorrectSwaps,
      
      // Task and survival statistics
      janitorCleans: stat.janitorCleans,
      completedTasks: stat.completedTasks,
      survivedRounds: stat.survivedRounds,
      
      // Role and modifier information
      roleHistory: stat.roleHistory?.map(role => role.roleName) || [],
      modifiers: stat.modifiers?.map(mod => mod.modifierName) || []
    }));

    // Transform game events
    const events = game.gameEvents.map(event => ({
      id: event.id,
      timestamp: event.timestamp,
      description: event.description,
      eventType: event.eventType,
      playerId: event.playerId,
      targetId: event.targetId
    }));

    // Transform meeting data
    const meetings = game.meetings.map(meeting => ({
      id: meeting.id,
      meetingNumber: meeting.meetingNumber,
      deathsSinceLastMeeting: meeting.deathsSinceLastMeeting,
      wasTie: meeting.wasTie,
      wasBlessed: meeting.wasBlessed,
      
      // Voting data
      votes: meeting.meetingVotes.map(vote => ({
        targetId: vote.targetId,
        targetName: vote.target.name,
        voterId: vote.voterId,
        voterName: vote.voter.name
      })),
      
      skipVotes: meeting.skipVotes.map(skip => ({
        playerId: skip.playerId,
        playerName: skip.player.name
      })),
      
      noVotes: meeting.noVotes.map(noVote => ({
        playerId: noVote.playerId,
        playerName: noVote.player.name
      })),
      
      blackmailedPlayers: meeting.blackmailedPlayers.map(blackmailed => ({
        playerId: blackmailed.playerId,
        playerName: blackmailed.player.name
      })),
      
      jailedPlayers: meeting.jailedPlayers.map(jailed => ({
        playerId: jailed.playerId,
        playerName: jailed.player.name
      }))
    }));

    // Calculate winner information
    const winners = players.filter(player => player.win);
    const winnerNames = winners.map(w => w.playerName);

    // Build comprehensive game response
    const gameDetails = {
      id: game.id,
      gameIdentifier: game.gameIdentifier,
      date: gameDate,
      startTime: game.startTime,
      endTime: game.endTime,
      duration,
      map: game.map,
      maxTasks: game.maxTasks,
      playerCount: players.length,
      
      // Winner information
      winnerTeam: game.winnerTeam || 'Unknown',
      winCondition: game.winCondition || 'Unknown',
      winnerNames,
      winnerCount: winners.length,
      
      // Detailed data
      players,
      events,
      meetings,
      
      // Metadata
      createdAt: game.createdAt,
      updatedAt: game.updatedAt
    };

    return createSuccessResponse(gameDetails, 200);

  } catch (error) {
    console.error('Error fetching game details:', error);
    
    if (error instanceof Error) {
      return createErrorResponse('Failed to fetch game details: ' + error.message, 500);
    }

    return createErrorResponse('Internal server error', 500);
  }
}