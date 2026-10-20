// Bindings, vars and secrets from wrangler.toml. Keep in sync with every [env.*] block there.
export interface BotEnv {
    DB: D1Database;

    /** "dev" | "staging" | "production". Only "dev" enables the /__dev/tick route. */
    ENVIRONMENT: string;

    DISCORD_APPLICATION_ID: string;
    /** Hex Ed25519 public key from the Developer Portal. Verifies every interaction. */
    DISCORD_PUBLIC_KEY: string;
    DISCORD_GUILD_ID: string;
    DISCORD_CHANNEL_ID: string;
    DISCORD_HOST_ROLE_ID: string;
    /** Role pinged by the first send of the poll message. Empty: no ping. */
    DISCORD_PING_ROLE_ID: string;

    TEXT_POLL_QUESTION: string;
    /** `{date}` is replaced with DD.MM of the session. */
    TEXT_SIGNUP: string;
    /** Heading above the list of names. `{date}` is replaced with DD.MM of the session. */
    TEXT_SIGNUP_LIST: string;
    TEXT_SIGNUP_JOIN: string;
    TEXT_SIGNUP_LEAVE: string;
    TEXT_SIGNUP_CLOSED: string;
    TEXT_SIGNUP_CLOSED_REPLY: string;

    /** Secret. `.dev.vars` locally, GitHub environment secret in CI. */
    DISCORD_BOT_TOKEN: string;
}
