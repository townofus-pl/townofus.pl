import { assertSafeName, urlProblem } from './clientManifest';

describe('client manifest entry rules', () => {
    it('accepts a url that is the bare file name', () => {
        expect(urlProblem('malkizhats.bundle', 'malkizhats.bundle')).toBeNull();
    });

    it('rejects an absolute url with a clear text', () => {
        expect(urlProblem('malkizhats.bundle', 'https://townofus.pl/mod/client/malkizhats.bundle')).toMatch(
            /absolute .*bare file name "malkizhats.bundle"/,
        );
        expect(urlProblem('a.dll', 'http://localhost:8787/mod/client/a.dll')).toMatch(/absolute/);
    });

    it('rejects a url with "/", "\\", ":" or ".."', () => {
        expect(urlProblem('a.dll', '/mod/client/a.dll')).toMatch(/contains "\/"/);
        expect(urlProblem('a.dll', 'x\\a.dll')).toMatch(/contains "\\"/);
        expect(urlProblem('a.dll', 'c:a.dll')).toMatch(/absolute|contains ":"/);
        expect(urlProblem('a.dll', '..a.dll')).toMatch(/contains "\.\."/);
    });

    it('rejects a url that names a different file', () => {
        expect(urlProblem('a.dll', 'b.dll')).toBe('url is "b.dll", expected "a.dll"');
    });

    it('rejects a name with "/", "\\", ":" or ".."', () => {
        for (const name of ['x/a.dll', 'x\\a.dll', 'a:b.dll', '..a.dll']) {
            expect(() => assertSafeName(name)).toThrow(/Unsafe file name/);
        }
        expect(() => assertSafeName('DramaAferaStats.Client.dll')).not.toThrow();
    });
});
