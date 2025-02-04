import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, RolesAfterDeath, SettingTypes} from "@/constants/settings";

export const GuardianAngelAbilities = {
    Protect: {
        "name": "Protect (Ochroń)",
        "icon": "/images/abilities/protect.png"
    }
};

export const GuardianAngel: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Guardian Angel",
    "color": "#B3FFFF",
    "team": Teams.Neutral,
    "icon": "/images/roles/guardian_angel.png",
    "description": "Neutralna rola, która sprzymierza się z drużyną swojego celu. Jego zadaniem jest chronić cel za wszelką cenę. Jeśli jego cel przegra, on również przegrywa.",
    "settings": {
        ...probabilityOfAppearing(-1),
        "Protect Cooldown": {
            value: 25,
            type: SettingTypes.Time,
        },
        "Protect Duration": {
            value: 10,
            type: SettingTypes.Time,
        },
        "Kill Cooldown Reset When Protected": {
            value: 2.5,
            type: SettingTypes.Time,
        },
        "Maximum Number Of Protects": {
            value: 5,
            type: SettingTypes.Number,
        },
        "Show Protected Player": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Becomes On Target Dead": {
            value: RolesAfterDeath.Amnesiac,
            type: SettingTypes.Text,
        },
        "Target Knows GA Exists": {
            value: false,
            type: SettingTypes.Boolean,
        },
        "GA Knows Targets Role": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Odds Of Target Being Evil": {
            value: 50,
            type: SettingTypes.Percentage,
        },
    },
    "abilities": [GuardianAngelAbilities.Protect],
    "tip": "Spraw aby twój cel dowiedział się że jesteś jego sprzymierzeńcem."
}
