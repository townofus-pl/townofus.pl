// Application commands and component IDs. `scripts/registerCommands.ts` sends COMMANDS to
// Discord, and the router (interactions.ts) matches on the same names, so they cannot drift.

export const ANKIETA_COMMAND = 'ankieta';

/** Button custom_ids on the signup message. */
export const SIGNUP_JOIN_BUTTON = 'signup:join';
export const SIGNUP_LEAVE_BUTTON = 'signup:leave';

export const COMMANDS = [
    {
        name: ANKIETA_COMMAND,
        type: 1, // CHAT_INPUT
        description: 'Utwórz ankietę Emperora i zapisy dla ostatniego dnia z grami',
        // "0" hides the command from everyone but admins. A server admin then allows the Host
        // role in Server Settings > Integrations. The handler must also check member.roles
        // against DISCORD_HOST_ROLE_ID.
        default_member_permissions: '0',
    },
];
