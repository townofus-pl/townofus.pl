import { beforeAll, describe, expect, it } from '@jest/globals';
import worker from '../src/index';
import type { BotEnv } from '../src/env';
import { InteractionResponseType, InteractionType, MessageFlags } from '../src/discord';
import { ANKIETA_COMMAND, SIGNUP_JOIN_BUTTON, SIGNUP_LEAVE_BUTTON } from '../src/commands';

const toHex = (bytes: ArrayBuffer): string =>
    Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, '0')).join('');

let keys: CryptoKeyPair;
let env: BotEnv;

const ctx = { waitUntil: () => {}, passThroughOnException: () => {} } as unknown as ExecutionContext;

beforeAll(async () => {
    keys = (await crypto.subtle.generateKey({ name: 'Ed25519' }, true, ['sign', 'verify'])) as CryptoKeyPair;
    const publicKey = (await crypto.subtle.exportKey('raw', keys.publicKey)) as ArrayBuffer;
    env = { DISCORD_PUBLIC_KEY: toHex(publicKey) } as BotEnv;
});

async function signedRequest(body: string, options: { tamper?: boolean; timestamp?: string } = {}): Promise<Request> {
    const timestamp = options.timestamp ?? '1761004800';
    const signature = await crypto.subtle.sign('Ed25519', keys.privateKey, new TextEncoder().encode(timestamp + body));
    return new Request('https://bot.example/', {
        method: 'POST',
        headers: { 'X-Signature-Ed25519': toHex(signature), 'X-Signature-Timestamp': timestamp },
        body: options.tamper ? body.replace('}', ',"x":1}') : body,
    });
}

async function call(request: Request): Promise<Response> {
    return worker.fetch(request as Parameters<typeof worker.fetch>[0], env, ctx);
}

const ping = JSON.stringify({ type: InteractionType.Ping });

describe('fetch: signature', () => {
    it('answers PONG to a signed PING', async () => {
        const response = await call(await signedRequest(ping));
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({ type: InteractionResponseType.Pong });
    });

    it('rejects a body that does not match the signature', async () => {
        expect((await call(await signedRequest(ping, { tamper: true }))).status).toBe(401);
    });

    it('rejects a signature made for another timestamp', async () => {
        const request = await signedRequest(ping);
        request.headers.set('X-Signature-Timestamp', '1761004801');
        expect((await call(request)).status).toBe(401);
    });

    it('rejects a signature from another key', async () => {
        const other = (await crypto.subtle.generateKey({ name: 'Ed25519' }, true, ['sign', 'verify'])) as CryptoKeyPair;
        const signature = await crypto.subtle.sign('Ed25519', other.privateKey, new TextEncoder().encode('1' + ping));
        const request = new Request('https://bot.example/', {
            method: 'POST',
            headers: { 'X-Signature-Ed25519': toHex(signature), 'X-Signature-Timestamp': '1' },
            body: ping,
        });
        expect((await call(request)).status).toBe(401);
    });

    it('rejects a request without signature headers', async () => {
        const request = new Request('https://bot.example/', { method: 'POST', body: ping });
        expect((await call(request)).status).toBe(401);
    });

    it('rejects every request while the public key is not configured', async () => {
        const request = await signedRequest(ping);
        const response = await worker.fetch(request as Parameters<typeof worker.fetch>[0], { ...env, DISCORD_PUBLIC_KEY: '' }, ctx);
        expect(response.status).toBe(401);
    });

    it('rejects GET with 405', async () => {
        expect((await call(new Request('https://bot.example/'))).status).toBe(405);
    });
});

describe('fetch: routing', () => {
    const ephemeral = async (body: object) => {
        const response = await call(await signedRequest(JSON.stringify(body)));
        expect(response.status).toBe(200);
        const json = (await response.json()) as { type: number; data: { flags: number } };
        expect(json.type).toBe(InteractionResponseType.ChannelMessageWithSource);
        expect(json.data.flags).toBe(MessageFlags.Ephemeral);
    };

    it('routes /ankieta to its handler', () =>
        ephemeral({ type: InteractionType.ApplicationCommand, data: { name: ANKIETA_COMMAND } }));

    it('routes both signup buttons to their handlers', async () => {
        await ephemeral({ type: InteractionType.MessageComponent, data: { custom_id: SIGNUP_JOIN_BUTTON } });
        await ephemeral({ type: InteractionType.MessageComponent, data: { custom_id: SIGNUP_LEAVE_BUTTON } });
    });

    it('answers 400 to an unknown command', async () => {
        const body = JSON.stringify({ type: InteractionType.ApplicationCommand, data: { name: 'nope' } });
        expect((await call(await signedRequest(body))).status).toBe(400);
    });
});
