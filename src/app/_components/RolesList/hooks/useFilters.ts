import {useCallback, useState} from "react";
import {sendGAEvent} from "@next/third-parties/google";

export enum RoleFilters {
    Role = 'Role',
    Modifier = 'Modifier',
}

export enum TeamFilters {
    Crewmate = 'Crewmate',
    Neutral = 'Neutral',
    Impostor = 'Impostor',
}

export const useFilters = () => {
    const [typeFilterValue, setTypeFilterValue] = useState<RoleFilters|null>(null);
    const [teamFilterValue, setTeamFilterValue] = useState<TeamFilters|null>(null);

    const filter = useCallback((value: RoleFilters|TeamFilters) => {
        const sendFilterGAEvent = (type: 'role'|'team') => sendGAEvent('event', 'filter', { type, value });

        if (value in RoleFilters) {
            setTypeFilterValue(value as RoleFilters);
            sendFilterGAEvent('role');
            return;
        }

        if (value in TeamFilters) {
            setTeamFilterValue(value as TeamFilters);
            sendFilterGAEvent('team');
            return;
        }

        setTypeFilterValue(null);
        setTeamFilterValue(null);
    }, []);

    return {
        typeFilterValue,
        teamFilterValue,
        filter,
    };
}
