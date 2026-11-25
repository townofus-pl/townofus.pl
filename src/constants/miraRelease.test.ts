import { LEAGUE_MIRA_BUILDS, LEAGUE_MIRA_RELEASE_URL, LEAGUE_MIRA_VERSION, leagueMiraDownloadUrl } from './miraRelease';

describe('league TOU-Mira release', () => {
    it('is pinned to 1.7.9-beta2', () => {
        expect(LEAGUE_MIRA_VERSION).toBe('1.7.9-beta2');
        expect(LEAGUE_MIRA_RELEASE_URL).toMatch(/\/tag\/1\.7\.9-beta2$/);
    });

    it('lists the beta2 archives and no macOS or Linux build', () => {
        expect(LEAGUE_MIRA_BUILDS.map((b) => [b.label, b.zip])).toEqual([
            ['Steam', 'TouMira.v1.7.9-beta2-x64-Steam-Epic-MsStore.zip'],
            ['Epic', 'TouMira.v1.7.9-beta2-x64-Steam-Epic-MsStore.zip'],
            ['Microsoft Store', 'TouMira.v1.7.9-beta2-x64-Steam-Epic-MsStore.zip'],
            ['itch.io', 'TouMira.v1.7.9-beta2-x86-ItchIo.zip'],
        ]);
        expect(leagueMiraDownloadUrl('a.zip')).toMatch(/\/download\/1\.7\.9-beta2\/a\.zip$/);
    });
});
