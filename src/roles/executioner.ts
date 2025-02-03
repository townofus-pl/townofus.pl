import {
    CommonAbilities,
    probabilityOfAppearing,
    type Role,
    RolesAfterDeath,
    SettingTypes,
    Teams,
} from "@/constants";

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
            type: SettingTypes.Text,
        },
        "Executioner Can Button": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Executioner Torments Player On Victory": {
            value: true,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [CommonAbilities.None],
};

