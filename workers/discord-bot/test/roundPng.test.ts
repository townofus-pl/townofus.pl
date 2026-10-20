import { describe, expect, it } from '@jest/globals';
import { crc32, deflateSync } from 'node:zlib';
import { decodePng, encodePng, roundPng } from '../src/poll/roundPng';

interface TestPng {
    size: number;
    height?: number;
    colorType: number;
    /** Scanline bytes without the filter byte: size * channels per row. */
    pixels: Uint8Array;
    palette?: Uint8Array;
    trns?: Uint8Array;
    depth?: number;
    interlace?: number;
    /** The filter type of row y. Default y % 5. */
    filterOf?: (y: number) => number;
}

const CHANNELS: Record<number, number> = { 0: 1, 2: 3, 3: 1, 6: 4 };

function chunk(type: string, data: Uint8Array): Buffer {
    const head = Buffer.alloc(8);
    head.writeUInt32BE(data.length);
    head.write(type, 4, 'latin1');
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([head.subarray(4), data])));
    return Buffer.concat([head, data, crc]);
}

/** An independent PNG writer. Row y uses filter y % 5, so every image has all 5 filters. */
function makePng(png: TestPng): ArrayBuffer {
    const { size, colorType, pixels } = png;
    const height = png.height ?? size;
    const bpp = CHANNELS[colorType];
    const stride = size * bpp;
    const filtered = new Uint8Array(height * (stride + 1));
    for (let y = 0; y < height; y++) {
        const filter = png.filterOf?.(y) ?? y % 5;
        filtered[y * (stride + 1)] = filter;
        for (let x = 0; x < stride; x++) {
            const at = y * stride + x;
            const a = x >= bpp ? pixels[at - bpp] : 0;
            const b = y > 0 ? pixels[at - stride] : 0;
            const c = x >= bpp && y > 0 ? pixels[at - stride - bpp] : 0;
            const p = a + b - c;
            const paeth = Math.abs(p - a) <= Math.abs(p - b) && Math.abs(p - a) <= Math.abs(p - c) ? a : Math.abs(p - b) <= Math.abs(p - c) ? b : c;
            const predictor = [0, a, b, (a + b) >> 1, paeth][filter] ?? 0;
            filtered[y * (stride + 1) + 1 + x] = (pixels[at] - predictor) & 0xff;
        }
    }
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(size, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr.set([png.depth ?? 8, colorType, 0, 0, png.interlace ?? 0], 8);
    const out = Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        chunk('IHDR', ihdr),
        ...(png.palette ? [chunk('PLTE', png.palette)] : []),
        ...(png.trns ? [chunk('tRNS', png.trns)] : []),
        chunk('IDAT', deflateSync(filtered)),
        chunk('IEND', new Uint8Array(0)),
    ]);
    return out.buffer.slice(out.byteOffset, out.byteOffset + out.byteLength);
}

/** A 16x16 test pattern: noisy values so that every filter changes the bytes. */
const value = (i: number) => (i * 37 + (i >> 3) * 11) & 0xff;
const SIZE = 16;

function rgbaPattern(): Uint8Array {
    const rgba = new Uint8Array(SIZE * SIZE * 4);
    for (let i = 0; i < rgba.length; i++) rgba[i] = i % 4 === 3 ? 255 : value(i);
    return rgba;
}

/** Each supported color type, with the RGBA that a decoder must give. */
function cases(): { name: string; png: ArrayBuffer; rgba: Uint8Array }[] {
    const rgba = rgbaPattern();
    // A few pixels with partial alpha, away from the center.
    for (const i of [0, 17, 40]) rgba[i * 4 + 3] = 100;
    const rgb = rgbaPattern();
    const rgbPixels = new Uint8Array(SIZE * SIZE * 3);
    for (let i = 0; i < SIZE * SIZE; i++) rgbPixels.set(rgb.subarray(i * 4, i * 4 + 3), i * 3);

    // Palette: 8 colors, index 1 half transparent and index 2 fully transparent (tRNS shorter than PLTE).
    const palette = new Uint8Array(8 * 3).map((_, i) => value(i + 5));
    const trns = new Uint8Array([255, 128, 0]);
    const indexes = new Uint8Array(SIZE * SIZE).map((_, i) => (i * 5 + (i >> 4)) % 8);
    const paletted = new Uint8Array(SIZE * SIZE * 4);
    indexes.forEach((index, i) => {
        paletted.set(palette.subarray(index * 3, index * 3 + 3), i * 4);
        paletted[i * 4 + 3] = index < trns.length ? trns[index] : 255;
    });

    return [
        { name: 'RGBA (6)', png: makePng({ size: SIZE, colorType: 6, pixels: rgba }), rgba },
        { name: 'RGB (2)', png: makePng({ size: SIZE, colorType: 2, pixels: rgbPixels }), rgba: rgb },
        { name: 'palette + tRNS (3)', png: makePng({ size: SIZE, colorType: 3, pixels: indexes, palette, trns }), rgba: paletted },
    ];
}

const alphaAt = (rgba: Uint8Array, x: number, y: number) => rgba[(y * SIZE + x) * 4 + 3];

describe('decodePng', () => {
    it.each(cases())('decodes $name with all five filters', async ({ png, rgba }) => {
        const decoded = await decodePng(png);
        expect([decoded.width, decoded.height]).toEqual([SIZE, SIZE]);
        expect(Buffer.from(decoded.rgba).equals(Buffer.from(rgba))).toBe(true);
    });

    it('reads its own encoder output back', async () => {
        const rgba = rgbaPattern();
        const decoded = await decodePng(await encodePng(SIZE, SIZE, rgba));
        expect(Buffer.from(decoded.rgba).equals(Buffer.from(rgba))).toBe(true);
    });

    const pixels = new Uint8Array(SIZE * SIZE * 4);
    it.each([
        ['16-bit', makePng({ size: SIZE, colorType: 6, pixels, depth: 16 })],
        ['grayscale', makePng({ size: SIZE, colorType: 0, pixels: new Uint8Array(SIZE * SIZE) })],
        ['interlaced', makePng({ size: SIZE, colorType: 6, pixels, interlace: 1 })],
        ['RGB with tRNS', makePng({ size: SIZE, colorType: 2, pixels: new Uint8Array(SIZE * SIZE * 3), trns: new Uint8Array(6) })],
        ['palette without PLTE', makePng({ size: SIZE, colorType: 3, pixels: new Uint8Array(SIZE * SIZE) })],
        ['a JPEG', new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0]).buffer],
        ['a truncated file', makePng({ size: SIZE, colorType: 6, pixels }).slice(0, 60)],
    ])('throws for %s', async (_, png) => {
        await expect(decodePng(png)).rejects.toThrow();
    });

    it('throws for a bad filter byte', async () => {
        const png = makePng({ size: SIZE, colorType: 6, pixels, filterOf: () => 7 });
        await expect(decodePng(png)).rejects.toThrow('bad filter');
    });
});

describe('roundPng', () => {
    it.each(cases())('masks $name: corners transparent, center unchanged, soft edge', async ({ png, rgba }) => {
        const { width, height, rgba: out } = await decodePng(await roundPng(png));

        expect([width, height]).toEqual([SIZE, SIZE]);
        for (const [x, y] of [[0, 0], [SIZE - 1, 0], [0, SIZE - 1], [SIZE - 1, SIZE - 1]]) expect(alphaAt(out, x, y)).toBe(0);
        // The center pixel: same color, and opaque where the source is opaque.
        const center = ((SIZE / 2) * SIZE + SIZE / 2) * 4;
        expect([...out.subarray(center, center + 4)]).toEqual([...rgba.subarray(center, center + 4)]);
        // Inside the circle nothing changes, outside alpha is 0, and the edge is partial.
        let partial = 0;
        for (let y = 0; y < SIZE; y++) {
            for (let x = 0; x < SIZE; x++) {
                const d = Math.hypot(x + 0.5 - SIZE / 2, y + 0.5 - SIZE / 2);
                const i = (y * SIZE + x) * 4;
                expect([...out.subarray(i, i + 3)]).toEqual([...rgba.subarray(i, i + 3)]);
                if (d <= SIZE / 2 - 0.5) expect(out[i + 3]).toBe(rgba[i + 3]);
                if (d >= SIZE / 2 + 0.5) expect(out[i + 3]).toBe(0);
                if (rgba[i + 3] === 255 && out[i + 3] > 0 && out[i + 3] < 255) partial++;
            }
        }
        expect(partial).toBeGreaterThan(0);
    });

    it('a 128x128 RGBA result stays under the emoji limit', async () => {
        const noise = new Uint8Array(128 * 128 * 4).map(() => Math.floor(Math.random() * 256));
        const out = await roundPng(await encodePng(128, 128, noise));
        expect(out.byteLength).toBeLessThan(256 * 1024);
    });

    it('throws for a PNG that is not square', async () => {
        const png = makePng({ size: SIZE, height: SIZE / 2, colorType: 6, pixels: new Uint8Array((SIZE * SIZE * 4) / 2) });
        await expect(roundPng(png)).rejects.toThrow('not square');
    });
});
