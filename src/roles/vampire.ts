import {
    probabilityOfAppearing,
    RoleSettingTypes,
    Teams,
    type Role,
    CommonRoleAbilities,
} from "./shared";

export const VampireAbilities = {
    Bite: {
        "name": "Bite (Ugryź)",
        "icon": "/images/abilities/bite.png"
    },
};

export const vampire: Role = {
    "name": "Vampire",
    "color": "#747474",
    "team": Teams.Neutral,
    "icon": "/images/roles/vampire.png",
    "description": "Neutralna rola z własnym warunkiem zwycięstwa. Vampire może konwertować lub zabijać innych graczy poprzez ugryzienie. <br>Jeżeli w grze jest jeden żywy wampir, ugryzienie Crewmate zamieni go w drugiego vampira. Jeżeli w grze jest dwóch wampirów lub cel nie jest Crewmate'em, ugryziony umrze.",
    "settings": {
        ...probabilityOfAppearing(-1),
    },
    "abilities": [VampireAbilities.Bite],
};
