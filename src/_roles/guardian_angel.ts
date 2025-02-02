import {
    probabilityOfAppearing,
    RoleSettingTypes,
    Teams,
    type Role,
    RolesAfterDeath,
} from "./shared";

export const GuardianAngelAbilities = {
    Protect: {
        "name": "Protect (Ochroń)",
        "icon": "/images/abilities/protect.png"
    }
};

export const GuardianAngel: Role = {
    "name": "Guardian Angel",
    "color": "#B3FFFF",
    "team": Teams.Neutral,
    "icon": "/images/roles/guardian_angel.png",
    "description": "Neutralna rola, która sprzymierza się z drużyną swojego celu. Jego zadaniem jest chronić cel za wszelką cenę. Jeśli jego cel przegra, on również przegrywa.",
    "settings": {
        ...probabilityOfAppearing(-1),
        "Protect Cooldown": {
            value: 25,
            type: RoleSettingTypes.Time,
        },
        "Protect Duration": {
            value: 10,
            type: RoleSettingTypes.Time,
        },
        "Kill Cooldown Reset When Protected": {
            value: 2.5,
            type: RoleSettingTypes.Time,
        },
        "Maximum Number Of Protects": {
            value: 5,
            type: RoleSettingTypes.Number,
        },
        "Show Protected Player": {
            value: 1,
            type: RoleSettingTypes.Boolean,
        },
        "Becomes On Target Dead": {
            value: RolesAfterDeath.Amnesiac,
            type: RoleSettingTypes.RoleAfterDeath,
        },
        "Target Knows GA Exists": {
            value: 0,
            type: RoleSettingTypes.Boolean,
        },
        "GA Knows Targets Role": {
            value: 1,
            type: RoleSettingTypes.Boolean,
        },
        "Odds Of Target Being Evil": {
            value: 50,
            type: RoleSettingTypes.Percentage,
        },
    },
    "abilities": [GuardianAngelAbilities.Protect],
    "tip": "Spraw aby twój cel dowiedział się że jesteś jego sprzymierzeńcem."
}
