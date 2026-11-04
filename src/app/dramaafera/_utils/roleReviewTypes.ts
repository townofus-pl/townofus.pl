import type { RoleRankingSummary } from '@/app/dramaafera/_services/rankings/types';
import type { RoleReviewBoundary, RoleReviewDecision } from '@/app/dramaafera/_utils/roleReview';
export interface RoleReviewSession {
    key: string; firstGameId: number; lastGameId: number;
}
export interface RoleReviewGame extends RoleReviewBoundary { identifier: string; session: string }
export interface RoleReviewHistory {
    id: number; decision: RoleReviewDecision; note: string; author: string;
    createdAt: string; from: RoleReviewBoundary; through: RoleReviewBoundary;
    stats: RoleRankingSummary | null; assessment: { label: string; className: string }; formulaVersion: string;
}
export interface RoleReviewRow {
    roleName: string; displayName: string; color: string;
    revision: number | null; after: RoleReviewBoundary | null;
    stats: RoleRankingSummary | null; sampleToken: string;
    history: RoleReviewHistory[];
}
export interface RoleReviewOverview {
    rows: RoleReviewRow[]; games: RoleReviewGame[]; sessions: RoleReviewSession[];
    through: RoleReviewGame | null;
}
