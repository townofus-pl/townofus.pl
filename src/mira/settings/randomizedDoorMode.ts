import { SettingTypes, type Setting } from '@/constants/settings';
import type { MiraSettingGroup } from './types';

export const MiraRandomizedDoorMode = {
    name: 'Randomized Door Mode',
    id: 'mira_randomized_door_mode',
    cfgKey: 'RandomDoorMap',
    settings: {
        'No Doors Chance': {
            value: 5,
            type: SettingTypes.Percentage,
        },
        'Skeld Door Chance': {
            value: 20,
            type: SettingTypes.Percentage,
        },
        'Polus Door Chance': {
            value: 40,
            type: SettingTypes.Percentage,
        },
        'Airship Door Chance': {
            value: 15,
            type: SettingTypes.Percentage,
        },
        'Fungle Door Chance': {
            value: 20,
            type: SettingTypes.Percentage,
        },
        'Submerged Door Chance': {
            value: 25,
            type: SettingTypes.Percentage,
        },
    } as Record<string, Setting>,
} satisfies MiraSettingGroup;
