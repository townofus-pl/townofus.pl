import {useContext} from 'react';
import {TeamFilters,RoleFilters,RolesListContext} from './RolesList';

export const Filters = () => {
    const {filter} = useContext(RolesListContext);

    return (
        <div className="grid grid-cols-2 gap-4 col-span-1 md:col-span-2 lg:col-span-3 text-lg">
            <div>
                <label htmlFor="type-filter">Rodzaj:</label>
                <select
                    id="type-filter"
                    className="w-full p-3 bg-zinc-900/75 border-2 rounded-md border-search"
                    onChange={(e) => filter(e.target.value as RoleFilters)}
                >
                    <option>Wszystkie</option>
                    <option value={RoleFilters.Role}>Rola</option>
                    <option value={RoleFilters.Modifier}>Modyfikator</option>
                </select>
            </div>
            <div>
                <label htmlFor="team-filter">Drużyna:</label>
                <select
                    id="team-filter"
                    className="w-full p-3 text-md bg-zinc-900/75 border-2 rounded-md border-search"
                    onChange={(e) => filter(e.target.value as TeamFilters)}
                >
                    <option>Wszystkie</option>
                    <option value={TeamFilters.Crewmate}>Crewmate</option>
                    <option value={TeamFilters.Neutral}>Neutral</option>
                    <option value={TeamFilters.Impostor}>Impostor</option>
                </select>
            </div>
        </div>
    );
}
