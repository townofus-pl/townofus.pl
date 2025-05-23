import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const Investigator: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Investigator",
    "id": "investigator",
	"color": "#00B2B2",
    "team": Teams.Crewmate,
    "icon": "/images/roles/investigator.png",
    "description": "Crewmate, który widzi ślady stóp w kolorach graczy. Każdy ślad znika po określonym czasie.",
    "settings": {
        ...probabilityOfAppearing(0),
        "Footprint Size": {
            value: 4,
            type: SettingTypes.Number,
        },
        "Footprint Interval": {
            value: 0.1,
            type: SettingTypes.Time,
        },
        "Footprint Duration": {
            value: 10,
            type: SettingTypes.Time,
        },
        "Anonymous Footprint": {
            value: false,
            type: SettingTypes.Boolean,
        },
        "Footprint Vent Visible": {
            value: false,
            type: SettingTypes.Boolean,
        }
    },
    "abilities": [CommonAbilities.None],
    "tip": "Sprawdzaj wentylacje. Jeżeli widać ślady zmierzające w ich kierunku, wniosek jest prosty..."
};
