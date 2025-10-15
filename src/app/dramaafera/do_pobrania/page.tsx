import React from "react";

const files = [
  {
    name: "TownOfUs.dll",
    size: "2.24 MB",
    href: "/files/TownOfUs.dll",
  },
  {
    name: "malkizhats.catalog",
    size: "25.73 KB",
    href: "/files/malkizhats.catalog",
  },
  {
    name: "AUnlocker.dll",
    size: "24.00 KB",
    href: "/files/AUnlocker.dll",
  },
  {
    name: "malkizhats.bundle",
    size: "1.05 MB",
    href: "/files/malkizhats.bundle",
  },
];

export default function DramaaferaSkinyPage() {
  return (
    <main className="min-h-screen rounded-xl bg-zinc-900/50 text-white px-4 py-8 flex flex-col items-center">
      <div className="max-w-xl w-full">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">WYMAGANE PLIKI</h1>
        <ol className="list-decimal list-inside space-y-1 mb-4 text-lg">
          <li>Skopiuj cały folder z Town of Us 5.3.1</li>
          <li>
            Wejdź do kopii, wejdź do <code className="bg-[#23202a] px-1 rounded]">BepInEx</code>, potem do <code className="bg-[#23202a] px-1 rounded   ">plugins</code>
          </li>
          <li>Wklej tam wszystkie pliki z załącznika</li>
        </ol>
        <p className="text-xs text-[#b0aeb8] mb-6">
          PS. Robimy kopie bo wersja ta jest niekompatybilna z innymi modami.
        </p>
        <div className="space-y-3">
          {files.map((file) => (
            <a
              key={file.name}
              href={file.href}
              className="flex items-center bg-[#23202a] hover:bg-[#2d2936] transition rounded-lg px-4 py-3 gap-4 shadow border border-[#23202a]"
              download
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-[#b0aeb8]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v2.25A2.25 2.25 0 0 1 17.25 18.75H6.75A2.25 2.25 0 0 1 4.5 16.5V14.25m15-6V6.75A2.25 2.25 0 0 0 17.25 4.5H6.75A2.25 2.25 0 0 0 4.5 6.75v1.5m7.5 3.75v6m0 0l-2.25-2.25m2.25 2.25l2.25-2.25" />
              </svg>
              <div className="flex flex-col">
                <span className="font-medium text-base">{file.name}</span>
                <span className="text-xs text-[#b0aeb8]">{file.size}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
