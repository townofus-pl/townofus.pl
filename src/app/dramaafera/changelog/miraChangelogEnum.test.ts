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

describe('changelog with global text options (outside role sections)', () => {
    const skeld = (value: string) =>
        `[Roles]\n\n[TownOfUs.Options.Maps.BetterSkeldOptions]\nMapTheme = ${value}\n`;
    const roleList = (value: string) =>
        `[Roles]\n\n[TownOfUs.Options.RoleOptions]\nRoleAssignmentType = ${value}\n`;
    const reveal = (value: string) =>
        `[Roles]\n\n[TownOfUs.Options.InitialRoundOptions]\nModifierReveal = ${value}\n`;
    const diff = (make: (v: string) => string, old: string, current: string) =>
        renderToStaticMarkup(createElement(MiraChangelog, { current: make(current), old: make(old) }));

    it('shows no change between the old number and the new name', () => {
        expect(diff(skeld, '0', 'Auto')).toContain('Brak zmian');
        expect(diff(roleList, '1', 'RoleList')).toContain('Brak zmian');
        expect(diff(reveal, '1', 'Universal')).toContain('Brak zmian');
    });

    it('shows a real change with the labels from the source', () => {
        const html = diff(roleList, '3', 'RoleList');
        expect(html).not.toContain('Brak zmian');
        expect(html).toContain('Role Assignment Type');
        expect(html).toContain('Draft');
        expect(html).toContain('Role List');
        expect(html).not.toContain('NaN');
    });
});

describe('changelog matches global options by key, not by position', () => {
    // 1.7.3 had no PlayerCountWhenSabotagesDisable. Beta2 put it before the next key, so a match by
    // position gave the wrong label to every value after it.
    const oldCfg = `[Roles]\n\n[TownOfUs.Options.GameMechanicOptions]\nPlayerCountWhenVentsDisable = 2\nCanSabotageWhenDead = false\n`;
    const newCfg = `[Roles]\n\n[TownOfUs.Options.GameMechanicOptions]\nPlayerCountWhenSabotagesDisable = 3\nPlayerCountWhenVentsDisable = 2\nCanSabotageWhenDead = false\n`;

    it('shows no change when only a new key moved the others', () => {
        // A key that exists in one file only is not listed, so the right result is "no changes".
        const html = renderToStaticMarkup(createElement(MiraChangelog, { current: newCfg, old: oldCfg }));
        expect(html).toContain('Brak zmian');
    });
});

describe('changelog matches role options by key, not by position', () => {
    // Beta2 added PortableCamsRechargePerTask before InitialCameras. A match by position showed
    // "Initial Cameras: 2 -> 100" for two files with the same values.
    const oldCfg = `[Roles]\n\n[TownOfUs.Options.Roles.Crewmate.SentryOptions]\nPortableCamsBattery = 100\nInitialCameras = 2\nBlindspot1Room = 28\n`;
    const newCfg = `[Roles]\n\n[TownOfUs.Options.Roles.Crewmate.SentryOptions]\nPortableCamsBattery = 100\nPortableCamsRechargePerTask = 10\nInitialCameras = 2\nBlindspot1Room = Specimens\n`;

    it('shows no change when the values are the same', () => {
        const html = renderToStaticMarkup(createElement(MiraChangelog, { current: newCfg, old: oldCfg }));
        expect(html).toContain('Brak zmian');
    });

    it('shows a real change with the label of the right key', () => {
        const html = renderToStaticMarkup(createElement(MiraChangelog, { current: newCfg.replace('InitialCameras = 2', 'InitialCameras = 4'), old: oldCfg }));
        expect(html).toContain('Initial');
        expect(html.match(/<li /g)?.length).toBe(1);
    });
});
