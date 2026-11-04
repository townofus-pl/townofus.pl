export interface RoleReviewBoundary { time: string; gameId: number }
export interface RoleReviewWindow { after: RoleReviewBoundary; through?: RoleReviewBoundary }
export const ROLE_REVIEW_THRESHOLD = 10;
export const ROLE_REVIEW_FORMULA_VERSION = 'role-strength-k3-v1';
export const ROLE_REVIEW_DECISIONS = ['nerf', 'buff', 'unchanged', 'settings_changed'] as const;
export type RoleReviewDecision = typeof ROLE_REVIEW_DECISIONS[number];
export const ROLE_REVIEW_DECISION_LABELS: Record<RoleReviewDecision, string> = {
    nerf: 'Nerf', buff: 'Buff', unchanged: 'Bez zmian', settings_changed: 'Zmiana ustawień — nowa próba',
};
export function toReviewTime(value: string | number | Date): string {
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'number') return new Date(value).toISOString();
    const normalized = value.replace(' ', 'T');
    return new Date(/(?:Z|[+-]\d{2}:?\d{2})$/.test(normalized) ? normalized : normalized + 'Z').toISOString();
}
export function compareReviewBoundary(a: RoleReviewBoundary, b: RoleReviewBoundary): number {
    return a.time.localeCompare(b.time) || a.gameId - b.gameId;
}
export function isInRoleReviewWindow(boundary: RoleReviewBoundary, window: RoleReviewWindow): boolean {
    return compareReviewBoundary(boundary, window.after) > 0 &&
        (!window.through || compareReviewBoundary(boundary, window.through) <= 0);
}
