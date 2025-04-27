import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

export const ArsonistAbilities = {
    Douse: {
        "name": "Douse (Oblej)",
        "icon": "/images/abilities/douse.png"
    },
    Ignite: {
        "name": "Ignite (Podpal)",
        "icon": "/images/abilities/ignite.png"
    }
}

export const Arsonist: Role = {
    "type": RoleOrModifierTypes.Role,
    "name": "Arsonist",
    "id": "arsonist",
	"color": "#FF4D00",
    "team": Teams.Neutral,
    "icon": "/images/roles/arsonist.png",
    "description": (<>
        <p>Neutralna rola z własnym warunkiem zwycięstwa. Ma dwie zdolności:</p>
        <ul className="list-disc list-inside">
            <li>Polewanie innych graczy benzyną</li>
            <li>Zapalanie polanych graczy w pobliżu.</li>
        </ul>
        <p>Arsonist musi być ostatnim zabójcą, aby wygrać
            grę.</p>
    </>),
    "settings": {
        ...probabilityOfAppearing(0),
        'Douse Cooldown': {
            value: 25.0,
            type: SettingTypes.Time,
        },
        'Ignite Radius': {
            value: 0.25,
            type: SettingTypes.Multiplier,
        }, 
        'Arsonist Can Vent': {
            value: false,
            type: SettingTypes.Boolean,
        },
    },
    abilities: [CommonAbilities.Vent, ArsonistAbilities.Douse, ArsonistAbilities.Ignite],
};
