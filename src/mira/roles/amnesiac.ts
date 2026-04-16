import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraAmnesiacAbilities = {
    Remember: {
        name: 'Remember (Przypomnij sobie)',
        icon: '/images/mira/abilities/RememberButton.png',
    },
};

export const MiraAmnesiac: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Benign,
    name: 'Amnesiac',
    id: 'mira_amnesiac',
    color: '#80B3FF',
    team: Teams.Neutral,
    icon: '/images/mira/roles/Amnesiac.png',
    description: 'Amnesiac nie ma warunku zwycięstwa. Nie ma żadnych zadań i jest praktycznie bez roli. Jednak może sobie przypomnieć rolę, odnajdując martwego gracza. Gdy to zrobi, przejmuje nowy warunek zwycięstwa i dąży do wygranej. Dostaje strzałki wskazujące martwe ciała.',
    settings: {
        ...probabilityOfAppearing(0),
        'Show Arrow Pointing to Dead Bodies': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Time After Death Arrow Appears': {
            value: 5,
            type: SettingTypes.Time,
        },
    },
    abilities: [MiraAmnesiacAbilities.Remember],
};

