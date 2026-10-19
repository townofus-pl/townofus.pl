// Dev-only route: `GET /__dev/tick?now=<ISO 8601>` runs the cron logic as if the cron fired at
// `now`. It exists only when ENVIRONMENT is "dev". In every other environment the route returns
// `null`, and the request falls through to the normal interaction handling (405 for a GET).

import type { BotEnv } from './env';
import { jsonResponse } from './discord';
import { runScheduled } from './schedule';

export const DEV_TICK_PATH = '/__dev/tick';

export async function handleDevTick(request: Request, env: BotEnv): Promise<Response | null> {
    if (env.ENVIRONMENT !== 'dev') return null;

    const url = new URL(request.url);
    if (request.method !== 'GET' || url.pathname !== DEV_TICK_PATH) return null;

    // An unencoded `+02:00` in a query string decodes to a space. Put the plus back.
    const raw = url.searchParams.get('now')?.replace(' ', '+');
    const now = raw ? Date.parse(raw) : Date.now();
    if (Number.isNaN(now)) {
        return jsonResponse({ error: `Bad "now": ${raw}. Use ISO 8601, e.g. 2026-10-21T22:10:00+02:00` }, 400);
    }

    const run = await runScheduled(now, env);
    return jsonResponse({ now: new Date(now).toISOString(), ...run });
}
