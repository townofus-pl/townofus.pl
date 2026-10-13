import type { PollCandidate } from './rules';
export interface PollView {
    id: number;
    date: string;
    season: number;
    closesAt: number;
    closed: boolean;
    totalVotes: number;
    candidates: (PollCandidate & { id: number; votes: number })[];
    selectedCandidateId: number | null;
    playerId: number | null;
}
