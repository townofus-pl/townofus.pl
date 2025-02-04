import {CommonAbilities, probabilityOfAppearing, SettingTypes, Teams, type Role} from "@/constants";

export const Mystic: Role = {
    "name": "Mystic",
    "color": "#4C99E5",
    "team": Teams.Crewmate,
    "icon": "/images/roles/mystic.png",
    "description": "Crewmate, który otrzymuje alert w postaci poświaty na ekranie, informujący o śmierci gracza. Dodatkowo przez moment wyświetla mu się strzałka wskazująca kierunek, w którym znajduje się ciało.",
    "settings": {
        ...probabilityOfAppearing(-1),
        "Dead Body Arrow Duration": {
            value: 0.2,
            type: SettingTypes.Time,
        },
    },
    "abilities": [CommonAbilities.None],
    "tip": "Zapamiętuj ile sekund temu padały ciała. To bardzo przydatna informacja."
};
