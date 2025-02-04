'use client';

import debounce from "lodash.debounce";
import {createContext, useCallback, useMemo, useState} from "react";
import {Roles} from "@/roles";
import {Modifiers} from "@/modifiers";
import {Search} from "@/app/_components";
import {RoleCard} from "./RoleCard/RoleCard";
import {RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {Filters} from "@/app/_components/RolesList/Filters";

const RolesAndModifiers = [...Roles, ...Modifiers];

export enum RoleFilters {
    Role = 'Role',
    Modifier = 'Modifier',
}

export enum TeamFilters {
    Crewmate = 'Crewmate',
    Neutral = 'Neutral',
    Impostor = 'Impostor',
}

type RolesListContextType = {
    searchValue: string;
    search: (x: string) => void;
    filter: (x: RoleFilters|TeamFilters) => void;
};

export const RolesListContext = createContext<RolesListContextType>({
    searchValue: '',
    search: () => {
    },
    filter: () => {
    },
});

export const RolesList = () => {
    const [searchValue, setSearchValue] = useState<string>('');
    const [typeFilterValue, setTypeFilterValue] = useState<RoleFilters|null>(null);
    const [teamFilterValue, setTeamFilterValue] = useState<TeamFilters|null>(null);

    const search = useMemo(() => debounce(setSearchValue, 300), []);

    const filter = useCallback((filterValue: RoleFilters|TeamFilters) => {
        if (filterValue in RoleFilters) {
            setTypeFilterValue(filterValue as RoleFilters);
            return;
        }

        if (filterValue in TeamFilters) {
            setTeamFilterValue(filterValue as TeamFilters);
            return;
        }

        setTypeFilterValue(null);
        setTeamFilterValue(null);
    }, []);

    const results = useMemo(
        () => {
            let rolesAndModifiers = RolesAndModifiers;

            if (searchValue) {
                rolesAndModifiers = rolesAndModifiers.filter(
                    ({name}) =>
                        name.toLowerCase().includes(searchValue.toLowerCase())
                )
            }

            switch (typeFilterValue) {
                case RoleFilters.Role:
                    rolesAndModifiers = rolesAndModifiers.filter(({type}) => type === RoleOrModifierTypes.Role);
                    break;
                case RoleFilters.Modifier:
                    rolesAndModifiers = rolesAndModifiers.filter(({type}) => type === RoleOrModifierTypes.Modifier);
                    break;
                default:
                    break;
            }

            switch (teamFilterValue) {
                case TeamFilters.Crewmate:
                    rolesAndModifiers = rolesAndModifiers.filter(({team}) => team === Teams.Crewmate || team === Teams.All);
                    break;
                case TeamFilters.Neutral:
                    rolesAndModifiers = rolesAndModifiers.filter(({team}) => team === Teams.Neutral || team === Teams.All);
                    break;
                case TeamFilters.Impostor:
                    rolesAndModifiers = rolesAndModifiers.filter(({team}) => team === Teams.Impostor || team === Teams.All);
                    break;
                default:
                    break;
            }

            return rolesAndModifiers;
        },
        [searchValue, typeFilterValue, teamFilterValue]
    );

    return (
        <RolesListContext.Provider value={{searchValue, search, filter}}>
            <div className="grid grid-cols-1 gap-y-5 md:grid-cols-5 lg:grid-cols-9 gap-x-0 md:gap-x-5">
                <Search/>
                <Filters/>
            </div>
            <main>
                <div className="grid grid-cols-1 gap-y-5">
                    {results.map(role => (
                        <RoleCard key={role.name} role={role}/>
                    ))}
                </div>
            </main>
        </RolesListContext.Provider>
    );
}
