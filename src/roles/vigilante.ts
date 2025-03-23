import { Role, RoleOrModifierTypes } from "@/constants/rolesAndModifiers";
import { Teams } from "@/constants/teams";
import { probabilityOfAppearing, SettingTypes } from "@/constants/settings";

export const VigilanteAbilities = {
    Guess: {
        "name": "Guess (Zgadnij)",
        "icon": "/images/abilities/guess.png"
    },
};

export const Vigilante: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Vigilante",
    "id": "vigilante",
    "color": "#FFFF99",
    "team": Teams.Crewmate,
    "icon": "/images/roles/vigilante.png",
    "description": "Crewmate, który może zabijać podczas spotkań. Podczas spotkania, Vigilante może wybrać, kogo zabić, zgadując jego rolę. Jeśli jednak zgadnie źle, to sam ginie.",
    "settings": {
        ...probabilityOfAppearing(0),
        "Number Of Vigilante Kills": {
            value: 1,
            type: SettingTypes.Number,
        },
        "Vigilante Can Kill More Than Once Per Meeting": {
            value: false,
            type: SettingTypes.Boolean,
        },
        "Vigilante Can Guess Neutral Benign Roles": {
            value: false,
            type: SettingTypes.Boolean,
        },
        "Vigilante Can Guess Neutral Evil Roles": {
            value: false,
            type: SettingTypes.Boolean,
        },
        "Vigilante Can Guess Neutral Killing Roles": {
            value: false,
            type: SettingTypes.Boolean,
        },
        "Vigilante Can Guess Impostor Modifiers": {
            value: false,
            type: SettingTypes.Boolean,
        },
        "Vigilante Can Guess Lovers": {
            value: false,
            type: SettingTypes.Boolean,
        },
    },
    "abilities": [VigilanteAbilities.Guess],
};
