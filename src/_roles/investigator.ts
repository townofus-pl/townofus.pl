import {probabilityOfAppearing, type Role, RoleSettingTypes, Teams, CommonRoleAbilities} from "./shared";

export const Investigator: Role = {
    "name": "Investigator",
    "color": "#00B2B2",
    "team": Teams.Crewmate,
    "icon": "/images/roles/investigator.png",
    "description": "Crewmate, który może widzieć ślady stóp graczy. Każdy ślad znika po określonym czasie.",
    "settings": {
        ...probabilityOfAppearing(-1),
        "Footprint Size": {
            value: 4,
            type: RoleSettingTypes.Number,
        },
        "Footprint Interval": {
            value: 0.1,
            type: RoleSettingTypes.Time,
        },
        "Footprint Duration": {
            value: 7,
            type: RoleSettingTypes.Time,
        },
        "Anonymous Footprint": {
            value: false,
            type: RoleSettingTypes.Boolean,
        },
        "Footprint Vent Visible": {
            value: true,
            type: RoleSettingTypes.Boolean,
        }
    },
    "abilities": [CommonRoleAbilities.None],
    "tip": "Sprawdzaj wentylacje. Jeżeli widać ślady zmierzające w ich kierunku, wniosek jest prosty..."
};
