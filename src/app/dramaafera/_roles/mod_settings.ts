import { Role, RoleOrModifierTypes } from "@/constants/rolesAndModifiers";
import { Teams } from "@/constants/teams";
import { SettingTypes } from "@/constants/settings";
import { CommonAbilities } from "@/constants/abilities";

export const ModSettings: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Mod Settings",
    "id": "mod_settings",
    "color": "#808080",
    "team": Teams.All,
    "icon": "/images/roles/placeholder.png", //ten sam obrazek
    "description": "Ustawienia modyfikacji.",
    "settings": {
        "All Roles Are Unique": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Better Polus Vent Layout": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Vitals Moved To Lab": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Cold Temp Moved To Death Valley": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Reboot Wifi And Chart Course Swapped": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Camouflaged Comms": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Kill Anyone During Camouflaged Comms": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Impostors Can See The Roles Of Their Team": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Dead Can See Everyone's Roles/Votes": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Game Start Cooldowns": {
            value: 10,
            type: SettingTypes.Time,
        },
        "Temp Save Cooldown Reset": {
            value: 5,
            type: SettingTypes.Time,
        },
        "Parallel Medbay Scans": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Disable Meeting Skip Button": {
            value: 0,
            type: SettingTypes.Number,
            description: {
                0: "No",
                1: "Emergency",
                2: "Always"
            }
        },
        "First Death Shield Next Game": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Crew Killers Continue Game": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "See Tasks During Round": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "See Tasks During Meetings": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "See Tasks When Dead": {
            value: true,
            type: SettingTypes.Boolean,
        }
    },
    "abilities": [CommonAbilities.None],
};
