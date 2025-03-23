import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";

export const AmnesiacAbilities = {
    Remember: {
        "name": "Remember (Przypomnij sobie)",
        "icon": "/images/abilities/remember.png"
    }
}

export const Amnesiac: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Amnesiac",
    "id": "amnesiac",
	"color": "#80B2FF",
    "team": Teams.Neutral,
    "icon": "/images/roles/amnesiac.png",
    "description": "Neutralna rola bez warunku zwycięstwa. Nie ma żadnych zadań i jest praktycznie bez roli. Jednak może sobie przypomnieć rolę, odnajdując martwego gracza. Gdy to zrobi, przejmuje nowy warunek zwycięstwa i dąży do wygranej. Dostaje strzałki wskazujące martwe ciała.",
    "settings": {
        ...probabilityOfAppearing(0),
        'Amnesiac Gets Arrows Pointing To Dead Bodies': {
            value: false,
            type: SettingTypes.Boolean,
        },
        'Time After Death Arrow Appears': {
            value: 5.0,
            type: SettingTypes.Time,
        },
    },
    "abilities": [AmnesiacAbilities.Remember],
};
