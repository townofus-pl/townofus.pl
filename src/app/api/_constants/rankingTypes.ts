// All valid reason values for PlayerRanking entries.
// Use PlayerRankingReason.X constants when creating PlayerRanking records to prevent typos.
// 'initial_value' is used by players/post.ts when creating initial player rankings.
// 'base_value' is reserved for manual corrections/migrations (not emitted by runtime code).
export const PlayerRankingReason = {
  BaseValue: 'base_value',
  InitialValue: 'initial_value',
  GameResult: 'game_result',
  AbsencePenalty: 'absence_penalty',
  AbsenceNoPenalty: 'absence_no_penalty',
  Penalty: 'penalty',
  Reward: 'reward',
  SeasonReset: 'season_reset',
} as const;

export type PlayerRankingReason = typeof PlayerRankingReason[keyof typeof PlayerRankingReason];
