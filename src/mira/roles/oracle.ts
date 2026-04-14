import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraOracleAbilities = {
    Bless: {
        name: 'Bless (Błogosław)',
        icon: '/images/mira/abilities/BlessButton.png',
    },
    Confess: {
        name: 'Confess (Wyspowiadaj)',
        icon: '/images/mira/abilities/ConfessButton.png',
    },
};

export const MiraOracle: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Protective,
    name: 'Oracle',
    id: 'mira_oracle',
    color: '#BF00BF',
    team: Teams.Crewmate,
    icon: '/images/mira/roles/Oracle.png',
    description: 'Oracle może zmuszać graczy do wyznania informacji i później korzystać z ich wyznania, aby wskazać możliwych złych. Może też błogosławić graczy podczas spotkań, chroniąc ich przed zgadywaniem i wyrzuceniem.',
    settings: {
        ...probabilityOfAppearing(0),
        'Confess Cooldown': {
            value: 20,
            type: SettingTypes.Time,
        },
        'Bless Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Reveal Accuracy': {
            value: 80,
            type: SettingTypes.Percentage,
        },
        'Neutral Benign Show Up As Evil': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Neutral Evil Show Up As Evil': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Neutral Killing Show Up As Evil': {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraOracleAbilities.Bless, MiraOracleAbilities.Confess],
};
