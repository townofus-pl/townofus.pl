import type { Metadata } from "next";
import localFont from "next/font/local";
import { Barlow } from "next/font/google";
import "./globals.css";

const brook = localFont({
    src: '/_fonts/BrookPL.woff',
    display: 'swap',
    variable: '--font-brook',
});

const barlow = Barlow({
    weight: ["400", "700"],
    variable: '--font-barlow',
    display: 'swap',
});

export const metadata: Metadata = {
  title: "townofus.pl - Among Us Town of Us Polska",
  description: "Serwis dla fanó∑ gry Among Us z modyfikacją Town of Us",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${brook.variable} ${barlow.variable} ${barlow.className}`}
      >
        <div className="max-w-screen-xl m-auto">
            {children}
        </div>
      </body>
    </html>
  );
}
