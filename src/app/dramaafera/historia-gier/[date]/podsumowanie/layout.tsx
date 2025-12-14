import { Metadata } from "next";

interface PodsumowanieLayoutProps {
    params: Promise<{
        date: string;
    }>;
    children: React.ReactNode;
}

// Funkcja pomocnicza do formatowania daty
function formatDisplayDate(dateString: string): string {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    return `${day}.${month}.${year}`;
}

export async function generateMetadata({ params }: PodsumowanieLayoutProps): Promise<Metadata> {
    const { date } = await params;
    const formattedDate = formatDisplayDate(date);
    
    return {
        title: `Drama Afera - Podsumowanie - ${formattedDate}`
    };
}

export default function PodsumowanieLayout({ children }: { children: React.ReactNode }) {
    return children;
}
