import {
    probabilityOfAppearing,
    RoleSettingTypes,
    Teams
} from "./shared";
import type {Role} from "@/_roles/shared/roles";

export const AmnesiacAbilities = {
    Remember: {
        "name": "Remember (Przypomnij sobie)",
        "icon": "/images/abilities/remember.png"
    }
}

export const Amnesiac: Role = {
    "name": "Amnesiac",
    "color": "#80B2FF",
    "team": Teams.Neutral,
    "icon": "/images/roles/amnesiac.png",
    "description": "Neutralna rola bez warunku zwycięstwa. Nie ma żadnych zadań i jest praktycznie bez roli. Jednak może sobie przypomnieć rolę, odnajdując martwego gracza. Gdy to zrobi, przejmuje nowy warunek zwycięstwa i dąży do wygranej. Dostaje strzałki wskazujące martwe ciała.",
    "settings": {
        ...probabilityOfAppearing(-1),
        'Amnesiac Gets Arrows Pointing To Dead Bodies': {
            value: 1,
            type: RoleSettingTypes.Boolean,
        },
        'Time After Death Arrow Appears': {
            value: 1.0,
            type: RoleSettingTypes.Time,
        },
    },
    "abilities": [AmnesiacAbilities.Remember],
};
