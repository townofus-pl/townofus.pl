import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import {MiraCommonAbilities} from '../abilities';

export const MiraAmbassadorAbilities = {
    Retrain: {
        name: 'Retrain (Przeszkol)',
        icon: '/images/mira/abilities/RetrainClean.png',
    },
};

export const MiraAmbassador: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Power,
    name: 'Ambassador',
    id: 'mira_ambassador',
    color: '#FF1919',
    team: Teams.Impostor,
    icon: '/images/mira/roles/Ambassador.png',
    description: 'Ambassador podczas spotkania wybiera siebie lub innego Impostora do przeszkolenia, a zmiana roli następuje na początku następnej rundy. Role Concealing i Support mogą zmieniać się w inne dostępne role z tych dwóch kategorii, a role Killing i Power mogą zmieniać się w dostępne role Impostorów poza kategorią Power. Ambassador lub wybrany gracz musi mieć wymaganą w ustawieniach liczbę zabójstw. Dostępność przeszkolenia zależy też od numeru rundy, limitu użyć i przerwy między przeszkoleniami. Każdego gracza można przeszkolić tylko raz. Zależnie od ustawień gracz musi zaakceptować proponowaną zmianę.',
    settings: {
        ...probabilityOfAppearing(0),
        'Max Retrains Available': {
            value: 2,
            type: SettingTypes.Number,
        },
        'Retrain Requires Confirmation': {
            value: true,
            type: SettingTypes.Boolean,
        },
        'Kills Needed By Ambassador Or Teammate To Retrain': {
            value: 2,
            type: SettingTypes.Number,
        },
        'Round In Which Retraining Is Possible': {
            value: 2,
            type: SettingTypes.Number,
        },
        'Rounds Needed To Retrain Again': {
            value: 2,
            type: SettingTypes.Number,
        },
    },
    abilities: [MiraCommonAbilities.Kill, MiraCommonAbilities.Vent, MiraAmbassadorAbilities.Retrain],
};
