// Entry points: `fetch` receives Discord interactions over HTTP, `scheduled` runs the cron.

import type { Interaction } from './discord';
import type { BotEnv } from './env';
import { handleDevTick } from './devTick';
import { handleInteraction } from './interactions';
import { runScheduled } from './schedule';
import { verifyDiscordRequest } from './verify';

export default {
    async fetch(request, env, ctx): Promise<Response> {
        const devTick = await handleDevTick(request, env);
        if (devTick) return devTick;

        if (request.method !== 'POST') {
            return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
        }

        const body = await verifyDiscordRequest(request, env.DISCORD_PUBLIC_KEY);
        if (body === null) {
            return new Response('Bad request signature', { status: 401 });
        }

        let interaction: Interaction;
        try {
            interaction = JSON.parse(body) as Interaction;
        } catch {
            return new Response('Bad request body', { status: 400 });
        }

        return handleInteraction(interaction, env, ctx);
    },

    async scheduled(controller, env, ctx): Promise<void> {
        ctx.waitUntil(runScheduled(controller.scheduledTime, env));
    },
} satisfies ExportedHandler<BotEnv>;
