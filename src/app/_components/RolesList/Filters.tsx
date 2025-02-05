import {AvailableFilters, TeamFilters, TypeFilters, useRolesListContext} from './hooks';

export const Filters = () => {
    const {filter} = useRolesListContext();

    return (
        <div className="grid grid-cols-2 gap-4 col-span-1 md:col-span-2 lg:col-span-3 text-lg">
            <div>
                <label htmlFor="type-filter">Rodzaj:</label>
                <select
                    id="type-filter"
                    className="w-full p-3 bg-zinc-900/75 border-2 rounded-md border-search"
                    onChange={(e) => filter(AvailableFilters.Type, e.target.value as TypeFilters)}
                >
                    <option>Wszystkie</option>
                    <option value={TypeFilters.Role}>Rola</option>
                    <option value={TypeFilters.Modifier}>Modyfikator</option>
                </select>
            </div>
            <div>
                <label htmlFor="team-filter">Drużyna:</label>
                <select
                    id="team-filter"
                    className="w-full p-3 text-md bg-zinc-900/75 border-2 rounded-md border-search"
                    onChange={(e) => filter(AvailableFilters.Team, e.target.value as TeamFilters)}
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
