import { getDeathsDuringMeetings } from './_meetingDeaths';
import { getMeetingParticipants } from '@/app/dramaafera/_utils/meetingParticipants';
import type { TimelineAction } from './_buildGameTimeline';
import type { UIMeetingData } from './types';

const meetings = [
    { meetingNumber: 1, deathsSinceLastMeeting: [] },
    { meetingNumber: 2, deathsSinceLastMeeting: ['A (zastrzelony)'] },
];

function action(overrides: Partial<TimelineAction> = {}): TimelineAction {
    return {
        type: 'kill', target: { name: 'A' }, performer: { name: 'B' },
        performerRole: 'Assassin', targetRole: null, timestampMs: 1000,
        isCorrect: true, detail: '{"isGuess":true}', ...overrides,
    };
}

test('places a guess victim in the meeting preceding the death summary', () => {
    expect(getDeathsDuringMeetings(meetings, [action()]).get(1)).toEqual(['A']);
});

test('includes final meeting executions even without a following summary', () => {
    expect(getDeathsDuringMeetings(meetings, [action({ target: { name: 'B' }, detail: '{"causeOfDeath":"Jailor"}' })]).get(2)).toEqual(['B']);
});

test.each(['guessedRole', 'guessedModifier'])('a misguess with %s kills the guesser and leaves the target alive', (field) => {
    const deaths = getDeathsDuringMeetings(meetings, [action({
        performer: { name: 'A' }, target: { name: 'B' }, isCorrect: false,
        detail: JSON.stringify({ isGuess: true, [field]: 'Some identity' }),
    })]);
    expect(Array.from(deaths)).toEqual([[1, ['A']]]);
    const uiMeetings: UIMeetingData[] = meetings.map(meeting => ({
        ...meeting, votes: {}, skipVotes: [], noVotes: [], wasTie: false, wasBlessed: false,
        deathsDuringMeeting: deaths.get(meeting.meetingNumber),
    }));
    expect(getMeetingParticipants(uiMeetings, ['A', 'B']).get(2)).toEqual(['B']);
});

test('legacy misguesses without guessed identity retain the recorded target victim', () => {
    expect(getDeathsDuringMeetings(meetings, [action({
        performer: { name: 'A' }, target: { name: 'A' }, isCorrect: false,
    })]).get(1)).toEqual(['A']);
});

test('successful guesses with guessed identity still kill the target', () => {
    expect(getDeathsDuringMeetings(meetings, [action({
        detail: '{"isGuess":true,"guessedRole":"Sheriff"}',
    })]).get(1)).toEqual(['A']);
});

test('uses a recorded misguess death when the guess verdict is unknown, without duplicates', () => {
    expect(Array.from(getDeathsDuringMeetings(meetings, [
        action({ performer: { name: 'A' }, target: { name: 'B' }, isCorrect: null }),
        action({ type: 'death', performer: { name: 'A' }, target: null, detail: '{"causeOfDeath":"Misguess"}' }),
    ]))).toEqual([[1, ['A']]]);
});

test('does not match a death from another timestamp to a successful guess', () => {
    expect(getDeathsDuringMeetings(meetings, [
        action({ performer: { name: 'B' }, target: { name: 'A' } }),
        action({ type: 'death', performer: { name: 'B' }, target: null, timestampMs: 2000, detail: '{"causeOfDeath":"Misguess"}' }),
    ]).get(1)).toEqual(['A']);
});

test.each(['Deputy', 'Jailor', 'Prosecutor'])('recognizes %s deaths by cause', (causeOfDeath) => {
    expect(getDeathsDuringMeetings(meetings, [action({ detail: JSON.stringify({ causeOfDeath }) })]).get(1)).toEqual(['A']);
});

test.each(['Deputy', 'Jailor', 'Prosecutor'])('recognizes %s kills even without detail', (performerRole) => {
    expect(getDeathsDuringMeetings(meetings, [action({ performerRole, detail: null })]).get(1)).toEqual(['A']);
});

test('death events identify the victim by performer, not target', () => {
    expect(getDeathsDuringMeetings(meetings, [action({
        type: 'death', performer: { name: 'A' }, target: { name: 'B' }, detail: '{"causeOfDeath":"Deputy"}',
    })]).get(1)).toEqual(['A']);
});

test('ignores ordinary kills, ordinary deaths of meeting roles and malformed details', () => {
    expect(getDeathsDuringMeetings(meetings, [
        action({ detail: null }), action({ detail: 'invalid' }), action({ detail: '[]' }),
        action({ type: 'death', performerRole: 'Prosecutor', detail: '{"causeOfDeath":"Murdered"}' }),
    ]).size).toBe(0);
});

test('handles missing targets, empty meetings and deaths before the first meeting', () => {
    expect(getDeathsDuringMeetings([], [action()]).size).toBe(0);
    expect(getDeathsDuringMeetings(meetings, [action({ target: null })]).size).toBe(0);
    expect(getDeathsDuringMeetings([{ meetingNumber: 1, deathsSinceLastMeeting: ['A (Guess)'] }], [action()]).size).toBe(0);
});


test('uses the first death summary when a revived victim appears again', () => {
    const repeated = [
        { meetingNumber: 1, deathsSinceLastMeeting: [] },
        { meetingNumber: 2, deathsSinceLastMeeting: [' A (Guess)'] },
        { meetingNumber: 3, deathsSinceLastMeeting: ['A (Guess)'] },
    ];
    expect(Array.from(getDeathsDuringMeetings(repeated, [action()]))).toEqual([[1, ['A']]]);
});

test('ignores unrelated actions without reading their details', () => {
    const unrelated = action({ type: 'task_completed' });
    Object.defineProperty(unrelated, 'detail', { get() { throw new Error('Unrelated detail read'); } });
    expect(Array.from(getDeathsDuringMeetings(meetings, [unrelated, action()]))).toEqual([[1, ['A']]]);
});


test('a Doomsayer miss without a death does not remove its living target', () => {
    const sessions = [
        { meetingNumber: 1, deathsSinceLastMeeting: [] },
        { meetingNumber: 2, deathsSinceLastMeeting: [] },
        { meetingNumber: 3, deathsSinceLastMeeting: [] },
    ];
    const deaths = getDeathsDuringMeetings(sessions, [action({ performerRole: 'Doomsayer', isCorrect: false })]);
    expect(Array.from(deaths)).toEqual([]);
    const uiMeetings: UIMeetingData[] = sessions.map(meeting => ({
        ...meeting, votes: {}, skipVotes: [], noVotes: [], wasTie: false, wasBlessed: false,
        deathsDuringMeeting: deaths.get(meeting.meetingNumber),
    }));
    expect(getMeetingParticipants(uiMeetings, ['A', 'B']).get(3)).toEqual(['A', 'B']);
});

test.each(['Vigilante', 'Assassin'])('a final meeting %s hit needs no separate death action or summary', (performerRole) => {
    expect(Array.from(getDeathsDuringMeetings(meetings, [action({
        performerRole, target: { name: 'Ph4' },
        detail: '{"isGuess":true,"guessedRole":"Sheriff"}',
    })]))).toEqual([[2, ['Ph4']]]);
});

test.each(['guessedRole', 'guessedModifier'])('a final meeting misguess with %s kills the guesser without a separate death action', (field) => {
    expect(Array.from(getDeathsDuringMeetings(meetings, [action({
        performerRole: 'Vigilante', performer: { name: 'B' }, target: { name: 'Ph4' }, isCorrect: false,
        detail: JSON.stringify({ isGuess: true, [field]: 'Some identity' }),
    })]))).toEqual([[2, ['B']]]);
});

test('a final meeting guess is retained when a matching death confirms it', () => {
    expect(getDeathsDuringMeetings(meetings, [
        action({ target: { name: 'C' } }),
        action({ type: 'death', performer: { name: 'C' }, target: null, detail: '{"causeOfDeath":"Guess"}' }),
    ]).get(2)).toEqual(['C']);
});


test('a later ordinary death does not turn a Doomsayer miss into a meeting death', () => {
    expect(Array.from(getDeathsDuringMeetings(meetings, [
        action({ performerRole: 'Doomsayer', isCorrect: false }),
        action({ type: 'death', performer: { name: 'A' }, target: null, timestampMs: 2000, detail: '{"causeOfDeath":"Murdered"}' }),
    ]))).toEqual([]);
});
