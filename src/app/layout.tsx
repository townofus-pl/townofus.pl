import type {Metadata} from "next";
import localFont from "next/font/local";
import {Barlow} from "next/font/google";
import {GoogleAnalytics} from "@next/third-parties/google";
import {DiscordLink} from "./_components";
import {Header} from "./_components";
import "./globals.css";

const brook = localFont({
    src: '/_fonts/BrookPL.woff',
    display: 'swap',
    variable: '--font-brook',
});

export const vcr = localFont({
    src: "/_fonts/Better-VCR.woff",
    display: "swap",
    variable: "--font-vcr",
});

const barlow = Barlow({
    subsets: ["latin-ext"],
    weight: ["400", "700"],
    variable: '--font-barlow',
    display: 'swap',
});

export const metadata: Metadata = {
    title: "Town of Us — Role",
    description: "Szybka wyszukiwarka ról z modyfikacji Town of Us",
};

export default function RootLayout({
   children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="text-sm md:text-base">
            <body className={`${brook.variable} ${barlow.variable} ${barlow.className}`}>
                <DiscordLink/>
                <div className="max-w-screen-xl m-auto">
                     <Header/>
                    {children}
                </div>
            </body>
            <GoogleAnalytics gaId="G-W12ZGZ57HF"/>
        </html>
    );
}
