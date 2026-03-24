// All valid reason values for PlayerRanking entries.
// Use this type when creating PlayerRanking records to prevent typos.
// 'initial_value' is used by players/post.ts when creating initial player rankings.
// 'base_value' is reserved for manual corrections/migrations (not emitted by runtime code).
export type PlayerRankingReason =
  | 'base_value'
  | 'initial_value'
  | 'game_result'
  | 'absence_penalty'
  | 'absence_no_penalty'
  | 'penalty'
  | 'reward'
  | 'season_reset';
