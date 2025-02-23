import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const HunterAbilities = {
    Stalk: {
        "name": "Stalk (Śledź)",
        "icon": "/images/abilities/stalk.png"
    }
};

export const Hunter: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Hunter",
    "id": "hunter",
	"color": "#29AA88",
    "team": Teams.Crewmate,
    "icon": "/images/roles/hunter.png",
    "description": "Crewmate, który posiada umiejętność zabijania. Hunter może śledzić graczy i eliminować ich, jeśli zrobią coś podejrzanego. W przeciwieństwie do Sheriffa, Hunter nie umiera po zabiciu niewinnego gracza, jednak może wykonywać egzekucje tylko na graczach, którzy dali mu uzasadnione powody do podejrzeń.",
    "settings": {
        ...probabilityOfAppearing(-1),
        "Hunter Kill Cooldown": {
            value: 25,
            type: SettingTypes.Time,
        },
        "Hunter Stalk Cooldown": {
            value: 10,
            type: SettingTypes.Time,
        },
        "Hunter Stalk Duration": {
            value: 25,
            type: SettingTypes.Time,
        },
        "Maximum Stalk Uses": {
            value: 5,
            type: SettingTypes.Number,
        },
        "Hunter Kills Last Voter If Voted Out": {
            value: false,
            type: SettingTypes.Boolean,
        },
        "Hunter Can Report Who They've Killed": {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    "abilities": [CommonAbilities.Kill, HunterAbilities.Stalk],
};
