import { Role, RoleOrModifierTypes } from "@/constants/rolesAndModifiers";
import { Teams } from "@/constants/teams";
import { SettingTypes } from "@/constants/settings";
import { CommonAbilities } from "@/constants/abilities";

export const ImpostorSettings: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Impostor Settings",
    "id": "impostor_settings",
    "color": "#808080",
    "team": Teams.Impostor,
    "icon": "/images/roles/placeholder.png", //ten sam obrazek
    "description": "Ustawienia impostorów.",
    "settings": {
        "Number Of Impostor Assassins": {
            value: 4,
            type: SettingTypes.Number,
        },
        "Number Of Neutral Assassins": {
            value: 5,
            type: SettingTypes.Number,
        },
        "Amnesiac Turned Impostor Gets Ability": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Amnesiac Turned Neutral Killing Gets Ability": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Traitor Gets Ability": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Number Of Assassin Kills": {
            value: 15,
            type: SettingTypes.Number,
        },
        "Assassin Can Kill More Than Once Per Meeting": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Assassin Can Guess Neutral Benign Roles": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Assassin Can Guess Neutral Evil Roles": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Assassin Can Guess Neutral Killing Roles": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Assassin Can Guess Impostor Roles": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Assassin Can Guess Crewmate Modifiers": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Assassin Can Guess Lovers": {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    "abilities": [CommonAbilities.None],
};
