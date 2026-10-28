import type { UIMeetingData } from '../_services/games/types';

/** Recover the final unvoted meeting from the roster and recorded deaths/exiles. */
export function getMeetingParticipants(meetings: UIMeetingData[], roster: string[]): Map<number, string[]> {
    const alive = new Set(roster);
    const result = new Map<number, string[]>();
    meetings.forEach((meeting, index) => {
        meeting.deathsSinceLastMeeting.forEach(death => alive.delete(death.split(' (')[0].trim()));
        const recorded = new Set([
            ...Object.keys(meeting.votes),
            ...Object.values(meeting.votes).flat(),
            ...meeting.skipVotes,
            ...meeting.noVotes,
            ...(meeting.deathsDuringMeeting ?? []),
        ]);
        // A recorded participant may have been revived since an earlier meeting.
        recorded.forEach(name => alive.add(name));
        const hasBallots = Object.values(meeting.votes).some(voters => voters.length > 0) || meeting.skipVotes.length > 0;
        result.set(meeting.meetingNumber, index === meetings.length - 1 && !hasBallots ? Array.from(alive) : Array.from(recorded));
        if (meeting.exiledPlayer) alive.delete(meeting.exiledPlayer);
        meeting.deathsDuringMeeting?.forEach(name => alive.delete(name));
    });
    return result;
}
