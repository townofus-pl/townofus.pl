import {FileUpload} from "@/app/_components/FileUpload";

export default function Ustawienia() {
    return (
        <div className="grid grid-cols-1 gap-y-5">
            <div className="relative text-center text-white">
                <p className="text-orange-500 text-6xl font-brook font-bold drop-shadow-[0_0_10px_rgba(255,,0,0.7)]">
                    Custom ustawienia reader
                </p>
                <FileUpload />
            </div>
        </div>
        
    );
}
