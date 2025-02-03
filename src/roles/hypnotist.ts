import {CommonRoleAbilities, probabilityOfAppearing, type Role, RoleSettingTypes, Teams} from "./shared";

export const HypnotistAbilities = {
    Hypnotize: {
        "name": "Hypnotize (Zahipnotyzuj)",
        "icon": "/images/abilities/hypnotise.png"
    },
    Hysteria: {
        "name": "Hysteria (Histeria)",
        "icon": "/images/abilities/hysteria.png"
    }
};


export const Hypnotist: Role = {
    "name": "Hypnotist",
    "color": "#FF0000",
    "team": Teams.Impostor,
    "icon": "/images/roles/hypnotist.png",
    "description": "Impostor, który może hipnotyzować graczy. Gdy wystarczająca liczba osób zostanie zahipnotyzowana, Hypnotist może uwolnić Masową Histerię. Po jej aktywacji, wszyscy zahipnotyzowani gracze będą widzieć pozostałych graczy jako siebie, zamaskowanych lub niewidzialnych. Po śmierci Hypnotista, Masowa Histeria zostaje usunięta, a gracze zaczynają widzieć wszystkich normalnie.",
    "settings": {
        ...probabilityOfAppearing(-1),
        "Hypnotize Cooldown": {
            value: 25,
            type: RoleSettingTypes.Time,
        }
    },
    "abilities": [CommonRoleAbilities.Kill, CommonRoleAbilities.Vent, CommonRoleAbilities.Sabotage, HypnotistAbilities.Hypnotize, HypnotistAbilities.Hysteria],
};
