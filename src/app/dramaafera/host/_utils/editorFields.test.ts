import { readFileSync } from 'node:fs';
import { MiraRoles } from '@/mira';
import { exportCfgDocument, parseCfgDocument } from './cfgDocument';
import { isHnsField, resolveEditorField, safeCfgFileName, sortRoleGroups } from './editorFields';

const prefix = '[Roles]\nNum TownOfUs.Roles.Crewmate.SheriffRole = 0\nChance TownOfUs.Roles.Crewmate.SheriffRole = 0\n';

describe('editor field metadata', () => {
    it('reads role labels and descriptions from src/mira, including renamed registry labels', () => {
        const document = parseCfgDocument(prefix + '[TownOfUs.Options.Roles.Crewmate.SheriffOptions]\nShootNeutralBenign = true\nMisfireType = 2\nKillCooldown = 25\n');
        const sheriff = MiraRoles.find(role => role.name === 'Sheriff')!;
        const benign = resolveEditorField(document.fields.find(field => field.key === 'ShootNeutralBenign')!);
        expect(benign.label).toBe('Can Shot Neutral Benign Roles');
        const misfire = resolveEditorField(document.fields.find(field => field.key === 'MisfireType')!);
        expect(misfire.description).toEqual(sheriff.settings['Misfire Kills'].description);
        const replacement = jest.replaceProperty(sheriff, 'settings', Object.fromEntries(
            Object.entries(sheriff.settings).map(([label, setting]) => [label === 'Kill Cooldown' ? 'Odstęp strzałów' : label, setting]),
        ));
        try {
            expect(resolveEditorField(document.fields.find(field => field.key === 'KillCooldown')!).label).toBe('Odstęp strzałów');
        } finally {
            replacement.restore();
        }
    });

    it('moves zero-maximum roles last using current edits even when filters hide Num', () => {
        const document = parseCfgDocument('[Roles]\n' +
            'Num TownOfUs.Roles.Crewmate.SheriffRole = 0\nChance TownOfUs.Roles.Crewmate.SheriffRole = 51\n' +
            'Num TownOfUs.Roles.Crewmate.MedicRole = 2\nChance TownOfUs.Roles.Crewmate.MedicRole = 0\n' +
            'Num TownOfUs.Roles.Crewmate.VeteranRole = 0\nChance TownOfUs.Roles.Crewmate.VeteranRole = 10\n' +
            'Num TownOfUs.Roles.Crewmate.SentryRole = 1\nChance TownOfUs.Roles.Crewmate.SentryRole = 10\n');
        const fields = document.fields.map(resolveEditorField);
        const groups = fields.filter(field => field.key.startsWith('Chance ')).map(field => [field]);
        expect(sortRoleGroups(groups, fields, {}).map(group => group[0].groupName)).toEqual(['Medic', 'Sentry', 'Sheriff', 'Veteran']);
        const changes = { [fields[0].id]: '1', [fields[2].id]: '0' };
        expect(sortRoleGroups(groups, fields, changes).map(group => group[0].groupName)).toEqual(['Sheriff', 'Sentry', 'Medic', 'Veteran']);
        expect(groups.map(group => group[0].groupName)).toEqual(['Sheriff', 'Medic', 'Veteran', 'Sentry']);
    });

    it('hides HnS role odds, modifier sections and embedded options while preserving their export', () => {
        const content = prefix +
            'Chance TownOfUs.Roles.HideAndSeek.Hider.HnsMysticRole = 0\n' +
            '[TownOfUs.Options.Modifiers.HnsCrewmateModifierOptions]\nFrostyChance = 10\n' +
            '[TownOfUs.Options.Roles.Crewmate.MysticOptions]\nMysticHnsPopUp = false\nMysticArrow = true\n';
        const document = parseCfgDocument(content);
        const visible = document.fields.filter(field => !isHnsField(field));
        expect(visible.map(field => field.key)).toEqual([
            'Num TownOfUs.Roles.Crewmate.SheriffRole',
            'Chance TownOfUs.Roles.Crewmate.SheriffRole',
            'MysticArrow',
        ]);
        const arrow = visible.at(-1)!;
        expect(exportCfgDocument(document, { [arrow.id]: 'false' })).toBe(content.replace('MysticArrow = true', 'MysticArrow = false'));
        const reference = parseCfgDocument(readFileSync('public/settings/mira.cfg', 'utf8'));
        expect(reference.fields.filter(isHnsField).length).toBeGreaterThan(20);
    });

    it('keeps disabled roles and uses exact generated role keys regardless of entry order', () => {
        const document = parseCfgDocument(prefix + '[TownOfUs.Options.Roles.Crewmate.SheriffOptions]\nSheriffBodyReport = true\nKillCooldown = 25\n');
        const fields = document.fields.map(resolveEditorField);
        expect(fields[0]).toMatchObject({ label: 'Maksymalna liczba', category: 'roles' });
        expect(fields[1]).toMatchObject({ label: 'Szansa wystąpienia', unit: '%' });
        expect(fields[2].label).toBe('Can Self Report');
        expect(fields[3].label).toBe('Kill Cooldown');
        expect(new Set(fields.map(field => field.groupId)).size).toBe(1);
    });

    it('anchors global/modifier labels to the reference keys instead of imported order', () => {
        const reference = parseCfgDocument(readFileSync('public/settings/mira.cfg', 'utf8'));
        const original = reference.fields.filter(field => field.section === 'TownOfUs.Options.Modifiers.Crewmate.BaitOptions');
        const reversed = parseCfgDocument(prefix + `[${original[0].section}]\n` + [...original].reverse().map(field => `${field.key} = ${field.value}`).join('\n'));
        for (const field of reversed.fields.filter(field => field.section === original[0].section)) {
            const expected = resolveEditorField(original.find(entry => entry.key === field.key)!);
            expect(resolveEditorField(field).label).toBe(expected.label);
            expect(resolveEditorField(field).mapped).toBe(true);
        }
    });

    it('preserves unrecognized keys and isolates HideAndSeek', () => {
        const document = parseCfgDocument(prefix + '[TownOfUs.Options.Roles.Crewmate.SheriffOptions]\nNewOption = 4\n[TownOfUs.Options.Roles.HideAndSeek.HnsSheriffOptions]\nKillCooldown = 5\n');
        const fields = document.fields.map(resolveEditorField);
        expect(fields[2]).toMatchObject({ key: 'NewOption', label: 'New Option', mapped: false });
        expect(fields[3]).toMatchObject({ category: 'advanced', key: 'KillCooldown' });
    });

    it('sanitizes only the download file name', () => {
        expect(safeCfgFileName('../MIRA7.cfg')).toBe('..MIRA7.cfg');
        expect(safeCfgFileName('moje ustawienia.CFG')).toBe('moje ustawienia.cfg');
        expect(safeCfgFileName('')).toBe('moje-ustawienia.cfg');
    });
});
