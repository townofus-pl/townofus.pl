import { SettingTypes, type Setting } from '@/constants/settings';
import type { MiraSettingGroup } from './types';

export const MiraPostmortemOptions = {
    name: 'Postmortem Options',
    id: 'mira_postmortem',
    cfgKey: 'Postmortem',
    settings: {
        'The Dead Know Players': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'The Dead See Votes': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'The Dead See Private Chat': {
            value: 1,
            type: SettingTypes.Number,
            description: {
                0: 'Disabled',
                1: 'Disabled Upon Death',
                2: 'In Meetings',
                3: 'Always',
            }
        },
        'Haunt (Follow) Mode': {
            value: 1,
            type: SettingTypes.Number,
            description: {
                0: 'Disabled',
                1: 'Disabled Upon Death',
                2: 'Always',          
            }
        },
        'Temporarily Hide Chat Upon Death': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'See Task Trackers When Dead': {
            value: true,
            type: SettingTypes.Boolean,
        },
    } as Record<string, Setting>,
} satisfies MiraSettingGroup;
