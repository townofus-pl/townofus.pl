import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraSonarAbilities = {
    Track: {
        name: 'Track (Śledź)',
        icon: '/images/mira/abilities/TrackButton.png',
    },
};

export const MiraSonar: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Investigative,
    name: 'Sonar',
    id: 'mira_sonar',
    color: '#4ECF88',
    team: Teams.Crewmate,
    icon: '/images/mira/roles/Sonar.png',
    description: 'Sonar może oznaczać graczy i śledzić ich pozycję za pomocą strzałek aktualizowanych w interwałach, co pomaga wykrywać podejrzane ruchy.',
    settings: {
        ...probabilityOfAppearing(0),
        'Track Cooldown': {
            value: 20,
            type: SettingTypes.Time,
        },
        'Max Number Of Tracks': {
            value: 5,
            type: SettingTypes.Number,
        },
        'Arrow Update Interval': {
            value: 5,
            type: SettingTypes.Time,
        },
        'Sonar Arrows Make Sound On Death': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Sonar Arrows Reset After Each Round': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Get More Uses From Completing Tasks': {
            value: false,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraSonarAbilities.Track],
    tip: 'Nie oznaczaj wszystkich naraz, bo szybko stracisz czytelność; śledź głównie najbardziej podejrzane cele lub graczy zagrożonych śmiercią.',
};
