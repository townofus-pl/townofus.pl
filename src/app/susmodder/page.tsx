import Image from "next/image";
export default function SusmodderPage() {
  return (
    <div className="grid grid-cols-1 gap-6 bg-zinc-900/50 rounded-xl mb-5 p-4">
      <div className="relative w-full rounded-xl">
        <div className="inset-0 z-10 flex items-center justify-center rounded-xl my-5">
          <div className="text-white w-full max-w-7xl px-4 rounded-xl">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="max-w-3xl mx-auto bg-zinc-900/50 rounded-xl p-8 mt-8 text-white font-barlow">
                <h1 className="text-5xl font-brook font-bold text-red-500 mb-6 text-center drop-shadow-[0_0_10px_rgba(255,0,0,0.7)]">SUSModder</h1>
                <p className="text-lg mb-4 font-semibold">SUSModder to narzędzie do zarządzania modyfikacjami gry <span className="italic">Among Us</span>, stworzone z myślą o prostocie, przejrzystości i łatwości użycia — nawet dla osób, które nigdy wcześniej nie instalowały modów.</p>
                <p className="text-lg mb-4">Projekt powstał, aby ułatwić instalację, konfigurację oraz uruchamianie modów i dodatków do Among Us, bez potrzeby ręcznego kopiowania plików, szukania odpowiednich wersji czy edytowania ustawień gry.</p>

                <h2 className="text-2xl font-bold mt-8 mb-4">Główne funkcje</h2>
                <ul className="list-disc pl-6 space-y-2 mb-6 text-lg">
                  <li>Zarządzanie, instalacja i agregowanie modów do Among Us</li>
                  <li>Instalacja dodatkowych plików DLL rozszerzających funkcjonalność gry</li>
                  <li>Obsługa konfiguracji dla modyfikacji takich jak <span className="italic">Town of Us</span></li>
                  <li>Możliwość tworzenia lobby dla więcej niż 15 graczy</li>
                  <li>Intuicyjny i przyjazny dla użytkownika interfejs</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">Główne założenia</h2>
                <p className="text-lg mb-6">Głównym celem projektu jest umożliwienie każdemu — niezależnie od poziomu zaawansowania technicznego — szybkiego i bezproblemowego uruchomienia modów do <span className="italic">Among Us</span>. <span className="font-bold">SUSModder</span> automatyzuje wszystkie techniczne aspekty procesu: od instalacji, przez weryfikację wersji gry, po konfigurację środowiska — wszystko odbywa się w jednym miejscu, bez potrzeby grzebania w plikach.</p>

<div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="https://susmodder.app/releases/release/SUSModder-release-Setup.exe"
                    rel="noopener noreferrer"
                    className="px-4 py-3 bg-[rgba(0,167,0)] hover:bg-[rgba(0,167,0,0.85)] text-white text-lg font-sans font-semibold rounded-lg transition duration-300 inline-flex items-center justify-center"
                  >
                    <Image src="/images/download-button.svg" width={16} height={16} alt="download" />
                    <span className="ml-2">Download</span>
                  </a>
                  <a
                    href="https://github.com/boratsc/SUSModder"
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-3 bg-[rgba(63,63,63)] hover:bg-[rgba(63,63,63,0.85)] text-white text-lg font-sans font-semibold rounded-lg transition duration-300 inline-flex items-center justify-center"
                  >
                    <Image src="/images/github-logo.svg" width={16} height={16} alt="github" />
                    <span className="ml-2">GitHub</span>
                  </a>
                  <a
                    href="https://susmodder.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 bg-[rgba(86,182,246)] hover:bg-[rgba(86, 182, 246, 0.85)] text-white text-lg font-sans font-semibold rounded-lg transition duration-300 inline-flex items-center justify-center"
                  >
                    <Image src="/images/globe.svg" width={24} height={24} alt="susmodder.app" />
                    <span className="ml-2">Susmodder.app</span>
                  </a>
                </div>

                <hr className="my-8 border-zinc-700" />

                <h2 className="text-2xl font-bold mt-8 mb-4">Wymagania</h2>
                <ul className="list-disc pl-6 space-y-2 mb-6 text-lg">
                  <li>Windows 10 lub 11</li>
                </ul>

                <h2 className="text-2xl font-bold mt-8 mb-4">Instalacja</h2>
                <ol className="list-decimal pl-6 space-y-2 mb-6 text-lg">
                  <li>Pobierz najnowszą wersję aplikacji z zakładki „Releases”.</li>
                  <li>Uruchom plik <code className="bg-gray-800 text-base text-white px-1 rounded font-mono">.exe</code> <span className="font-bold">lub</span> rozpakuj archiwum <code className="bg-gray-800 text-base text-white px-1 rounded font-mono">.zip</code> w dowolne miejsce.</li>
                  <li>Gotowe</li>
                </ol>

                <div className="bg-zinc-800 rounded-lg p-4 mt-6 text-base">
                  <span className="font-bold">Sprawdź na górnej belce czy masz prawidłową wersję (epic lub steam)</span> w zależności od tego na jakiej platformie masz zakupionego Among Us. Jeżeli zostało to nieprawidłowo wykryte - przejdź do ustawień i zmień ustawienia na prawidłową platformę zanim zainstalujesz mody!
                </div>
              </div>
              <div className="md:w-1/2 flex flex-col items-center justify-center gap-4">
                              <Image
                                className="w-full max-w-xl rounded-lg"
                                src="/images/splashscreen.png"
                                alt="Susmodder"
                                width={800}
                                height={450}
                              />
                              <Image
                                className="w-full max-w-xl rounded-lg"
                                src="/images/susmodder1.png"
                                alt="Susmodder1"
                                width={800}
                                height={450}
                              />
                              <Image
                                className="w-full max-w-xl rounded-lg"
                                src="/images/susmodder2.png"
                                alt="Susmodder2"
                                width={800}
                                height={450}
                              />
                            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}