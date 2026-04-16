import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraSpectreAbilities = {
    Spook: {
        name: 'Spook (Nawiedź)',
        icon: '/images/mira/abilities/PhantomSpookButton.png',
    },
};

export const MiraSpectre: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Afterlife,
    name: 'Spectre',
    id: 'mira_spectre',
    color: '#662961',
    team: Teams.Neutral,
    icon: '/images/mira/roles/Spectre.png',
    description: 'Po śmierci roli neutralnej gracz może odrodzić się jako Spectre i wygrać przez ukończenie zadań bez złapania. Jeżeli ustawiono odpowiednią opcję: Po wygranej Spectre może zabić wybranego gracza.',
    settings: {
        ...probabilityOfAppearing(0),
        'Tasks Left Before Clickable': {
            value: 3,
            type: SettingTypes.Number,
        },
        'Spectre Win': {
            value: 'Nothing',
            type: SettingTypes.Text,
            description: {
                0: 'Nothing',
                1: 'Ends Game',
            },
        },
    },
    abilities: [MiraSpectreAbilities.Spook],
};

