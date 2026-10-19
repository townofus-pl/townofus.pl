// The small part of the Discord API types the bot uses. Values from
// https://docs.discord.com/developers/interactions/receiving-and-responding

export const InteractionType = {
    Ping: 1,
    ApplicationCommand: 2,
    MessageComponent: 3,
} as const;

export const InteractionResponseType = {
    Pong: 1,
    ChannelMessageWithSource: 4,
} as const;

export const MessageFlags = {
    Ephemeral: 1 << 6,
} as const;

export interface DiscordUser {
    id: string;
    username: string;
    global_name?: string | null;
}

export interface GuildMember {
    user: DiscordUser;
    nick?: string | null;
    roles: string[];
}

export interface Interaction {
    id: string;
    type: number;
    token: string;
    application_id: string;
    guild_id?: string;
    channel_id?: string;
    member?: GuildMember;
    data?: {
        /** Application command name. */
        name?: string;
        /** Button custom_id. */
        custom_id?: string;
    };
    message?: { id: string };
}

export function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

/** A reply only the user who triggered the interaction sees. */
export function ephemeralReply(content: string): Response {
    return jsonResponse({
        type: InteractionResponseType.ChannelMessageWithSource,
        data: { content, flags: MessageFlags.Ephemeral },
    });
}
