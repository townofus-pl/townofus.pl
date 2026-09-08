import { SettingTypes, type Setting } from '@/constants/settings';
import type { MiraSettingGroup } from './types';

export const MiraHostSpecificOptions = {
    name: 'Host Specific Options',
    id: 'mira_host_specific',
    cfgKey: 'HostSpecific',
    settings: {
        'Enable Anti Cheat Warnings': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Kick Players Using Cheat Mods': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Freeplay Mode': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Allow Lobby-Only No-Clip': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Show Rules to Players on Lobby Join': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Allow Spectators': {
            value: false,
            type: SettingTypes.Boolean,
        },
    } as Record<string, Setting>,
} satisfies MiraSettingGroup;
