import { SettingTypes, type Setting } from '@/constants/settings';
import type { MiraSettingGroup } from './types';

export const MiraCrewmateSettings = {
    name: 'Crewmate Settings',
    id: 'mira_crewmate_settings',
    cfgKey: 'RoleDraftCrew',
    settings: {
        'Max Investigative Roles': {
            value: 5,
            type: SettingTypes.Number,
        },
        'Max Killing Roles': {
            value: 3,
            type: SettingTypes.Number,
        },
        'Max Power Roles': {
            value: 2,
            type: SettingTypes.Number,
        },
        'Max Protective Roles': {
            value: 2,
            type: SettingTypes.Number,
        },
        'Max Support Roles': {
            value: 3,
            type: SettingTypes.Number,
        },
    } as Record<string, Setting>,
} satisfies MiraSettingGroup;
