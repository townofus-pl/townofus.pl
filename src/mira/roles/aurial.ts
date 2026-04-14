import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';
import {MiraCommonAbilities} from '@/mira/abilities';

export const MiraAurial: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Investigative,
    name: 'Aurial',
    id: 'mira_aurial',
    color: '#B34D99',
    team: Teams.Crewmate,
    icon: '/images/mira/roles/Aurial.png',
    description: 'Aurial wyczuwa zakłócenia w aurze. Gdy ktoś w pobliżu użyje dowolnej zdolności, Aurial widzi strzałkę wskazującą miejsce użycia. Jeśli zdolność została użyta w zasięgu aury Auriala, strzałka przyjmuje kolor gracza i może ujawnić jego tożsamość. Jeśli zdolność została użyta dalej, Aurial widzi białą strzałkę.',
    settings: {
        ...probabilityOfAppearing(0),
        'Radiate Colour Range': {
            value: 0.5,
            type: SettingTypes.Multiplier,
        },
        'Max Radiate Range': {
            value: 1.5,
            type: SettingTypes.Multiplier,
        },
        'Sense Duration': {
            value: 10,
            type: SettingTypes.Time,
        },
    },
    abilities: [MiraCommonAbilities.None],
    tip: 'Najwięcej zyskasz, gdy trzymasz się blisko grupy graczy, bo łatwiej wtedy wychwycić częste użycia zdolności i rozróżnić typy zabójstw.',
};
