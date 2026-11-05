import { Header } from "@/app/dramaafera/_components/Header/Header";

// Dokumentacja API używa nagłówka DramaAfera, jak strony pod /dramaafera.
// Przełącznik sezonu jest wyłączony: buduje adresy ze ścieżki strony,
// a /api/docs nie ma wariantów sezonowych.
export default function ApiDocsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <>
            <Header showSeasonSwitcher={false} />
            {children}
        </>
    );
}
