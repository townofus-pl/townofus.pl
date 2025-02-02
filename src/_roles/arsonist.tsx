import {
    probabilityOfAppearing,
    RoleSettingTypes,
    Teams
} from "./shared";
import type {Role} from "@/_roles/shared/roles";

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
    "name": "Arsonist",
    "color": "#FF4D00",
    "team": Teams.Neutral,
    "icon": "/images/roles/arsonist.png",
    "description": (<>
        <p>Neutralna rola z własnym warunkiem zwycięstwa. Ma dwie zdolności:</p>
        <ul className="list-disc list-inside">
            <li>Polewanie innych graczy benzyną</li>
            <li>Zapalanie wszystkich polanych graczy.</li>
        </ul>
        <p>Arsonist może mieć maksymalnie 5 oblanych osób jednocześnie. Arsonist musi być ostatnim zabójcą, aby wygrać grę.</p>
    </>),
    "settings": {
        ...probabilityOfAppearing(-1),
        'Douse Cooldown': {
            value: 35.0,
            type: RoleSettingTypes.Time,
        },
        'Maximum Alive Players Doused': {
            value: 15,
            type: RoleSettingTypes.Number,
        },
        'Arsonist Has Impostor Vision': {
            value: 1,
            type: RoleSettingTypes.Boolean,
        },
        'Ignite Cooldown Removed When Arsonist Is Last Killer': {
            value: 1,
            type: RoleSettingTypes.Boolean,
        },
    },
    abilities: [ArsonistAbilities.Douse, ArsonistAbilities.Ignite],
};
