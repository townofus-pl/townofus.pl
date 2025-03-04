import { FileUpload } from "@/app/_components/FileUpload";

export default function Ustawienia() {
    return (

        <div className="grid grid-cols-1 gap-y-5">
            <p className="text-green-500 text-6xl font-brook drop-shadow-[0_0_10px_rgba(255,,0,0.7)]">
                    [BETA] Wrzuć swoje ustawienia
                </p>
            <FileUpload />
        </div>
    );
}
