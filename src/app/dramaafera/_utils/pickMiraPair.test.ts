import { pickMiraPair } from './miraConfig';

const MIRA = '[Roles]\nNum TownOfUs.Roles.Neutral.SpectreRole = 0\n';
const LEGACY = '<color=#B34D99FF>Aurial</color>\n30\n';

describe('pickMiraPair', () => {
    it('accepts a pair where both sides are TOU:Mira configs', () => {
        expect(pickMiraPair(`${MIRA}# a`, `${MIRA}# b`)).toEqual({
            current: `${MIRA}# a`,
            old: `${MIRA}# b`,
        });
    });

    // The season-opening case. The first .cfg of a season leaves `old` as the previous era's
    // .txt; diffing a config against that yields nothing, so the page must fall through to the
    // committed snapshot rather than render an empty changelog.
    it('rejects a config paired with a legacy .txt', () => {
        expect(pickMiraPair(MIRA, LEGACY)).toBeNull();
    });

    it('rejects a legacy pair, which the legacy view renders instead', () => {
        expect(pickMiraPair(LEGACY, LEGACY)).toBeNull();
    });

    it('rejects a missing side', () => {
        expect(pickMiraPair(MIRA, null)).toBeNull();
        expect(pickMiraPair(null, MIRA)).toBeNull();
        expect(pickMiraPair('', '')).toBeNull();
    });
});
