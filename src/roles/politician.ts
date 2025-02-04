import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";

export const PoliticianAbilities = {
    Campaign: {
        "name": "Campaign (Prowadź kampanię)",
        "icon": "/images/abilities/campaign.png"
    },
    Reveal: {
        "name": "Reveal (Ujawnij się jako Mayor) *Na spotkaniu*",
        "icon": "/images/abilities/reveal.png"
    },
};

export const Politician: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Politician",
    "color": "#660099",
    "team": Teams.Crewmate,
    "icon": "/images/roles/politician.png",
    "description": "Crewmate, który może prowadzić kampanię wśród innych graczy. Gdy co najmniej połowa Crewmate’ów zostanie przekonana, Politician może ujawnić się jako nowy Mayor. Jeśli jednak mniej niż połowa Crewmate’ów zostanie przekonana, ujawnienie się nie powiedzie, a Politician nie będzie mógł prowadzić kampanii przez 1 rundę. <br>Głos Mayora liczy się potrójnie",
    "settings": {
        ...probabilityOfAppearing(-1),
        "Campaign Cooldown": {
            value: 25,
            type: SettingTypes.Time,
        },
    },
    "abilities": [PoliticianAbilities.Campaign, PoliticianAbilities.Reveal],
};
