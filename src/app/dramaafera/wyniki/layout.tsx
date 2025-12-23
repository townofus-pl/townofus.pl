import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Drama Afera - Wyniki Dnia"
};

export default function WynikiLayout({ children }: { children: React.ReactNode }) {
    return children;
}
