import {RolesList} from "@/app/_components";
import {RolesTajemniczy} from "@/roles";
import {ModifiersTajemniczy} from "@/modifiers";

export default function Tajemniczy() {
    return (
        <div className="grid grid-cols-1 gap-y-5">
            <div className="relative text-center text-white">
                <p className="text-orange-500 text-6xl font-brook font-bold drop-shadow-[0_0_10px_rgba(255,,0,0.7)]">
                    Dymowy Among by Tajemniczy Typiarz
                </p>
            </div>
            <RolesList roles={RolesTajemniczy} modifiers={ModifiersTajemniczy} hideTips={true} hideSettings={true}/>
        </div>
    );
}
