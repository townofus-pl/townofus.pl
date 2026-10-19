// `/ankieta`: a host creates the poll and the signup message for the newest day with games.
//
// Discord waits 3 s for the first reply. The D1 work and two Discord calls can take longer, so
// the handler answers "deferred" (type 5) at once and edits that reply from `ctx.waitUntil`.

import { ephemeralReply, jsonResponse, MessageFlags, type Interaction } from '../discord';
import type { BotEnv } from '../env';
import type { InteractionHandler } from '../interactions';
import { latestGameDate, loadGameDay } from './candidates';
import { ensurePoll, type PollOutcome } from './createPoll';
import { createDiscordRest, type DiscordRest } from './discordApi';
import { formatDayMonth } from '../signup/message';

const DEFERRED_CHANNEL_MESSAGE = 5;

export const NOT_HOST_REPLY = 'Tej komendy może użyć tylko host.';

export function isHost(interaction: Interaction, env: BotEnv): boolean {
    const roleId = env.DISCORD_HOST_ROLE_ID;
    return roleId !== '' && (interaction.member?.roles ?? []).includes(roleId);
}

export function outcomeReply(outcome: PollOutcome | null): string {
    if (!outcome) return 'Brak gier w tym dniu.';
    const day = formatDayMonth(outcome.date);
    switch (outcome.kind) {
        case 'created':
            return outcome.signupSent
                ? `Ankieta i zapisy za ${day} utworzone.`
                : `Ankieta za ${day} utworzona. Nie udało się wysłać wiadomości z zapisami.`;
        case 'exists':
            return outcome.signupSent
                ? 'Ankieta już istnieje. Wysłano brakującą wiadomość z zapisami.'
                : 'Ankieta już istnieje.';
        case 'pending':
            return 'Ankieta już istnieje i jest właśnie wysyłana. Spróbuj ponownie za 5 minut.';
        case 'blocked':
            return 'Inna ankieta jest jeszcze otwarta.';
        case 'noGames':
            return 'Brak gier w tym dniu.';
        case 'sendFailed':
            return 'Nie udało się wysłać ankiety. Spróbuj ponownie za 5 minut.';
    }
}

export async function runAnkieta(db: D1Database, discord: DiscordRest, env: BotEnv, now: number): Promise<string> {
    const date = await latestGameDate(db, now);
    if (!date) return outcomeReply(null);
    return outcomeReply(await ensurePoll({ db, discord, env, now }, await loadGameDay(db, date)));
}

export function createAnkietaHandler(makeDiscord: (env: BotEnv) => DiscordRest): InteractionHandler {
    return async (interaction, env, ctx) => {
        if (!isHost(interaction, env)) return ephemeralReply(NOT_HOST_REPLY);

        const discord = makeDiscord(env);
        ctx.waitUntil(
            (async () => {
                let reply: string;
                try {
                    reply = await runAnkieta(env.DB, discord, env, Date.now());
                } catch (error) {
                    console.error(JSON.stringify({ event: 'ankietaFailed', error: String(error) }));
                    reply = 'Coś poszło nie tak. Spróbuj ponownie za 5 minut.';
                }
                await discord.editOriginalResponse(interaction.application_id, interaction.token, reply);
            })().catch((error) => console.error(JSON.stringify({ event: 'ankietaReplyFailed', error: String(error) }))),
        );
        return jsonResponse({ type: DEFERRED_CHANNEL_MESSAGE, data: { flags: MessageFlags.Ephemeral } });
    };
}

export const handleAnkietaCommand = createAnkietaHandler((env) => createDiscordRest(env));
