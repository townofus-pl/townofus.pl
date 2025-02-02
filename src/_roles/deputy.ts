import {
    probabilityOfAppearing,
    Teams,
    type Role,
} from "./shared";

export const DeputyAbilities = {
    Camp: {
        "name": "Camp (Zobozuj)",
        "icon": "/images/abilities/camp.png"
    }
};

export const Deputy: Role = {
    "name": "Deputy",
    "color": "#FFCC00",
    "team": Teams.Crewmate,
    "icon": "/images/roles/deputy.png",
    "description": "Crewmate, który może obozować innych graczach. Jeśli obozowany gracz zostanie zabity, Deputy otrzyma alert. Podczas następnego spotkania może spróbować zastrzelić zabójcę. Jeśli trafi, zginie a jeśli nie, nic się nie dzieje.",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [DeputyAbilities.Camp],
}
