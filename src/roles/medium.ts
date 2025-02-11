import {type Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";

export const MediumAbilities = {
    Mediate: {
        "name": "Mediate (Dokonaj mediacji) ",
        "icon": "images/abilities/mediate.png"
    },
};

export const Medium: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Medium",
    "id": "medium",
	"color": "#A680FF",
    "team": Teams.Crewmate,
    "icon": "/images/roles/medium.png",
    "description": "Crewmate, który może widzieć duchy. W każdej rundzie Medium może użyć zdolności mediacji. Jeśli użyje jej, gdy wszyscy żyją, nic się nie stanie. Jednak jeśli ktoś już nie żyje, Medium i martwy gracz będą mogli się zobaczyć oraz komunikować zza grobu.",  
    "settings": {
        ...probabilityOfAppearing(-1),
        "Mediate Cooldown": {
            value: 20,
            type: SettingTypes.Time,
        },
        "Reveal Appearance Of Mediate Target": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Reveal The Medium To The Mediate Target": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Who Is Revealed With Mediate": {
            value: "Newest Dead",
            type: SettingTypes.Text,
        },
    },
    "abilities": [MediumAbilities.Mediate],
};
