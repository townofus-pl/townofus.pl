import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Drama Afera - Host"
};

export default function HostLayout({ children }: { children: React.ReactNode }) {
    return children;
}
