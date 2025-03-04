import { SettingsDramaAfera } from "./_components/SettingsDramaAfera";

export default function DramaAfera() {
    return (
        <div className="grid grid-cols-1 gap-y-5">
            <div className="relative text-center text-white">
                <p className="text-white-500 text-6xl font-brook font-bold drop-shadow-[0_0_10px_rgba(255,,0,0.7)]">
                    Among Us Drama Afera
                </p>
            </div>
            <SettingsDramaAfera />
        </div>
    );
}
