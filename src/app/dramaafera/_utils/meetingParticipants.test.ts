import { getMeetingParticipants } from './meetingParticipants';
import type { UIMeetingData } from '../_services/games/types';

const meeting = (overrides: Partial<UIMeetingData>): UIMeetingData => ({
    meetingNumber: 1, deathsSinceLastMeeting: [], votes: {}, skipVotes: [], noVotes: [], wasTie: false, wasBlessed: false, ...overrides,
});

test('includes living players when the final meeting ends before voting', () => {
    const meetings = [meeting({ votes: { B: ['A'] }, exiledPlayer: 'B' }), meeting({ meetingNumber: 2, deathsSinceLastMeeting: ['C (zabity)'] })];
    expect(getMeetingParticipants(meetings, ['A', 'B', 'C', 'D']).get(2)).toEqual(['A', 'D']);
});

test('does not add the full roster to a completed voting meeting', () => {
    expect(getMeetingParticipants([meeting({ votes: { B: ['A'] } })], ['A', 'B', 'C']).get(1)).toEqual(['B', 'A']);
});

test('restores players recorded as participants after an earlier death', () => {
    const meetings = [meeting({ deathsSinceLastMeeting: ['B'] }), meeting({ meetingNumber: 2, noVotes: ['B'] })];
    expect(getMeetingParticipants(meetings, ['A', 'B']).get(2)).toEqual(['A', 'B']);
});
