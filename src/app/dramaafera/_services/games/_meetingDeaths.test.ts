import { getDeathsDuringMeetings } from './_meetingDeaths';

const meetings = [
    { meetingNumber: 1, deathsSinceLastMeeting: [] },
    { meetingNumber: 2, deathsSinceLastMeeting: ['A (zastrzelony)'] },
];

test('places a guess victim in the meeting preceding the death summary', () => {
    expect(getDeathsDuringMeetings(meetings, [{ type: 'kill', target: { name: 'A' }, detail: '{"isGuess":true}' }]).get(1)).toEqual(['A']);
});

test('includes final meeting executions even without a following summary', () => {
    expect(getDeathsDuringMeetings(meetings, [{ type: 'kill', target: { name: 'B' }, detail: '{"causeOfDeath":"Jailor"}' }]).get(2)).toEqual(['B']);
});

test('ignores ordinary kills and malformed details', () => {
    expect(getDeathsDuringMeetings(meetings, [
        { type: 'kill', target: { name: 'A' }, detail: null },
        { type: 'kill', target: { name: 'A' }, detail: 'invalid' },
    ]).size).toBe(0);
});
