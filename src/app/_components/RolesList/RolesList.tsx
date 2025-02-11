'use client';

import {type FC, useMemo} from "react";
import {type Modifier, type Role} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {RolesListContext, TeamFilters, TypeFilters, useFilters, useSearch} from "./hooks";
import {Search} from "./Search";
import {Filters} from "./Filters";
import {RoleCard} from "./RoleCard/RoleCard";

export const RolesList: FC<{
    roles: Role[],
    modifiers: Modifier[],
    hideSettings?: boolean
    hideTips?: boolean
}> = ({roles, modifiers, hideSettings = false, hideTips = false}) => {
    const { searchValue, search } = useSearch();
    const { typeFilterValue, teamFilterValue, filter } = useFilters();

    const results = useMemo(
        () => {
            let rolesAndModifiers;

            switch (typeFilterValue) {
                case TypeFilters.Role:
                    rolesAndModifiers = roles;
                    break;
                case TypeFilters.Modifier:
                    rolesAndModifiers = modifiers;
                    break;
                default:
                    rolesAndModifiers = [...roles, ...modifiers];
                    break;
            }

            if (searchValue) {
                rolesAndModifiers = rolesAndModifiers.filter(
                    ({name}) =>
                        name.toLowerCase().includes(searchValue.toLowerCase())
                )
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
        [roles, modifiers, searchValue, typeFilterValue, teamFilterValue]
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
                        <RoleCard key={role.name} role={role} hideSettings={hideSettings} hideTips={hideTips}/>
                    ))}
                </div>
            </main>
        </RolesListContext.Provider>
    );
}
