import Link from "next/link";
import {Navigation} from "./Navigation/Navigation";

export const Header = () => (
    <header className="grid grid-cols-1 gap-4 md:gap-6 lg:gap-0 lg:grid-cols-2/1 bg-zinc-900/50 px-5 py-5 rounded-xl mb-5">
        <div className="grid grid-cols-1 gap-6">
            <h1 className="text-7xl font-bold font-brook">
                <Link href="/">AMONG US - DRAMA AFERA</Link>
            </h1>
            <h2 className="text-3xl font-brook hidden sm:block mt-0 lg:mt-2">
                Co środę między 18:00 a 22:00
            </h2>
            <Navigation/>
        </div>
        <div className="font-barlow text-base text-gray-500 flex items-start justify-start lg:justify-end">
            <p>Created by Malkiz, Quarties &amp; OrzechMC</p>
        </div>
    </header>
);
