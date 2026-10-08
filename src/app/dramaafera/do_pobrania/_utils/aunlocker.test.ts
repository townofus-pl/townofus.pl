import { pickAUnlockerDll } from './aunlocker';

const asset = (name: string) => ({ name, browser_download_url: `https://github.com/astra1dev/AUnlocker/releases/download/v1.3.1/${name}` });

describe('pickAUnlockerDll', () => {
    it('picks the DLL, not the full-install zips', () => {
        const release = { assets: [asset('AUnlocker_v1.3.1_Steam_Itch.zip'), asset('AUnlocker_v1.3.1.dll'), asset('AUnlocker_v1.3.1_EpicGames_MicrosoftStore_XboxApp.zip')] };
        expect(pickAUnlockerDll(release)).toBe('https://github.com/astra1dev/AUnlocker/releases/download/v1.3.1/AUnlocker_v1.3.1.dll');
    });

    it('gives null for a release without a DLL, or a broken answer', () => {
        expect(pickAUnlockerDll({ assets: [asset('AUnlocker_v1.3.1_Steam_Itch.zip')] })).toBeNull();
        expect(pickAUnlockerDll({ message: 'API rate limit exceeded' })).toBeNull();
        expect(pickAUnlockerDll(null)).toBeNull();
    });

    it('refuses a download url outside GitHub', () => {
        expect(pickAUnlockerDll({ assets: [{ name: 'AUnlocker_v9.dll', browser_download_url: 'https://evil.example/AUnlocker_v9.dll' }] })).toBeNull();
    });
});
