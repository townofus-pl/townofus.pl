import Link from "next/link";

export const Header = () => (
    <header className="grid grid-cols-1 gap-6 bg-zinc-900/50 px-5 py-10 rounded-xl mb-5">
        <h1 className="text-7xl font-bold font-brook">
            <Link href="/">Town Of Us - Role</Link>
        </h1>
        <h2 className="text-3xl font-brook">
            Lista ról i modyfikatorów dostępnych w Town Of Us v5.2.1
            <span className="md:ml-2.5 font-barlow text-base text-gray-500 block md:inline">by Malkiz, Quarties & OrzechMC</span>
        </h2>
    </header>
);
