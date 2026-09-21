import { readFileSync } from 'node:fs';
import { populateLegacy, populateMira, resolveSettingsView } from './settingsView';
import { Roles } from '../_roles';
import { MiraRoles } from '@/mira';

// Two lines per entry; only role lines are wrapped in <color=…>. Anything else is a global option.
const LEGACY = [
    '<color=#FFFF00FF>Sheriff</color>', '30',
    '<color=#00FFFFFF>Medic</color>', '0',
    'Sheriff Kill Cooldown', '25',
    'All Roles Are Unique', 'True',
].join('\n');

const MIRA_CFG = readFileSync('public/settings/mira.cfg', 'utf8');

describe('populateLegacy', () => {
    it('keeps a role with a chance above zero and drops one at zero', () => {
        const { roles } = populateLegacy(LEGACY);
        const names = roles.map((r) => r.name);
        expect(names).toContain('Sheriff');
        expect(names).not.toContain('Medic');
    });

    it('takes both the chance and a per-role setting from the file', () => {
        const sheriff = populateLegacy(LEGACY).roles.find((r) => r.name === 'Sheriff')!;
        expect(sheriff.settings['Probability Of Appearing'].value).toBe(30);
        expect(sheriff.settings['Sheriff Kill Cooldown'].value).toBe(25);
    });

    it('returns the two pseudo-roles separately and keeps them out of the role list', () => {
        const view = populateLegacy(LEGACY);
        expect(view.roles.map((r) => r.name)).not.toContain('Mod Settings');
        expect(view.modSettings?.settings['All Roles Are Unique'].value).toBe(true);
        expect(view.impostorSettings).not.toBeNull();
    });

    // The bug this rewrite existed to remove: the old code assigned into the imported registry,
    // so every other consumer in the tab saw whatever this page had last parsed.
    it('does not write into the imported Roles registry', () => {
        const sheriff = Roles.find((r) => r.name === 'Sheriff')!;
        const before = JSON.stringify({
            chance: sheriff.settings['Probability Of Appearing'].value,
            cooldown: sheriff.settings['Sheriff Kill Cooldown'].value,
        });

        populateLegacy(LEGACY);

        expect(
            JSON.stringify({
                chance: sheriff.settings['Probability Of Appearing'].value,
                cooldown: sheriff.settings['Sheriff Kill Cooldown'].value,
            }),
        ).toBe(before);
    });
});

describe('populateMira', () => {
    it('resolves against the Mira registry, not the legacy one', () => {
        const { roles } = populateMira(MIRA_CFG);
        const miraOnly = MiraRoles.map((r) => r.name).filter(
            (name) => !Roles.some((legacy) => legacy.name === name),
        );
        // Every returned role must be a Mira role, and at least one must be Mira-only.
        expect(roles.every((r) => MiraRoles.some((m) => m.name === r.name))).toBe(true);
        expect(miraOnly.length).toBeGreaterThan(0);
    });

    it('returns only entries the config actually enables', () => {
        const view = populateMira(MIRA_CFG);
        expect(view.roles.length).toBeGreaterThan(0);
        expect(view.roles.length).toBeLessThan(MiraRoles.length);
        for (const role of view.roles) {
            expect(Number(role.settings['Probability Of Appearing'].value)).toBeGreaterThan(0);
        }
        for (const modifier of view.modifiers) {
            expect(Number(modifier.settings['Probability Of Appearing'].value)).toBeGreaterThan(0);
        }
    });

    it('fills role settings from the config, with the mod’s own labels', () => {
        const sheriff = populateMira(MIRA_CFG).roles.find((r) => r.name === 'Sheriff');
        expect(sheriff).toBeDefined();
        expect(Object.keys(sheriff!.settings).length).toBeGreaterThan(1);
    });

    it('does not write into the imported MiraRoles registry', () => {
        const sheriff = MiraRoles.find((r) => r.name === 'Sheriff')!;
        const before = JSON.stringify(sheriff.settings);
        populateMira(MIRA_CFG);
        expect(JSON.stringify(sheriff.settings)).toBe(before);
    });

    it('finds odds for every modifier in the registry', () => {
        // 37 declared; a few are per-team in the config (ImpOverclockerChance) and must still match.
        const withOdds = populateMira(MIRA_CFG);
        expect(withOdds.modifiers.length).toBeGreaterThan(0);
    });
});

describe('resolveSettingsView — the era comes from the file', () => {
    it('reads a .cfg as TOU-Mira whatever the season', () => {
        expect(resolveSettingsView(MIRA_CFG, 3).kind).toBe('mira');
        expect(resolveSettingsView(MIRA_CFG, 4).kind).toBe('mira');
    });

    it('reads a .txt as legacy below season 4', () => {
        expect(resolveSettingsView(LEGACY, 3).kind).toBe('legacy');
    });

    // The whole point: with CURRENT_SEASON = 4 the old page rendered 60 legacy roles with no
    // values. Last season's file is not this season's settings.
    it('refuses to present a legacy file as a TOU-Mira season\u2019s settings', () => {
        expect(resolveSettingsView(LEGACY, 4).kind).toBe('awaiting');
    });

    it('treats an empty or missing file as nothing to show', () => {
        expect(resolveSettingsView('', 4).kind).toBe('awaiting');
        expect(resolveSettingsView(null, 3).kind).toBe('awaiting');
    });
});
