import { getDatabaseClient } from '../db';
import { withoutDeleted } from '@/app/api/schema/common';
import { CURRENT_SEASON } from '@/app/dramaafera/_constants/seasons';
import type { VotingStatistics } from './types';

/**
 * Pobierz statystyki głosowań gracza
 */
export async function getPlayerVotingStats(
  nick: string,
  seasonId?: number
): Promise<VotingStatistics> {
  const prisma = await getDatabaseClient();

  const emptyResult: VotingStatistics = {
    totalVotesCast: 0,
    totalVotesReceived: 0,
    timesVotedOut: 0,
    totalMeetings: 0,
    skipVotes: 0,
    skipRate: 0,
    bandwagonFactor: 0,
    votingTargets: [],
    votedByPlayers: []
  };

  if (!prisma) {
    return emptyResult;
  }

  try {
    const player = await prisma.player.findFirst({
      where: {
        name: nick,
        ...withoutDeleted
      }
    });

    if (!player) {
      return emptyResult;
    }

    const votesCast = await prisma.meetingVote.findMany({
      where: {
        voterId: player.id,
        meeting: {
          ...withoutDeleted,
          game: { ...withoutDeleted, season: seasonId ?? CURRENT_SEASON }
        }
      },
      include: {
        target: true,
        meeting: {
          include: {
            game: true
          }
        }
      }
    });

    const votesReceived = await prisma.meetingVote.findMany({
      where: {
        targetId: player.id,
        meeting: {
          ...withoutDeleted,
          game: { ...withoutDeleted, season: seasonId ?? CURRENT_SEASON }
        }
      },
      include: {
        voter: true,
        meeting: {
          include: {
            game: true
          }
        }
      }
    });

    const skipVotesData = await prisma.meetingSkipVote.findMany({
      where: {
        playerId: player.id,
        meeting: {
          ...withoutDeleted,
          game: { ...withoutDeleted, season: seasonId ?? CURRENT_SEASON }
        }
      },
      include: {
        meeting: {
          include: {
            game: true
          }
        }
      }
    });

    const meetingIdsSet = new Set<number>();
    votesCast.forEach(v => meetingIdsSet.add(v.meetingId));
    votesReceived.forEach(v => meetingIdsSet.add(v.meetingId));
    skipVotesData.forEach(s => meetingIdsSet.add(s.meetingId));

    const meetingIds = Array.from(meetingIdsSet);

    const BATCH_SIZE = 100;
    type MeetingWithVotes = Awaited<ReturnType<typeof prisma.meeting.findMany<{
      include: { meetingVotes: true };
    }>>>[number];
    const allMeetings: MeetingWithVotes[] = [];

    for (let i = 0; i < meetingIds.length; i += BATCH_SIZE) {
      const batchIds = meetingIds.slice(i, i + BATCH_SIZE);
      const batchMeetings = await prisma.meeting.findMany({
        where: {
          id: { in: batchIds },
          ...withoutDeleted,
          game: { season: seasonId ?? CURRENT_SEASON, ...withoutDeleted }
        },
        include: {
          meetingVotes: true
        }
      });
      allMeetings.push(...batchMeetings);
    }

    const meetingsParticipated = new Set<number>();
    votesCast.forEach(v => meetingsParticipated.add(v.meetingId));
    skipVotesData.forEach(s => meetingsParticipated.add(s.meetingId));

    const totalMeetings = meetingsParticipated.size;
    const skipVotes = skipVotesData.length;
    const skipRate = totalMeetings > 0 ? (skipVotes / totalMeetings) * 100 : 0;

    let timesVotedOut = 0;
    allMeetings.forEach(meeting => {
      if (meeting.wasTie) return;

      const voteCounts = new Map<number, number>();
      meeting.meetingVotes.forEach((vote: { targetId: number }) => {
        voteCounts.set(vote.targetId, (voteCounts.get(vote.targetId) || 0) + 1);
      });

      if (voteCounts.size === 0) return;

      const maxVotes = Math.max(...voteCounts.values());
      const playersWithMaxVotes = Array.from(voteCounts.entries())
        .filter(([, count]) => count === maxVotes)
        .map(([playerId]) => playerId);

      if (playersWithMaxVotes.length === 1 && playersWithMaxVotes[0] === player.id) {
        timesVotedOut++;
      }
    });

    let bandwagonVotes = 0;
    const meetingVoteCounts = new Map<number, Map<number, number>>();

    allMeetings.forEach(meeting => {
      const voteCounts = new Map<number, number>();
      meeting.meetingVotes.forEach((vote: { targetId: number }) => {
        voteCounts.set(vote.targetId, (voteCounts.get(vote.targetId) || 0) + 1);
      });
      meetingVoteCounts.set(meeting.id, voteCounts);
    });

    votesCast.forEach(vote => {
      const voteCounts = meetingVoteCounts.get(vote.meetingId);
      if (!voteCounts) return;

      const maxVotes = Math.max(...voteCounts.values());
      const voteCountForTarget = voteCounts.get(vote.targetId) || 0;

      if (voteCountForTarget === maxVotes && maxVotes > 0) {
        bandwagonVotes++;
      }
    });

    const bandwagonFactor = votesCast.length > 0
      ? (bandwagonVotes / votesCast.length) * 100
      : 0;

    const targetCounts = new Map<string, number>();
    votesCast.forEach(vote => {
      const name = vote.target.name;
      targetCounts.set(name, (targetCounts.get(name) || 0) + 1);
    });

    const votingTargets = Array.from(targetCounts.entries())
      .map(([playerName, voteCount]) => ({
        playerName,
        voteCount,
        percentage: (voteCount / votesCast.length) * 100
      }))
      .sort((a, b) => b.voteCount - a.voteCount);

    const voterCounts = new Map<string, number>();
    votesReceived.forEach(vote => {
      const name = vote.voter.name;
      voterCounts.set(name, (voterCounts.get(name) || 0) + 1);
    });

    const votedByPlayers = Array.from(voterCounts.entries())
      .map(([playerName, voteCount]) => ({
        playerName,
        voteCount,
        percentage: (voteCount / votesReceived.length) * 100
      }))
      .sort((a, b) => b.voteCount - a.voteCount);

    return {
      totalVotesCast: votesCast.length,
      totalVotesReceived: votesReceived.length,
      timesVotedOut,
      totalMeetings,
      skipVotes,
      skipRate: Math.round(skipRate * 10) / 10,
      bandwagonFactor: Math.round(bandwagonFactor * 10) / 10,
      votingTargets,
      votedByPlayers
    };

  } catch (error) {
    console.error('Error fetching player voting stats:', error);
    return emptyResult;
  }
}
