const warsaw = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
});

/** The first Wednesday at 17:00 Warsaw time strictly after creation. */
export function pollDeadline(createdAt: number): number {
    const parts = Object.fromEntries(warsaw.formatToParts(createdAt).map(p => [p.type, p.value]));
    const day = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day));
    for (let offset = 0; offset <= 7; offset++) {
        const date = new Date(day + offset * 86400000);
        if (date.getUTCDay() !== 3) continue;
        // Warsaw is UTC+1 or UTC+2. Resolve the offset on the target day, not today.
        const probe = date.getTime() + 12 * 3600000;
        const localHour = Number(warsaw.formatToParts(probe).find(p => p.type === 'hour')!.value);
        const deadline = date.getTime() + (17 - (localHour - 12)) * 3600000;
        if (deadline > createdAt) return deadline;
    }
    throw new Error('Nie udało się ustalić terminu ankiety.');
}

export interface PollCandidate {
    playerId: number;
    nickname: string;
    totalPoints: number;
}

export function selectCandidates(players: PollCandidate[]): PollCandidate[] {
    const sorted = [...players].sort((a, b) => b.totalPoints - a.totalPoints || a.playerId - b.playerId);
    const threshold = sorted[9]?.totalPoints;
    return threshold === undefined ? sorted : sorted.filter(p => p.totalPoints >= threshold);
}

export function parsePollContext(date: string | null, season: string | null) {
    if (!date || !/^\d{8}$/.test(date) || !season || !/^[1-9]\d*$/.test(season))
        throw new Error('Nieprawidłowy dzień lub sezon.');
    const iso = `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
    const parsed = new Date(`${iso}T00:00:00Z`);
    if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== iso)
        throw new Error('Nieprawidłowy dzień.');
    const seasonId = Number(season);
    if (!Number.isSafeInteger(seasonId)) throw new Error('Nieprawidłowy sezon.');
    return { date, season: seasonId };
}
