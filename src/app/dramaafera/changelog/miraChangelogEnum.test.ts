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

describe('changelog with Sentry rooms and enums without labels', () => {
    const sentry = (value: string) =>
        `[Roles]\n\n[TownOfUs.Options.Roles.Crewmate.SentryOptions]\nBlindspot1Room = ${value}\n`;
    const amnesiac = (value: string) =>
        `[Roles]\n\n[TownOfUs.Options.Roles.Neutral.AmnesiacOptions]\nAmneTurnNeutAssassin = ${value}\n`;
    const lookout = (value: string) =>
        `[Roles]\n\n[TownOfUs.Options.Roles.Crewmate.LookoutOptions]\nWatchType = ${value}\n`;
    const diff = (make: (v: string) => string, old: string, current: string) =>
        renderToStaticMarkup(createElement(MiraChangelog, { current: make(current), old: make(old) }));

    it('shows no change between a room number and its name', () => {
        expect(diff(sentry, '28', 'Specimens')).toContain('Brak zmian');
        expect(diff(amnesiac, '2', 'Always')).toContain('Brak zmian');
    });

    it('shows a real room change with names, not numbers', () => {
        const html = diff(sentry, '28', 'Outside');
        expect(html).toContain('Specimens');
        expect(html).toContain('Outside');
    });

    it('shows member names for an enum with no label', () => {
        const html = diff(lookout, 'Players', 'Roles');
        expect(html).toContain('Players');
        expect(html).toContain('Roles');
        expect(html).not.toContain('NaN');
    });
});
