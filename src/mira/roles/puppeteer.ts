import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraPuppeteerAbilities = {
    Control: {
        name: 'Control (Kontroluj)',
        icon: '/images/mira/abilities/ControlButton.png',
    },
};

export const MiraPuppeteer: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Power,
    name: 'Puppeteer',
    id: 'mira_puppeteer',
    color: '#FF1919',
    team: Teams.Impostor,
    icon: '/images/mira/roles/Puppeteer.png',
    description: 'Puppeteer może przejąć kontrolę nad innym graczem i zmusić go do wykonania zabójstwa. Podczas kontroli sam pozostaje w miejscu.',
    settings: {
        ...probabilityOfAppearing(0),
        'Initial Control Uses': {
            value: 3,
            type: SettingTypes.Number,
        },
        'Kills Required for Additional Control Use': {
            value: 2,
            type: SettingTypes.Number,
        },
        'Puppeteer Location Hint Duration (For Victim)': {
            value: 3,
            type: SettingTypes.Time,
        },
        'Control Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Control Duration': {
            value: 10,
            type: SettingTypes.Time,
        },
        'Puppeteer Can Vent': {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraPuppeteerAbilities.Control],
};
