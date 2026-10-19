// The "Gram" and "Wypisz mnie" buttons (#357).
//
// Response pattern: the interaction response is UPDATE_MESSAGE (type 7) with the new list, so the
// list on the message changes in the same round trip and needs no bot token or rate-limited
// PATCH. An interaction has exactly one response, so the confirmation for the clicker is an
// ephemeral follow-up message, sent from waitUntil after the response. The D1 work before the
// response is a few short queries, far below Discord's 3 s limit. A click that changes nothing
// (closed, bad button, nick taken, error) gets one ephemeral reply and leaves the message as it is.

import { ephemeralReply, jsonResponse, type Interaction } from '../discord';
import type { BotEnv } from '../env';
import { resolveForJoin, resolveForLeave, type SignupIdentity } from './identity';
import { escapeMarkdown, formatDayMonth, parseSignupCustomId, renderSignupMessage } from './message';
import { discordRest, type SignupRest } from './rest';
import { joinRoster, leaveRoster, seasonForSession, signupClosesAt } from './roster';

const UPDATE_MESSAGE = 7;

export interface SignupDeps {
    now: () => number;
    rest: SignupRest;
}

const BAD_BUTTON = 'Ten przycisk nie działa. Napisz do hosta.';
const NOT_IN_GUILD = 'Zapisy działają tylko na serwerze.';
const FAILED = 'Coś poszło nie tak. Spróbuj jeszcze raz.';

function confirmation(action: 'join' | 'leave', date: string, identity: SignupIdentity): string {
    const day = formatDayMonth(date);
    if (action === 'leave') return `Nie ma cię na liście na ${day}.`;
    return `Jesteś na liście na ${day} jako **${escapeMarkdown(identity.name)}**.`;
}

/** The nick belongs to a player linked to another account: the click changes nothing. */
function takenReply(action: 'join' | 'leave', identity: SignupIdentity): string {
    const nick = `**${escapeMarkdown(identity.name)}**`;
    return action === 'join'
        ? `Nick ${nick} ma gracz powiązany z innym kontem Discord, więc nie zapisuję cię. Host to sprawdzi.`
        : `Nick ${nick} ma gracz powiązany z innym kontem Discord, więc nikogo nie wypisuję. Napisz do hosta.`;
}

export async function handleSignupButton(
    interaction: Interaction,
    env: BotEnv,
    ctx: ExecutionContext,
    deps: SignupDeps = { now: Date.now, rest: discordRest(env) },
): Promise<Response> {
    const button = parseSignupCustomId(interaction.data?.custom_id ?? '');
    if (!button) return ephemeralReply(BAD_BUTTON);
    const member = interaction.member;
    if (!member) return ephemeralReply(NOT_IN_GUILD);

    const closesAt = signupClosesAt(button.date);
    if (deps.now() >= closesAt) return ephemeralReply(env.TEXT_SIGNUP_CLOSED_REPLY);

    try {
        const season = seasonForSession(button.date);
        const join = button.action === 'join';
        const identity = join ? await resolveForJoin(env.DB, member) : await resolveForLeave(env.DB, member);
        if (identity.outcome === 'taken') return ephemeralReply(takenReply(button.action, identity));
        const names = join
            ? await joinRoster(env.DB, season, button.date, identity.name, closesAt)
            : await leaveRoster(env.DB, season, button.date, identity.name, closesAt);
        if (names === null) return ephemeralReply(env.TEXT_SIGNUP_CLOSED_REPLY);

        console.log(JSON.stringify({ event: 'signup', action: button.action, date: button.date, outcome: identity.outcome }));
        ctx.waitUntil(
            deps.rest
                .followup(interaction.application_id, interaction.token, confirmation(button.action, button.date, identity))
                .catch((error) => console.error('signup followup failed', error)),
        );
        return jsonResponse({ type: UPDATE_MESSAGE, data: renderSignupMessage(env, button.date, names, false) });
    } catch (error) {
        console.error('signup click failed', error);
        return ephemeralReply(FAILED);
    }
}
