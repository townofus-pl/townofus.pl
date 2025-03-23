import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const Mystic: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Mystic",
    "id": "mystic",
	"color": "#4C99E5",
    "team": Teams.Crewmate,
    "icon": "/images/roles/mystic.png",
    "description": "Crewmate, który otrzymuje alert w postaci niebieskiej poświaty na ekranie, informujący o śmierci gracza. Dodatkowo przez moment wyświetla mu się strzałka wskazująca kierunek, w którym znajduje się ciało.",
    "settings": {
        ...probabilityOfAppearing(0),
        "Dead Body Arrow Duration": {
            value: 0.1,
            type: SettingTypes.Time,
        },
    },
    "abilities": [CommonAbilities.None],
    "tip": "Zapamiętuj ile sekund temu padały ciała. To bardzo przydatna informacja."
};
