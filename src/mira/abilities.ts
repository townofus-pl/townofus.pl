import type {Ability} from '@/constants/abilities';

export const MiraCommonAbilities: { None: Ability; Kill: Ability; Vent: Ability } = {
    None: {
        name: 'brak',
        icon: '/images/mira/abilities/none.png',
    },
    Kill: {
        name: 'Kill (Zabij)',
        icon: '/images/mira/abilities/KillButton.png',
    },
    Vent: {
        name: 'Vent (Wejdź do wentylacji)',
        icon: '/images/mira/abilities/VentButton.png',
    },
};

