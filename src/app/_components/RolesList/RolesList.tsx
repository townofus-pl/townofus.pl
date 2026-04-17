'use client';

import {type FC, useMemo} from "react";
import {RoleOrModifierTypes, type Modifier, type Role, type RoleOrModifier} from "@/constants/rolesAndModifiers";
import {Teams} from "@/constants/teams";
import {RolesListContext, TeamFilters, TypeFilters, useFilters, useSearch} from "./hooks";
import {Search} from "./Search";
import {Filters} from "./Filters";
import {RoleCard} from "./RoleCard/RoleCard";
import {ModSource} from "@/constants/modSources";

const sortRolesAndModifiers = (a: RoleOrModifier, b: RoleOrModifier): number => {
    if (a.type !== b.type) {
        return a.type === RoleOrModifierTypes.Role ? -1 : 1;
    }

    return a.name.localeCompare(b.name, 'pl');
};

export const RolesList: FC<{
    roles: Role[],
    modifiers: Modifier[],
    hideSettings?: boolean
    hideTips?: boolean
    scaleRoleIcons?: boolean
    showModFilter?: boolean
    defaultModSource?: ModSource
}> = ({roles, modifiers, hideSettings = false, hideTips = false, scaleRoleIcons = true, showModFilter = false, defaultModSource = ModSource.Mira}) => {
    const { searchValue, search } = useSearch();
    const { typeFilterValue, teamFilterValue, modFilterValue, filter } = useFilters({defaultModSource: showModFilter ? defaultModSource : undefined});

    const results = useMemo(
        () => {
            let rolesAndModifiers: RoleOrModifier[];

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

            if (showModFilter && modFilterValue) {
                if (modFilterValue === ModSource.TownOfUs) {
                    rolesAndModifiers = rolesAndModifiers.filter(({source}) => source === ModSource.TownOfUs || source === undefined);
                } else {
                    rolesAndModifiers = rolesAndModifiers.filter(({source}) => source === modFilterValue);
                }
            }

            return rolesAndModifiers;
        },
        [roles, modifiers, searchValue, typeFilterValue, teamFilterValue, showModFilter, modFilterValue]
    );

    return (
        <RolesListContext.Provider value={{searchValue, search, filter, showModFilter}}>
            <div className="grid grid-cols-1 gap-y-5 md:grid-cols-5 lg:grid-cols-9 gap-x-0 md:gap-x-5">
                <Search/>
                <Filters/>
            </div>
            <main>
                <div className="grid grid-cols-1 gap-y-5">
                    {results
                        .slice()
                        .sort(sortRolesAndModifiers)
                        .map(role => {
                            const roleIconScale = showModFilter
                                ? (role.source === ModSource.TownOfUs || role.source === undefined ? 1.5 : 1)
                                : scaleRoleIcons;

                            return (
                                <RoleCard
                                    key={`${role.id}-${role.type}-${role.source ?? 'base'}`}
                                    role={role}
                                    hideSettings={hideSettings}
                                    hideTips={hideTips}
                                    scaleRoleIcon={roleIconScale}
                                />
                            );
                        })}
                </div>
            </main>
        </RolesListContext.Provider>
    );
}
