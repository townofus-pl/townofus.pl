import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraSeerAbilities = {
    Intuit: {
        name: 'Intuit (Wyczuj)',
        icon: '/images/mira/abilities/IntuitButton.png',
    },
    Gaze: {
        name: 'Gaze (Spojrzenie)',
        icon: '/images/mira/abilities/GazeButton.png',
    },
    Reveal: {
        name: 'Reveal (Ujawnij)',
        icon: '/images/mira/abilities/SeerButton.png',
    },
};

export const MiraSeer: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Investigative,
    name: 'Seer',
    id: 'mira_seer',
    color: '#FFCC80',
    team: Teams.Crewmate,
    icon: '/images/mira/roles/Seer.png',
    description: 'Seer potrafi porównywać graczy i wykrywać, czy dwóch graczy należy do jednego sojuszu, używając zdolności Intuit, Gaze. Jeżeli odpowiednia opcja jest wyłączona, Seer ma zdolność Reveal po użyciu której, nick sprawdzanego gracza zmienia kolor na Zielony lub Czerwony. Znaczenie tych kolorów jest zależne od ustawień, z tym że nicki impostorów zawsze są czerwone.',
    settings: {
        ...probabilityOfAppearing(0),
        'Compare Players Instead of Checking Alignments': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Reveal / Compare Cooldown': {
            value: 20,
            type: SettingTypes.Time,
        },
        'Max Uses of Reveal / Compare': {
            value: 5,
            type: SettingTypes.Number,
        },
        'Neutral Benigns Shows Friends to All': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Neutral Evils Shows Friends to All': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Neutral Outliers Shows Friends to All': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Crewmate Killing Roles are Red': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Neutral Benign Roles Are Red': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Neutral Evil Roles Are Red': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Neutral Killing Roles Are Red': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Neutral Outlier Roles Are Red': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Traitor Swaps Colors': {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraSeerAbilities.Intuit, MiraSeerAbilities.Gaze, MiraSeerAbilities.Reveal],
    tip: 'Wykorzystuj porównania sojuszy do szybkiego zawężania podejrzanych i budowania wiarygodnych informacji dla drużyny.',
};
