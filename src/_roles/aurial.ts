import {
    CommonRoleAbilities,
    probabilityOfAppearing,
    RoleSettingTypes,
    Teams
} from "./shared";
import type {Role} from "@/_roles/shared/roles";

export const Aurial: Role = {
    "name": "Aurial",
    "color": "#B23CB3",
    "team": Teams.Crewmate,
    "icon": "/images/roles/aurial.png",
    "description": "Crewmate, który potrafi wyczuwać rzeczy w swojej aurze. Jeśli którykolwiek gracz w pobliżu Auriala użyje przycisku zdolności, Aurial otrzyma strzałkę wskazującą, gdzie ta zdolność została użyta. Jeżeli stanie się to wystarczająco blisko, to strzałka będzie miała kolor gracza który użył zdolności.",
    "settings": {
        ...probabilityOfAppearing(-1),
        "Radiate Colour Range": {
            value: 0.5,
            type: RoleSettingTypes.Radius,
        },
        "Radiate Max Range": {
            value: 1.5,
            type: RoleSettingTypes.Radius,
        },
        "Sense Duration": {
            value: 10.0,
            type: RoleSettingTypes.Time,
        },
    },
    "abilities": [CommonRoleAbilities.None],
};
