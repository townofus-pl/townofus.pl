"use client";

import type { VotingStatistics } from '../../_services';

interface VotingStatsDisplayProps {
  votingStats: VotingStatistics;
}

export function VotingStatsDisplay({ votingStats }: VotingStatsDisplayProps) {
  console.log('[VOTING CLIENT] received props:', JSON.stringify({ totalMeetings: votingStats.totalMeetings, totalVotesCast: votingStats.totalVotesCast, totalVotesReceived: votingStats.totalVotesReceived }));
  if (votingStats.totalMeetings === 0) return null;

  return (
    <>
      {/* Główne metryki */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50 text-center">
          <div className="text-3xl font-bold text-blue-400 mb-1">
            {votingStats.totalVotesCast}
          </div>
          <div className="text-sm text-zinc-400 uppercase tracking-wide">
            Oddanych głosów
          </div>
        </div>

        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50 text-center">
          <div className="text-3xl font-bold text-purple-400 mb-1">
            {votingStats.totalVotesReceived}
          </div>
          <div className="text-sm text-zinc-400 uppercase tracking-wide">
            Otrzymanych głosów
          </div>
        </div>

        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50 text-center">
          <div className="text-3xl font-bold text-red-400 mb-1">
            {votingStats.timesVotedOut}
          </div>
          <div className="text-sm text-zinc-400 uppercase tracking-wide">
            Razy wygłosowany
          </div>
        </div>

        <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50 text-center">
          <div className="text-3xl font-bold text-yellow-400 mb-1">
            {votingStats.skipRate.toFixed(1)}%
          </div>
          <div className="text-sm text-zinc-400 uppercase tracking-wide">
            Skip Rate
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            {votingStats.skipVotes}/{votingStats.totalMeetings} spotkań
          </div>
        </div>
      </div>

      {/* Bandwagon Factor */}
      <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700/50 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-zinc-400 uppercase tracking-wide">
            🎯 Bandwagon Factor
          </div>
          <div className="text-2xl font-bold text-green-400">
            {votingStats.bandwagonFactor.toFixed(1)}%
          </div>
        </div>
        <div className="text-xs text-zinc-500">
          Jak często głosuje zgodnie z większością
        </div>
        <div className="mt-2 bg-zinc-900/50 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-300"
            style={{ width: `${Math.min(votingStats.bandwagonFactor, 100)}%` }}
          />
        </div>
      </div>

      {/* Ranking ofiar i prześladowców */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Najczęstsze ofiary głosowań */}
        {votingStats.votingTargets.length > 0 && (
          <div className="bg-zinc-800/30 rounded-lg p-4">
            <h4 className="text-lg font-bold mb-4 text-white">
              🎯 Najczęstsze Ofiary Głosowań
            </h4>
            <div className="space-y-2">
              {votingStats.votingTargets.slice(0, 5).map((target, index) => (
                <div 
                  key={target.playerName}
                  className="flex items-center justify-between bg-zinc-900/50 rounded p-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 font-mono text-sm w-6">
                      {index + 1}.
                    </span>
                    <span className="text-white font-semibold">
                      {target.playerName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 font-bold">
                      {target.voteCount}
                    </span>
                    <span className="text-zinc-500 text-sm">
                      ({target.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Kto głosuje na gracza */}
        {votingStats.votedByPlayers.length > 0 && (
          <div className="bg-zinc-800/30 rounded-lg p-4">
            <h4 className="text-lg font-bold mb-4 text-white">
              👥 Kto Głosuje Na Mnie
            </h4>
            <div className="space-y-2">
              {votingStats.votedByPlayers.slice(0, 5).map((voter, index) => (
                <div 
                  key={voter.playerName}
                  className="flex items-center justify-between bg-zinc-900/50 rounded p-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 font-mono text-sm w-6">
                      {index + 1}.
                    </span>
                    <span className="text-white font-semibold">
                      {voter.playerName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 font-bold">
                      {voter.voteCount}
                    </span>
                    <span className="text-zinc-500 text-sm">
                      ({voter.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default VotingStatsDisplay;
