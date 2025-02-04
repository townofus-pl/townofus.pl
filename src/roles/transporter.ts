import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";

export const TransporterAbilities = {
    Transport: {
        "name": "Transport (Przetransportuj)",
        "icon": "/images/abilities/transport.png"
    },
};

export const Transporter: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Transporter",
    "color": "#00ECFF",
    "team": Teams.Crewmate,
    "icon": "/images/roles/transporter.png",
    "description": "Crewmate, który może dowolnie zamieniać miejscami dwóch wybranych przez siebie graczy. Gracze, którzy zostali przetransportowani, otrzymują powiadomienie w postaci niebieskiego błysku na ekranie.",
    "settings": {
        ...probabilityOfAppearing(-1),
        "Transport Cooldown": {
            value: 25,
            type: SettingTypes.Time,
        },
        "Maximum Number Of Transports": {
            value: 5,
            type: SettingTypes.Number,
        },
        "Transporter Can Use Vitals": {
            value: false,
            type: SettingTypes.Boolean,
        },
    },
    "abilities": [TransporterAbilities.Transport],
};
