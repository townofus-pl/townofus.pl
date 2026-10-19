// Routes a verified interaction to its handler. The handlers are stubs: the poll and signup
// tickets fill them in.

import { ANKIETA_COMMAND, SIGNUP_JOIN_BUTTON, SIGNUP_LEAVE_BUTTON } from './commands';
import { ephemeralReply, Interaction, InteractionResponseType, InteractionType, jsonResponse } from './discord';
import type { BotEnv } from './env';

export type InteractionHandler = (
    interaction: Interaction,
    env: BotEnv,
    ctx: ExecutionContext,
) => Promise<Response>;

const NOT_READY = 'Ta funkcja jeszcze nie działa.';

export const handleAnkietaCommand: InteractionHandler = async () => ephemeralReply(NOT_READY);

export const handleSignupJoin: InteractionHandler = async () => ephemeralReply(NOT_READY);

export const handleSignupLeave: InteractionHandler = async () => ephemeralReply(NOT_READY);

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
            const handler = componentHandlers[interaction.data?.custom_id ?? ''];
            return handler ? handler(interaction, env, ctx) : jsonResponse({ error: 'Unknown component' }, 400);
        }

        default:
            return jsonResponse({ error: 'Unknown interaction type' }, 400);
    }
}
