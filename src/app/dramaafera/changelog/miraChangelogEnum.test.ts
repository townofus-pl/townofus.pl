import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MiraChangelog } from './_components/MiraChangelog';

const cfg = (value: string) =>
    `[Roles]\n\n[TownOfUs.Options.Roles.Crewmate.AltruistOptions]\nReviveMode = ${value}\n`;
const render = (old: string, current: string) =>
    renderToStaticMarkup(createElement(MiraChangelog, { current: cfg(current), old: cfg(old) }));

describe('changelog with text options', () => {
    it('shows no change for the old number and the new name of the same option', () => {
        expect(render('2', 'GroupRevive')).toContain('Brak zmian');
        expect(render('GroupRevive', '2')).toContain('Brak zmian');
        expect(render('GroupRevive', 'GroupRevive')).toContain('Brak zmian');
    });

    it('shows a change with both labels when the option really changes', () => {
        const html = render('Sacrifice', 'GroupRevive');
        expect(html).not.toContain('Brak zmian');
        expect(html).toContain('Sacrifice');
        expect(html).toContain('Group Revive');
        expect(html).not.toContain('NaN');
    });
});
