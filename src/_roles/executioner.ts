import {
    CommonRoleAbilities,
    probabilityOfAppearing,
    type Role,
    RolesAfterDeath,
    RoleSettingTypes,
    Teams,
} from "./shared";

export const Executioner: Role = {
    "name": "Executioner",
    "color": "#8C4005",
    "team": Teams.Neutral,
    "icon": "/images/roles/executioner.png",
    "description": "Neutralna rola z własnym warunkiem zwycięstwa. Jego celem jest <u>wygłosowanie</u> gracza, wskazanego na początku gry. Jeśli ten gracz zostanie wygnany, Executioner wygrywa grę. Jeśli cel zginie w inny sposób, Executioner zamienia się w Jestera.",
    "settings": {
        ...probabilityOfAppearing(-1),
        "Executioner Becomes On Target Dead": {
            value: RolesAfterDeath.Jester,
            type: RoleSettingTypes.Text,
        },
        "Executioner Can Button": {
            value: true,
            type: RoleSettingTypes.Boolean,
        },
        "Executioner Torments Player On Victory": {
            value: true,
            type: RoleSettingTypes.Boolean,
        },
    },
    abilities: [CommonRoleAbilities.None],
};

