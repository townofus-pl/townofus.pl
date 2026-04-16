import {Role, RoleOrModifierTypes} from '@/constants/rolesAndModifiers';
import {ModSource} from '@/constants/modSources';
import {RoleSubgroups} from '@/constants/roleSubgroups';
import {Teams} from '@/constants/teams';
import {probabilityOfAppearing, SettingTypes} from '@/constants/settings';

export const MiraPoliticianAbilities = {
    Campaign: {
        name: 'Campaign (Prowadź kampanię)',
        icon: '/images/mira/abilities/CampaignButton.png',
    },
    Reveal: {
        name: 'Reveal (Ujawnij)',
        icon: '/images/mira/abilities/RevealClean.png',
    },
};

export const MiraPolitician: Role = {
    type: RoleOrModifierTypes.Role,
    source: ModSource.Mira,
    subgroup: RoleSubgroups.Power,
    name: 'Politician',
    id: 'mira_politician',
    color: '#660099',
    team: Teams.Crewmate,
    icon: '/images/mira/roles/Politician.png',
    description: "Politician musi skutecznie prowadzić kampanię pośród przynajmniej połowy Crewmate'ów, aby ujawnić się jako Mayor.",
    settings: {
        ...probabilityOfAppearing(0),
        'Campaign Cooldown': {
            value: 25,
            type: SettingTypes.Time,
        },
        'Prevent Campaigning on Failed Reveal': {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [MiraPoliticianAbilities.Campaign, MiraPoliticianAbilities.Reveal],
};
