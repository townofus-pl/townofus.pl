// Ed25519 verification of a Discord interaction request.
//
// Discord signs `timestamp + rawBody` with the application's key and sends the signature in
// `X-Signature-Ed25519`. The check must run on the exact bytes received: parsing the JSON and
// serialising it again changes them. Discord sends requests with bad signatures on purpose, and
// removes the endpoint if the app accepts one.

const textEncoder = new TextEncoder();

function hexToBytes(hex: string): Uint8Array | null {
    if (hex.length === 0 || hex.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(hex)) return null;
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return bytes;
}

/**
 * Returns the raw body as text when the signature is valid, `null` otherwise. Reads the body, so
 * call it once per request.
 */
export async function verifyDiscordRequest(
    request: Request,
    publicKeyHex: string,
): Promise<string | null> {
    const signature = hexToBytes(request.headers.get('X-Signature-Ed25519') ?? '');
    const timestamp = request.headers.get('X-Signature-Timestamp');
    const publicKey = hexToBytes(publicKeyHex);
    const body = new Uint8Array(await request.arrayBuffer());

    if (!signature || signature.length !== 64 || !timestamp || !publicKey || publicKey.length !== 32) {
        return null;
    }

    const timestampBytes = textEncoder.encode(timestamp);
    const signed = new Uint8Array(timestampBytes.length + body.length);
    signed.set(timestampBytes, 0);
    signed.set(body, timestampBytes.length);

    try {
        const key = await crypto.subtle.importKey('raw', publicKey, { name: 'Ed25519' }, false, ['verify']);
        const valid = await crypto.subtle.verify({ name: 'Ed25519' }, key, signature, signed);
        return valid ? new TextDecoder().decode(body) : null;
    } catch {
        return null;
    }
}
