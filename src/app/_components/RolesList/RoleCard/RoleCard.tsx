import {type RoleOrModifier} from "@/constants/rolesAndModifiers";
import {SettingsList} from "./SettingsList";
import {Team} from "./Team";
import Image from "next/image";
import {FC} from "react";

export const RoleCard: FC<{
    role: RoleOrModifier,
    hideSettings?: boolean,
    hideTips?: boolean,
}> = ({role, hideSettings = false, hideTips = false}) => (
    <div id={role.id} className="grid grid-cols-1 gap-y-5 p-5 bg-zinc-900/50 rounded-xl border-l-5"
         style={{borderColor: role.color}}>
        <header className="font-brook bg-zinc-900/50 p-4 rounded-lg flex gap-5 items-center justify-start">
            <Image src={role.icon} alt={role.name} width={400} height={400} className="scale-150 w-28 h-28"/>
            <div>
                <h4 className="mb-2.5 text-6xl font-bold" style={{color: role.color}}>{role.name}</h4>
                <Team team={role.team}/>
            </div>
        </header>
        <div className="grid grid-cols-1 md:grid-cols-2/1 gap-5">
            <div className="bg-zinc-900/50 rounded-xl p-4 flex flex-col gap-10 justify-between">
                <div className="text-xl">{role.description}</div>
                {!hideSettings && (
                <SettingsList settings={role.settings}/>
            )}
            </div>  
            <div className="bg-zinc-900/50 rounded-xl p-4">
                <h5 className="font-brook text-5xl mb-5">Umiejętności</h5>
                <ul className="text-xl">
                    {role.abilities.map(ability => (
                        <li key={ability.name}
                            className="my-2.5 font-brook text-3xl bg-zinc-800/75 p-2 rounded flex items-center justify-start gap-2">
                            <Image src={ability.icon} alt={ability.name} width={64} height={64} className="w-8"/>
                            {ability.name}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
        {!hideTips && role.tip && (
            <div className="bg-zinc-900/50 p-4 rounded-lg flex gap-5 items-center justify-start">
                <h5 className="font-brook text-3xl">Porada: {role.tip}</h5>
            </div>
        )}
    </div>
);
