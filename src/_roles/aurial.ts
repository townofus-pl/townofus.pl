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
    "description": "Crewmate, który ma zdolność wskrzeszania martwych graczy. Po znalezieniu martwego ciała, Aurial może poświęcić siebie dla",
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
