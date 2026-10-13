import { dllUrl, tagFromLatestRedirect } from './_latest';

describe('AUnlocker latest DLL', () => {
    it('reads the tag from the releases/latest redirect', () => {
        expect(tagFromLatestRedirect('https://github.com/astra1dev/AUnlocker/releases/tag/v1.3.1')).toBe('v1.3.1');
    });

    it('rejects a redirect that is not a release tag of AUnlocker', () => {
        expect(tagFromLatestRedirect(null)).toBeNull();
        expect(tagFromLatestRedirect('https://github.com/astra1dev/AUnlocker/releases')).toBeNull();
        expect(tagFromLatestRedirect('https://github.com/other/AUnlocker/releases/tag/v1.3.1')).toBeNull();
        expect(tagFromLatestRedirect('https://github.com/astra1dev/AUnlocker/releases/tag/v1.3.1/../x')).toBeNull();
    });

    it('builds the DLL link the releases use', () => {
        expect(dllUrl('v1.3.1')).toBe('https://github.com/astra1dev/AUnlocker/releases/download/v1.3.1/AUnlocker_v1.3.1.dll');
    });
});
