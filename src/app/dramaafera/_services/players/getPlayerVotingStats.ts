import { getDatabaseClient } from '../db';
import { chunkedInQuery } from '@/app/api/_database';
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
        target: withoutDeleted,
        meeting: {
          ...withoutDeleted,
          game: { ...withoutDeleted, season: seasonId ?? CURRENT_SEASON }
        }
      },
      include: {
        target: true,
      }
    });

    const votesReceived = await prisma.meetingVote.findMany({
      where: {
        targetId: player.id,
        voter: withoutDeleted,
        meeting: {
          ...withoutDeleted,
          game: { ...withoutDeleted, season: seasonId ?? CURRENT_SEASON }
        }
      },
      include: {
        voter: true,
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
    });

    // Fetch all meetings for this player in the season via relation filters.
    // Two-step fetch (then `meetingVotes` per meeting id, chunked) to stay under
    // Cloudflare D1's 98 bound-parameter cap on Prisma 7 — a single
    // `include: { meetingVotes }` would emit `WHERE meetingId IN (?,…?N)`
    // for the relation fetch and trip P2029 on heavy players.
    const allMeetings = await prisma.meeting.findMany({
      where: {
        ...withoutDeleted,
        game: { season: seasonId ?? CURRENT_SEASON, ...withoutDeleted },
        OR: [
          { meetingVotes: { some: { voterId: player.id } } },
          { skipVotes:    { some: { playerId: player.id } } },
        ]
      },
      select: { id: true, wasTie: true },
    });

    const meetingIds = allMeetings.map((m) => m.id);
    const allMeetingVotes = await chunkedInQuery(meetingIds, (chunk) =>
      prisma.meetingVote.findMany({
        where: { meetingId: { in: chunk } },
        select: { meetingId: true, targetId: true },
      }),
    );

    const votesByMeetingId = new Map<number, { targetId: number }[]>();
    allMeetingVotes.forEach((v) => {
      const list = votesByMeetingId.get(v.meetingId) ?? [];
      list.push({ targetId: v.targetId });
      votesByMeetingId.set(v.meetingId, list);
    });

    const totalMeetings = allMeetings.length;
    const skipVotes = skipVotesData.length;
    const skipRate = totalMeetings > 0 ? (skipVotes / totalMeetings) * 100 : 0;

    let timesVotedOut = 0;
    allMeetings.forEach(meeting => {
      if (meeting.wasTie) return;

      const meetingVotes = votesByMeetingId.get(meeting.id) ?? [];
      const voteCounts = new Map<number, number>();
      meetingVotes.forEach((vote) => {
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
      const meetingVotes = votesByMeetingId.get(meeting.id) ?? [];
      const voteCounts = new Map<number, number>();
      meetingVotes.forEach((vote) => {
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

    const result = {
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

    return result;

  } catch (error) {
    console.error('Error fetching player voting stats:', error);
    return emptyResult;
  }
}
