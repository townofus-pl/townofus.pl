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
    description: 'Oracle może użyć Confess na wybranym graczu. Na następnym spotkaniu otrzymuje trzy nicki, w tym nick sprawdzonego gracza, jako wskazówkę dotyczącą możliwych złych. Jeśli Oracle umrze przed spotkaniem, frakcja sprawdzonego gracza zostaje ujawniona wszystkim, z dokładnością zależną od ustawień. Oracle może też błogosławić graczy, chroniąc ich przed zgadywaniem i wyrzuceniem podczas spotkań.',
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
        'Neutral Evils Show Up As Evil': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Neutral Killers Show Up As Evil': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Neutral Outliers Show Up As Evil': {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraOracleAbilities.Bless, MiraOracleAbilities.Confess],
};
