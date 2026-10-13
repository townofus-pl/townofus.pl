type Meeting = { meetingNumber: number; deathsSinceLastMeeting: string[] };
type Action = { type: string; detail: string | null; target: { name: string } | null };

export function getDeathsDuringMeetings(meetings: Meeting[], actions: Action[]): Map<number, string[]> {
    const result = new Map<number, string[]>();
    for (const action of actions) {
        if (action.type !== 'kill' || !action.target || !action.detail) continue;
        let detail: unknown;
        try { detail = JSON.parse(action.detail); } catch { continue; }
        if (!detail || typeof detail !== 'object') continue;
        const isMeetingDeath = ('isGuess' in detail && detail.isGuess === true) ||
            ('causeOfDeath' in detail && ['Jailor', 'Prosecutor', 'Guess', 'Misguess'].includes(String(detail.causeOfDeath)));
        if (!isMeetingDeath) continue;
        const name = action.target.name;
        // Meeting deaths appear in the following meeting's death summary. The final
        // meeting has no following summary, so its guess/execution victims need actions.
        const nextIndex = meetings.findIndex(meeting => meeting.deathsSinceLastMeeting.some(death => death.split(' (')[0].trim() === name));
        const meeting = nextIndex > 0 ? meetings[nextIndex - 1] : nextIndex === -1 ? meetings[meetings.length - 1] : undefined;
        if (!meeting) continue;
        const deaths = result.get(meeting.meetingNumber) ?? [];
        if (!deaths.includes(name)) deaths.push(name);
        result.set(meeting.meetingNumber, deaths);
    }
    return result;
}
