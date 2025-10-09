import {Header} from "./_components/Header/Header";

export default function DramaAferaLayout({
   children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Header />
            {children}
        </>
    );
}
