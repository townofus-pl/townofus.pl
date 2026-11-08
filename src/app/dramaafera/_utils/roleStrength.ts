/** Index points, not percentages. A balanced role has strength 100. */
export const ROLE_STRENGTH_BASE = 100;
export const ROLE_STRENGTH_SCALE = 20;
export const ROLE_STRENGTH_PRIOR_GAMES = 3;
export const ROLE_STRENGTH_TARGET_DAP = 5;

export function calculateRoleStrength(totalDeviation: number, appearances: number): number | null {
    if (appearances <= 0) return null;
    // n / (n + k) * mean(deviation) = sum(deviation) / (n + k).
    return ROLE_STRENGTH_BASE + ROLE_STRENGTH_SCALE * totalDeviation / (appearances + ROLE_STRENGTH_PRIOR_GAMES);
}

export function getRoleAssessment(strength: number | null, appearances: number): { label: string; className: string } {
    if (appearances < 3 || strength === null || !Number.isFinite(strength)) {
        return { label: 'zbyt mała próba', className: 'text-gray-400' };
    }
    if (strength > 120) return { label: 'do nerfa', className: 'text-red-400' };
    if (strength < 80) return { label: 'do buffa', className: 'text-red-400' };
    if (strength < 90) return { label: 'słabsza', className: 'text-yellow-400' };
    if (strength > 110) return { label: 'mocna', className: 'text-yellow-400' };
    return { label: 'zbalansowana', className: 'text-green-400' };
}
