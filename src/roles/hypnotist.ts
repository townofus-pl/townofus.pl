import {Role, RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {probabilityOfAppearing, SettingTypes} from "@/constants/settings";
import {CommonAbilities} from "@/constants/abilities";

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
    "type": RoleOrModifierTypes.Role,
    "name": "Hypnotist",
    "id": "hypnotist",
	"color": "#FF0000",
    "team": Teams.Impostor,
    "icon": "/images/roles/hypnotist.png",
    "description": "Impostor, który może hipnotyzować graczy. Gdy wystarczająca liczba osób zostanie zahipnotyzowana, Hypnotist może uwolnić Masową Histerię. Po jej aktywacji, wszyscy zahipnotyzowani gracze będą widzieć pozostałych graczy jako siebie, zamaskowanych lub niewidzialnych. Po śmierci Hypnotista, Masowa Histeria zostaje usunięta, a gracze zaczynają widzieć wszystkich normalnie.",
    "settings": {
        ...probabilityOfAppearing(0),
        "Hypnotize Cooldown": {
            value: 25,
            type: SettingTypes.Time,
        }
    },
    "abilities": [CommonAbilities.Kill, CommonAbilities.Vent, CommonAbilities.Sabotage, HypnotistAbilities.Hypnotize, HypnotistAbilities.Hysteria],
};
