// A circular mask for a square avatar PNG: the corners become transparent, with a soft edge.
//
// Cloudflare image transformations have no circle option, and the bot has no dependencies, so
// this is a small PNG decoder and encoder. It reads only what the avatar sources give:
//   - 8 bits per channel, no interlace;
//   - color type 2 (RGB), 3 (palette, with or without tRNS) or 6 (RGBA).
// Anything else throws (16-bit, grayscale, interlaced, not square, malformed). The caller then
// uses the square image.

const SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
/** Bytes per pixel in the decoded scanlines, by color type. */
const CHANNELS: Record<number, number> = { 2: 3, 3: 1, 6: 4 };
/** The avatars are 128x128. This only bounds the memory for a strange input. */
const MAX_SIDE = 1024;

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream): Promise<Uint8Array> {
    return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer());
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
});

function crc32(bytes: Uint8Array): number {
    let c = 0xffffffff;
    for (const b of bytes) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
}

function paeth(a: number, b: number, c: number): number {
    const p = a + b - c;
    const pa = Math.abs(p - a);
    const pb = Math.abs(p - b);
    const pc = Math.abs(p - c);
    return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

/** Decodes a supported PNG to 8-bit RGBA. Throws for anything else. */
export async function decodePng(input: ArrayBuffer): Promise<{ width: number; height: number; rgba: Uint8Array }> {
    const bytes = new Uint8Array(input);
    const view = new DataView(input);
    if (bytes.length < 8 || SIGNATURE.some((b, i) => bytes[i] !== b)) throw new Error('not a PNG');

    let width = 0;
    let height = 0;
    let colorType = -1;
    let palette: Uint8Array | null = null;
    let transparency: Uint8Array | null = null;
    const idat: Uint8Array[] = [];
    let ended = false;
    for (let at = 8; at + 12 <= bytes.length && !ended; ) {
        const length = view.getUint32(at);
        const type = String.fromCharCode(...bytes.subarray(at + 4, at + 8));
        const data = bytes.subarray(at + 8, at + 8 + length);
        if (data.length !== length) throw new Error('truncated chunk');
        if (type === 'IHDR') {
            width = view.getUint32(at + 8);
            height = view.getUint32(at + 12);
            const [depth, color, compression, filter, interlace] = data.subarray(8, 13);
            if (depth !== 8 || !(color in CHANNELS) || compression !== 0 || filter !== 0 || interlace !== 0) {
                throw new Error(`unsupported PNG: depth ${depth}, color ${color}, interlace ${interlace}`);
            }
            colorType = color;
        } else if (type === 'PLTE') palette = data;
        else if (type === 'tRNS') transparency = data;
        else if (type === 'IDAT') idat.push(data);
        else if (type === 'IEND') ended = true;
        at += 12 + length;
    }
    if (colorType < 0 || !ended || idat.length === 0) throw new Error('missing IHDR, IDAT or IEND');
    if (width === 0 || width > MAX_SIDE || height === 0 || height > MAX_SIDE) throw new Error(`bad size ${width}x${height}`);
    if (colorType === 3 && !palette) throw new Error('palette PNG without PLTE');
    if (colorType !== 3 && transparency) throw new Error('tRNS is supported only with a palette');

    const compressed = new Uint8Array(idat.reduce((n, c) => n + c.length, 0));
    idat.reduce((offset, c) => (compressed.set(c, offset), offset + c.length), 0);
    const raw = await pipe(compressed, new DecompressionStream('deflate'));

    // Undo the per-row filters (PNG spec, section 9). bpp is the left neighbour's distance.
    const bpp = CHANNELS[colorType];
    const stride = width * bpp;
    if (raw.length < height * (stride + 1)) throw new Error('short image data');
    const pixels = new Uint8Array(height * stride);
    for (let y = 0; y < height; y++) {
        const filter = raw[y * (stride + 1)];
        if (filter > 4) throw new Error(`bad filter ${filter}`);
        const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
        const out = y * stride;
        for (let x = 0; x < stride; x++) {
            const a = x >= bpp ? pixels[out + x - bpp] : 0;
            const b = y > 0 ? pixels[out + x - stride] : 0;
            const c = x >= bpp && y > 0 ? pixels[out + x - stride - bpp] : 0;
            // 0 None, 1 Sub, 2 Up, 3 Average, 4 Paeth.
            const predictor = filter === 0 ? 0 : filter === 1 ? a : filter === 2 ? b : filter === 3 ? (a + b) >> 1 : paeth(a, b, c);
            pixels[out + x] = (line[x] + predictor) & 0xff;
        }
    }

    const rgba = new Uint8Array(width * height * 4);
    for (let i = 0; i < width * height; i++) {
        if (colorType === 3) {
            const index = pixels[i];
            if (index * 3 + 2 >= palette!.length) throw new Error('palette index out of range');
            rgba.set(palette!.subarray(index * 3, index * 3 + 3), i * 4);
            rgba[i * 4 + 3] = transparency && index < transparency.length ? transparency[index] : 255;
        } else {
            rgba.set(pixels.subarray(i * bpp, i * bpp + 3), i * 4);
            rgba[i * 4 + 3] = colorType === 6 ? pixels[i * 4 + 3] : 255;
        }
    }
    return { width, height, rgba };
}

/** Encodes 8-bit RGBA as a PNG: filter 0 on every row, one IDAT. */
export async function encodePng(width: number, height: number, rgba: Uint8Array): Promise<ArrayBuffer> {
    const raw = new Uint8Array(height * (width * 4 + 1));
    for (let y = 0; y < height; y++) raw.set(rgba.subarray(y * width * 4, (y + 1) * width * 4), y * (width * 4 + 1) + 1);

    const ihdr = new Uint8Array(13);
    new DataView(ihdr.buffer).setUint32(0, width);
    new DataView(ihdr.buffer).setUint32(4, height);
    ihdr.set([8, 6, 0, 0, 0], 8);
    const chunks: [string, Uint8Array][] = [
        ['IHDR', ihdr],
        ['IDAT', await pipe(raw, new CompressionStream('deflate'))],
        ['IEND', new Uint8Array(0)],
    ];

    const out = new Uint8Array(8 + chunks.reduce((n, [, data]) => n + 12 + data.length, 0));
    const view = new DataView(out.buffer);
    out.set(SIGNATURE);
    let at = 8;
    for (const [type, data] of chunks) {
        view.setUint32(at, data.length);
        const typeAndData = out.subarray(at + 4, at + 8 + data.length);
        typeAndData.set(new TextEncoder().encode(type));
        typeAndData.set(data, 4);
        view.setUint32(at + 8 + data.length, crc32(typeAndData));
        at += 12 + data.length;
    }
    return out.buffer;
}

/**
 * The image with a circular alpha mask, as an RGBA PNG. A pixel's alpha is multiplied by how much
 * of it lies inside the circle (estimated from its center's distance to the circle's center), so
 * the edge is anti-aliased. Throws for an unsupported or non-square PNG.
 */
export async function roundPng(input: ArrayBuffer): Promise<ArrayBuffer> {
    const { width, height, rgba } = await decodePng(input);
    if (width !== height) throw new Error(`not square: ${width}x${height}`);
    const radius = width / 2;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const distance = Math.hypot(x + 0.5 - radius, y + 0.5 - radius);
            const coverage = Math.min(1, Math.max(0, radius - distance + 0.5));
            const alpha = (y * width + x) * 4 + 3;
            rgba[alpha] = Math.round(rgba[alpha] * coverage);
        }
    }
    return encodePng(width, height, rgba);
}
