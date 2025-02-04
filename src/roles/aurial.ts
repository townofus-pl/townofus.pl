import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const Aurial: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Aurial",
    "color": "#B23CB3",
    "team": Teams.Crewmate,
    "icon": "/images/roles/aurial.png",
    "description": "Crewmate, który potrafi wyczuwać rzeczy w swojej aurze. Jeśli którykolwiek gracz w pobliżu Auriala użyje przycisku zdolności, Aurial otrzyma strzałkę wskazującą, gdzie ta zdolność została użyta. Jeżeli stanie się to wystarczająco blisko, to strzałka będzie miała kolor gracza który użył zdolności.",
    "settings": {
        ...probabilityOfAppearing(-1),
        "Radiate Colour Range": {
            value: 0.5,
            type: SettingTypes.Multiplier,
        },
        "Radiate Max Range": {
            value: 1.5,
            type: SettingTypes.Multiplier,
        },
        "Sense Duration": {
            value: 10.0,
            type: SettingTypes.Time,
        },
    },
    "abilities": [CommonAbilities.None],
};
