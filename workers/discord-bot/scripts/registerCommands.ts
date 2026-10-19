// Registers the bot's guild commands for one environment.
//
//   DISCORD_BOT_TOKEN=... npm run register-commands -- --env staging
//
// Application and guild IDs come from that environment's [vars] in wrangler.toml, so they are
// written down once. Uses the bulk overwrite endpoint: the guild's command list for this
// application becomes exactly COMMANDS, and a command removed from COMMANDS is deleted.

import path from 'node:path';
import { unstable_readConfig } from 'wrangler';
import { COMMANDS } from '../src/commands';

const ENVIRONMENTS = ['dev', 'staging', 'production'];

function fail(message: string): never {
    console.error(message);
    process.exit(1);
}

async function main(): Promise<void> {
    const envIndex = process.argv.indexOf('--env');
    const env = envIndex === -1 ? undefined : process.argv[envIndex + 1];
    if (!env || !ENVIRONMENTS.includes(env)) {
        fail(`Usage: register-commands --env ${ENVIRONMENTS.join('|')}`);
    }

    const config = unstable_readConfig(
        { config: path.resolve(__dirname, '..', 'wrangler.toml'), env },
        { hideWarnings: true },
    );
    const applicationId = String(config.vars.DISCORD_APPLICATION_ID ?? '');
    const guildId = String(config.vars.DISCORD_GUILD_ID ?? '');
    const token = process.env.DISCORD_BOT_TOKEN ?? '';

    if (!applicationId || !guildId) {
        fail(`DISCORD_APPLICATION_ID and DISCORD_GUILD_ID are empty in [env.${env}.vars]`);
    }
    if (!token) fail('DISCORD_BOT_TOKEN is not set');

    const url = `https://discord.com/api/v10/applications/${applicationId}/guilds/${guildId}/commands`;
    const response = await fetch(url, {
        method: 'PUT',
        headers: { Authorization: `Bot ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(COMMANDS),
    });

    if (!response.ok) {
        fail(`Discord answered ${response.status}: ${await response.text()}`);
    }
    const registered = (await response.json()) as { name: string; id: string }[];
    console.log(`Registered in ${env}: ${registered.map((c) => `/${c.name} (${c.id})`).join(', ')}`);
}

main().catch((error: unknown) => fail(String(error)));
