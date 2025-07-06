import Link from "next/link";
import { SettingsDramaAfera } from "./_components/SettingsDramaAfera";

export default function DramaAfera() {
    return (
        <div className="grid grid-cols-1 gap-y-5">
            <div className="relative text-center text-white">
                <p className="text-white-500 text-6xl font-brook font-bold drop-shadow-[0_0_10px_rgba(255,,0,0.7)]">
                    Among Us Drama Afera
                </p>
            </div>

            {/* Nawigacja wewnętrzna Drama Afera */}
            <div className="flex justify-center gap-6 my-8">
                <Link 
                    href="/dramaafera/ranking" 
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                    🏆 Ranking
                </Link>
                <Link 
                    href="/dramaafera/historia-gier" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                    📊 Historia Gier
                </Link>
                <Link 
                    href="/dramaafera/inne" 
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl"
                >
                    ⚙️ Inne
                </Link>
            </div>

            <SettingsDramaAfera />
        </div>
    );
}
