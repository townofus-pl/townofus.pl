import { describe, expect, it } from '@jest/globals';
import worker from '../src/index';
import type { BotEnv } from '../src/env';

const ctx = { waitUntil: () => {}, passThroughOnException: () => {} } as unknown as ExecutionContext;

async function tick(environment: string, query: string): Promise<Response> {
    const env = { ENVIRONMENT: environment, DISCORD_PUBLIC_KEY: '' } as BotEnv;
    const request = new Request(`http://localhost:8787/__dev/tick?${query}`);
    return worker.fetch(request as Parameters<typeof worker.fetch>[0], env, ctx);
}

describe('GET /__dev/tick', () => {
    it.each([
        ['2026-10-21T17:10:00%2B02:00', 'closePoll'],
        ['2026-10-21T18:10:00%2B02:00', 'closeSignups'],
        ['2026-10-21T22:10:00%2B02:00', 'createPoll'],
        ['2026-10-28T22:10:00%2B01:00', 'createPoll'],
        ['2026-10-21T22:10:00+02:00', 'createPoll'], // unencoded plus decodes to a space
        ['2026-10-22T17:10:00%2B02:00', null], // Thursday
    ])('in dev runs the step for now=%s', async (now, step) => {
        const response = await tick('dev', `now=${now}`);
        expect(response.status).toBe(200);
        expect(((await response.json()) as { step: string | null }).step).toBe(step);
    });

    it('answers 400 to a bad time in dev', async () => {
        expect((await tick('dev', 'now=yesterday')).status).toBe(400);
    });

    it.each(['staging', 'production', '', 'DEV'])('is ignored when ENVIRONMENT is %p', async (environment) => {
        const response = await tick(environment, 'now=2026-10-21T22:10:00%2B02:00');
        expect(response.status).toBe(405);
    });
});
