import { getSeasonForDate } from '../_constants/seasons';

const warsaw = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Warsaw', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', hourCycle: 'h23',
});

/** Wednesday remains the active session until 22:00 in Warsaw, then the next week opens. */
export function upcomingSession(now = Date.now()) {
    const parts = Object.fromEntries(warsaw.formatToParts(now).map(p => [p.type, p.value]));
    const today = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day));
    for (let offset = 0; offset <= 7; offset++) {
        const day = new Date(today + offset * 86400000);
        if (day.getUTCDay() !== 3) continue;
        const probe = day.getTime() + 12 * 3600000;
        const localHour = Number(warsaw.formatToParts(probe).find(p => p.type === 'hour')!.value);
        const closesAt = day.getTime() + (22 - (localHour - 12)) * 3600000;
        if (now >= closesAt) continue;
        return {
            date: day.toISOString().slice(0, 10),
            season: getSeasonForDate(day),
            closesAt,
            displayDate: new Intl.DateTimeFormat('pl-PL', {
                timeZone: 'Europe/Warsaw', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
            }).format(day),
        };
    }
    throw new Error('Nie udało się ustalić najbliższej środy.');
}
