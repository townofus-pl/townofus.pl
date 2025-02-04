import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const Snitch: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Snitch",
    "color": "#D4B11A",
    "team": Teams.Crewmate,
    "icon": "/images/roles/snitch.png",
    "description": "Crewmate, który po ukończeniu wszystkich zadań otrzymuje strzałki wskazujące na Impostorów. Nicki Impostorów pojawiają się również na jego ekranie na czerwono. Jednak gdy pozostanie mu ostatnie zadanie, to Impostorzy otrzymują strzałkę wskazującą na Snitcha.",
    "settings": {
        ...probabilityOfAppearing(-1),
        "Snitch Sees Neutral Roles": {
            value: false,
            type: SettingTypes.Boolean,
        },
        "Tasks Remaining When Revealed": {
            value: 1,
            type: SettingTypes.Number,
        },
        "Snitch Sees Impostors In Meetings": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Snitch Sees Traitor": {
            value: false,
            type: SettingTypes.Boolean,
        },
    },
    "abilities": [CommonAbilities.None],
    "tip": "Jako ostatnie dwa zadania zrób te które są najkrótsze i są najbliżej przycisku."
};
