import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";

export const TrackerAbilities = {
    Track: {
        "name": "Track (Namierzaj)",
        "icon": "/images/abilities/track.png"
    },
};

export const Tracker: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Tracker",
    "id": "tracker",
	"color": "#009900",
    "team": Teams.Crewmate,
    "icon": "/images/roles/tracker.png",
    "description": "Crewmate, który za pomocą swojej umiejętności może śledzić innych graczy podczas rundy. Gdy zacznie kogoś śledzić, strzałka będzie wskazywać położenie tej osoby, aktualizując się w określonych odstępach czasu.",
    "settings": {
        ...probabilityOfAppearing(0),
        "Arrow Update Interval": {
            value: 5,
            type: SettingTypes.Time,
        },
        "Track Cooldown": {
            value: 25,
            type: SettingTypes.Time,
        },
        "Tracker Arrows Reset After Each Round": {
            value: true,
            type: SettingTypes.Boolean,
        },
        "Maximum Number of Tracks": {
            value: 5,
            type: SettingTypes.Number,
        },
    },
    "abilities": [TrackerAbilities.Track],
    "tip": "Namierzaj podejrzanych. Podczas spotkania weryfikuj wersje wydarzeń."
};
