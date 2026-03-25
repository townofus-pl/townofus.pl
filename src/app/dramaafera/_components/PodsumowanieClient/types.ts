import type { UIGameData } from '@/app/dramaafera/_services/games/types';

// Typy dla danych gracza
export interface WeeklyPlayerStats {
    nickname: string;
    gamesPlayed: number;
    wins: number;
    winRate: number;
    position: number;
    totalPoints: number;
}

// Typy dla ankiety Emperor
export interface EmperorPollVote {
    nickname: string;
    votes: number;
}

export interface EmperorPoll {
    date: string;
    question: string;
    totalVotes: number;
    votes: EmperorPollVote[];
}

// Typy dla sigm tygodnia
export interface SigmaPlayer {
    nickname: string;
    rankBefore: number;
    rankAfter: number;
    ratingBefore: number;
    ratingAfter: number;
    change: number;
    ratingChange: number;
}

export interface RankingHistoryPoint {
    dateString: string;
    rating: number;
    position: number;
}

export interface EmperorHistoryEntry {
    nickname: string;
    count: number;
    dates: string[];
    isLatest: boolean;
}

export interface PlayerRankingAfterSession {
    nickname: string;
    rating: number;
    position: number;
    ratingChange: number;
}

export interface PodsumowanieClientProps {
    date: string;
    weeklyStats: WeeklyPlayerStats[];
    emperorPoll: EmperorPoll | null;
    topSigmas: SigmaPlayer[];
    sigmaRankingHistory: Record<string, RankingHistoryPoint[]>;
    topCwele: SigmaPlayer[];
    cwelRankingHistory: Record<string, RankingHistoryPoint[]>;
    emperorHistory: EmperorHistoryEntry[];
    rankingAfterSession: PlayerRankingAfterSession[];
    topPlayerGames: UIGameData[];
    playerRankingChangesCache: Record<string, Record<string, number>>;
}
