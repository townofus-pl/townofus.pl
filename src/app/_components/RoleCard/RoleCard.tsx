import type {Role} from "@/_roles/shared/roles";
import {SettingsList} from "./SettingsList";
import {Team} from "./Team";

export const RoleCard = ({ role }: { role: Role }) => (
    <div className="grid grid-cols-1 gap-y-5 p-5 bg-zinc-900/50 rounded-xl border-l-5" style={{ borderColor: role.color }}>
        <header className="font-brook bg-zinc-900/50 p-4 rounded-lg flex gap-2.5 items-center justify-start">
            <img src={role.icon} alt={role.name} className="w-28 h-28 scale-150" />
            <div>
                <h4 className="mb-2.5 text-6xl font-bold" style={{ color: role.color }}>{role.name}</h4>
                <Team team={role.team} />
            </div>
        </header>
        <div className="grid grid-cols-2/1 gap-x-5">
            <div className="bg-zinc-900/50 rounded-xl p-4">
                <p className="mb-5 text-xl">{role.description}</p>
                <SettingsList settings={role.settings} />
            </div>
            <div className="bg-zinc-900/50 rounded-xl p-4">
                <h5 className="font-brook text-5xl mb-5">Umiejętności</h5>
                <ul className="text-xl">
                    {role.abilities.map(ability => (
                        <li key={ability.name} className="font-brook text-3xl bg-zinc-800/75 p-2 rounded flex items-center justify-start gap-2">
                            <img src={ability.icon} alt={ability.name} className="w-8"/>
                            {ability.name}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    </div>
);
