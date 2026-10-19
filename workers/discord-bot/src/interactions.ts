// Routes a verified interaction to its handler. The handlers are stubs: the poll and signup
// tickets fill them in.

import { ANKIETA_COMMAND, SIGNUP_JOIN_BUTTON, SIGNUP_LEAVE_BUTTON } from './commands';
import { ephemeralReply, Interaction, InteractionResponseType, InteractionType, jsonResponse } from './discord';
import type { BotEnv } from './env';
import { handleSignupButton } from './signup/handler';

export type InteractionHandler = (
    interaction: Interaction,
    env: BotEnv,
    ctx: ExecutionContext,
) => Promise<Response>;

const NOT_READY = 'Ta funkcja jeszcze nie działa.';

export const handleAnkietaCommand: InteractionHandler = async () => ephemeralReply(NOT_READY);

export const handleSignupJoin: InteractionHandler = handleSignupButton;

export const handleSignupLeave: InteractionHandler = handleSignupButton;

const commandHandlers: Record<string, InteractionHandler> = {
    [ANKIETA_COMMAND]: handleAnkietaCommand,
};

const componentHandlers: Record<string, InteractionHandler> = {
    [SIGNUP_JOIN_BUTTON]: handleSignupJoin,
    [SIGNUP_LEAVE_BUTTON]: handleSignupLeave,
};

export async function handleInteraction(
    interaction: Interaction,
    env: BotEnv,
    ctx: ExecutionContext,
): Promise<Response> {
    switch (interaction.type) {
        case InteractionType.Ping:
            return jsonResponse({ type: InteractionResponseType.Pong });

        case InteractionType.ApplicationCommand: {
            const handler = commandHandlers[interaction.data?.name ?? ''];
            return handler ? handler(interaction, env, ctx) : jsonResponse({ error: 'Unknown command' }, 400);
        }

        case InteractionType.MessageComponent: {
            // Match on the first two parts: `signup:join:2026-10-21` → `signup:join`.
            const key = (interaction.data?.custom_id ?? '').split(':').slice(0, 2).join(':');
            const handler = componentHandlers[key];
            return handler ? handler(interaction, env, ctx) : jsonResponse({ error: 'Unknown component' }, 400);
        }

        default:
            return jsonResponse({ error: 'Unknown interaction type' }, 400);
    }
}
