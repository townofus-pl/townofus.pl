// Routes a verified interaction to its handler: `/ankieta` (poll/command.ts) and the signup
// buttons (signup/handler.ts).

import { ANKIETA_COMMAND, SIGNUP_JOIN_BUTTON, SIGNUP_LEAVE_BUTTON } from './commands';
import { Interaction, InteractionResponseType, InteractionType, jsonResponse } from './discord';
import type { BotEnv } from './env';
import { handleAnkietaCommand } from './poll/command';
import { handleSignupButton } from './signup/handler';

export type InteractionHandler = (
    interaction: Interaction,
    env: BotEnv,
    ctx: ExecutionContext,
) => Promise<Response>;

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
