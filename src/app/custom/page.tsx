"use client";

import { CustomSettings } from "./_components/CustomSettings";
import { useSearchParams } from "next/navigation";

export default function DramaAfera() {
    const searchParams = useSearchParams();
    const fileName = searchParams.get("settings") || "townofus.pl"; // Domyślnie "townofus.pl"

    return (
        <div className="grid grid-cols-1 gap-y-5">
            <div className="relative text-center text-white">
                <p className="text-gray-300 text-6xl font-brook font-bold drop-shadow-[0_0_10px_rgba(255,,0,0.7)]">
                    Among Us ustawienia dla {fileName}
                </p>
            </div>
            <CustomSettings />
        </div>
    );
}
