import {
    extractDramaAferaSubPath,
    buildSeasonUrl,
    isSeasonScopedSubPath,
    SEASON_SCOPED_SUBPATHS,
} from './seasonHelpers';
import { CURRENT_SEASON } from '../_constants/seasons';

describe('isSeasonScopedSubPath', () => {
    it.each([...SEASON_SCOPED_SUBPATHS])('accepts %s and anything under it', (root) => {
        expect(isSeasonScopedSubPath(root)).toBe(true);
        expect(isSeasonScopedSubPath(`${root}/20260916`)).toBe(true);
    });

    // These are the six the switcher used to send to a hard 404.
    it.each(['/', '/changelog', '/informacje', '/playlista', '/do_pobrania', '/host', '/lista-cweli'])(
        'rejects %s, which has no sezon/[seasonId] route',
        (subPath) => {
            expect(isSeasonScopedSubPath(subPath)).toBe(false);
        },
    );

    it('does not match on a shared prefix that is not a path boundary', () => {
        expect(isSeasonScopedSubPath('/rankingi-inne')).toBe(false);
        expect(isSeasonScopedSubPath('/users')).toBe(false);
    });
});

describe('the switcher round trip', () => {
    // What SeasonSwitcher does: extract the sub-path, then rebuild it under the chosen season.
    const switchTo = (pathname: string, season: number) => {
        const subPath = extractDramaAferaSubPath(pathname);
        return buildSeasonUrl(isSeasonScopedSubPath(subPath) ? subPath : '/', season);
    };

    it('carries a season-scoped page across', () => {
        expect(switchTo('/dramaafera/ranking', 3)).toBe('/dramaafera/sezon/3/ranking');
        expect(switchTo('/dramaafera/sezon/3/historia-gier/20260916', 2)).toBe(
            '/dramaafera/sezon/2/historia-gier/20260916',
        );
    });

    it('sends a season-less page to the season root instead of a 404', () => {
        expect(switchTo('/dramaafera/informacje', 3)).toBe('/dramaafera/sezon/3');
        expect(switchTo('/dramaafera/changelog', 3)).toBe('/dramaafera/sezon/3');
        expect(switchTo('/dramaafera/host', 3)).toBe('/dramaafera/sezon/3');
    });

    it('drops the prefix when switching back to the current season', () => {
        expect(switchTo('/dramaafera/sezon/3/ranking', CURRENT_SEASON)).toBe('/dramaafera/ranking');
        expect(switchTo('/dramaafera/sezon/3/informacje', CURRENT_SEASON)).toBe('/dramaafera');
    });
});
