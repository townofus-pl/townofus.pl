import type { TimelineAction } from './_buildGameTimeline';

type Meeting = { meetingNumber: number; deathsSinceLastMeeting: string[] };
type Action = Pick<TimelineAction, 'type' | 'detail' | 'target' | 'performer' | 'performerRole' | 'isCorrect' | 'timestampMs'>;

const MEETING_CAUSES = new Set(['Jailor', 'Prosecutor', 'Deputy', 'Guess', 'Misguess']);
const MEETING_KILLERS = new Set(['Jailor', 'Prosecutor', 'Deputy']);

function parseDetail(detail: string | null): Record<string, unknown> {
    if (!detail) return {};
    try {
        const parsed: unknown = JSON.parse(detail);
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
            ? parsed as Record<string, unknown> : {};
    } catch {
        return {};
    }
}

export function getDeathsDuringMeetings(meetings: Meeting[], actions: Action[]): Map<number, string[]> {
    const result = new Map<number, string[]>();
    if (meetings.length === 0) return result;
    // Task/vote/etc. details are irrelevant here. Parse only death-related records.
    const records = actions
        .filter(action => action.type === 'kill' || action.type === 'death')
        .map(action => ({ action, detail: parseDetail(action.detail) }));
    // Preserve findIndex semantics: the first summary mentioning a victim wins,
    // even if the player was revived and appears in a later summary as well.
    const firstSummaryByVictim = new Map<string, number>();
    meetings.forEach((meeting, index) => {
        meeting.deathsSinceLastMeeting.forEach(death => {
            const name = death.split(' (')[0].trim();
            if (!firstSummaryByVictim.has(name)) firstSummaryByVictim.set(name, index);
        });
    });
    // A death action's performer is the victim, whereas a kill action's performer
    // is the killer. Use a matching recorded death when a guess verdict is unknown.
    const recordedDeaths = new Map<number, Set<string>>();
    for (const { action, detail } of records) {
        if (action.type !== 'death' || !MEETING_CAUSES.has(String(detail.causeOfDeath))) continue;
        const names = recordedDeaths.get(action.timestampMs) ?? new Set<string>();
        names.add(action.performer.name);
        recordedDeaths.set(action.timestampMs, names);
    }

    for (const { action, detail } of records) {
        const isGuess = detail.isGuess === true;
        const isMeetingDeath = isGuess || MEETING_CAUSES.has(String(detail.causeOfDeath)) ||
            (action.type === 'kill' && MEETING_KILLERS.has(action.performerRole));
        if (!isMeetingDeath) continue;
        // A Doomsayer miss never kills. A later, unrelated death of the target
        // in a summary must not turn this attempt into a meeting kill either.
        if (action.type === 'kill' && isGuess && action.performerRole === 'Doomsayer' && action.isCorrect === false) continue;

        let name = action.type === 'death' ? action.performer.name : action.target?.name;
        if (action.type === 'kill') {
            const hasGuessedIdentity = typeof detail.guessedRole === 'string' || typeof detail.guessedModifier === 'string';
            // Since mod 1.1.0 a misguess with guessedRole/guessedModifier targets
            // the living guessed player. Older payloads already target the victim.
            if (detail.causeOfDeath === 'Misguess' || (isGuess && hasGuessedIdentity && action.isCorrect === false)) {
                name = action.performer.name;
            } else if (isGuess) {
                const deaths = recordedDeaths.get(action.timestampMs);
                if (deaths?.has(action.performer.name) && (!name || !deaths.has(name))) {
                    name = action.performer.name;
                }
            }
        }
        if (!name) continue;
        // Meeting deaths appear in the following meeting's death summary. The final
        // meeting has no following summary, so its guess/execution victims need actions.
        const nextIndex = firstSummaryByVictim.get(name) ?? -1;
        const meeting = nextIndex > 0 ? meetings[nextIndex - 1] : nextIndex === -1 ? meetings[meetings.length - 1] : undefined;
        if (!meeting) continue;
        const deaths = result.get(meeting.meetingNumber) ?? [];
        if (!deaths.includes(name)) deaths.push(name);
        result.set(meeting.meetingNumber, deaths);
    }
    return result;
}
