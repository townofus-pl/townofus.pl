import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import {MiraCommonAbilities} from '../abilities';

export const MiraWarlock: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Killing,
    name: 'Warlock',
    id: 'mira_warlock',
    color: '#FF1919',
    team: Teams.Impostor,
    icon: '/images/mira/roles/Warlock.png',
    description: 'Warlock może naładować ataki i po pełnym naładowaniu wykonywać wielokrotne zabójstwa przez określony czas. W czasie rozgrywki, Warlockowi ładuje się mana. Manę mierzy się w procentach. W pełni naładowana mana (100%) pozwala na zabijanie bez cooldownu przez określony czas. W przypadku gdy mana nie jest naładowana do pełna, czas na nieograniczone zabijanie jest proporcjonalnie mniejszy.',
    settings: {
        ...probabilityOfAppearing(0),
        'Times it Takes to Fully Charge': {
            value: 25,
            type: SettingTypes.Time,
        },
        'time Multiplier Added Per Kill for Next Charge': {
            value: 0.05,
            type: SettingTypes.Multiplier,
        },
        'Times it Takes to Use a Full Charge': {
            value: 1,
            type: SettingTypes.Time,
        },
    },
    abilities: [MiraCommonAbilities.Kill, MiraCommonAbilities.Vent],
};
