'use client';

import {useMemo} from "react";
import {Roles} from "@/roles";
import {Modifiers} from "@/modifiers";
import {RoleOrModifierTypes} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {RolesListContext, TeamFilters, TypeFilters, useFilters, useSearch} from "./hooks";
import {Search} from "./Search";
import {Filters} from "./Filters";
import {RoleCard} from "./RoleCard/RoleCard";

const RolesAndModifiers = [...Roles, ...Modifiers];

export const RolesList = ({ hideSettings = false }: { hideSettings?: boolean }) => {
    const { searchValue, search } = useSearch();
    const { typeFilterValue, teamFilterValue, filter } = useFilters();

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
                case TypeFilters.Role:
                    rolesAndModifiers = rolesAndModifiers.filter(({type}) => type === RoleOrModifierTypes.Role);
                    break;
                case TypeFilters.Modifier:
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
                        <RoleCard key={role.name} role={role} hideSettings={hideSettings}/>
                    ))}
                </div>
            </main>
        </RolesListContext.Provider>
    );
}
