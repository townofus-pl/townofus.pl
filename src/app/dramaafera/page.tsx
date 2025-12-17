
import { SettingsDramaAfera } from "./_components/SettingsDramaAfera";

export const metadata = {
    title: "Drama Afera - Ustawienia"
};

export default function DramaAfera() {
    return (
        <div className="grid grid-cols-1 gap-y-5">
            <SettingsDramaAfera />
        </div>
    );
}
