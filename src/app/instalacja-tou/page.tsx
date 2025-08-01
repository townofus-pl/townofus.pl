import Image from "next/image";
export default function ToUDownload() {
  return (
    <div className="grid grid-cols-1 gap-6 bg-zinc-900/50 rounded-xl mb-5">
    <div className="relative w-full rounded-xl">

      <div className="inset-0 z-10 flex items-center justify-center rounded-xl mt-5 mb-5">
        <div className="text-white text-center px-4 rounded-xl">
          <div className="relative text-center text-white">
            <p className="text-red-500 text-8xl font-brook font-bold drop-shadow-[0_0_10px_rgba(255,0,0,0.7)]">Jak wgrać Town of Us</p>
          </div>
          <br/>
          <ul className="text-left text-lg text-gray-100 mb-6 space-y-2 list-decimal">
            <li>Pobierz najnowszą wersję moda,</li>
            <li>Przejdź do swojej biblioteki Steam,</li>
            <li>Kliknij prawym przyciskiem myszy na <code className="bg-gray-800 text-base text-white px-1 rounded font-mono">Among Us</code> &gt; wybierz <code className="bg-gray-800 text-base text-white px-1 rounded font-mono">Zarządzaj</code> &gt; kliknij <code className="bg-gray-800 text-base text-white px-1 rounded font-mono">Przeglądaj pliki lokalne</code>,</li>
            <li>W Eksploratorze plików usuń cały folder Among Us,</li>
            <li>Wróć do swojej biblioteki Steam,</li>
            <li>Kliknij prawym przyciskiem myszy na <code className="bg-gray-800 text-base text-white px-1 rounded font-mono">Among Us</code> &gt; wybierz <code className="bg-gray-800 text-base text-white px-1 rounded font-mono">Właściwości...</code> &gt; przejdź do zakładki <code className="bg-gray-800 text-base text-white px-1 rounded font-mono">Zainstalowane Pliki</code>,</li>
            <li>Kliknij na <code className="bg-gray-800 text-base text-white px-1 rounded font-mono">Sprawdź spójność plików gry</code>,</li>
            <li>Poczekaj, aż Steam pobierze czystą wersję Among Us,</li>
            <li>Wróć do eksploratora plików,</li>
            <li>Zduplikuj nowy folder Among Us,</li>
            <li>Zmień nazwę (proponuję <code className="bg-gray-800 text-base text-white px-1 rounded font-mono">Among Us - ToU</code>),</li>
            <li>Z pobranego archiwum ZIP przeciągnij wszystkie pliki do nowego folderu ToU,</li>
            <li>Gotowe. Plik <code className="bg-gray-800 text-base text-white px-1 rounded font-mono">Among Us.exe</code> jest plikiem rozruchowym. Polecam zrobić skrót do niego na pulpicie.</li>
          </ul>
          <div className="flex justify-center space-x-4">
          <a
              href="https://github.com/eDonnes124/Town-Of-Us/releases/download/v5.3.1/ToU.v5.3.1.zip"
              rel="noopener noreferrer"
              className="px-4 py-3 bg-[rgba(0,167,0)] hover:bg-[rgba(0, 167, 0, 0.85)] text-white text-lg font-sans font-semibold rounded-lg transition duration-300 inline-flex items-center"
            >
              <Image src="/images/download-button.svg" width={16} height={16} alt="download" />
              &nbsp; Download v5.3.1
            </a>
            <a
              href="https://github.com/eDonnes124/Town-Of-Us-R"
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-3 bg-[rgba(63,63,63)] hover:bg-[rgba(63,63,63,0.85)] text-white text-lg font-sans font-semibold rounded-lg transition duration-300 inline-flex items-center"
            >
              <Image src="/images/github-logo.svg" width={16} height={16} alt="github" />
              &nbsp; GitHub
            </a>
          </div>
          <p className="text-lg text-gray-100 mt-5 mb-2 text-center">Wszyscy gracze muszą mieć zainstalowanego moda, aby móc grać.</p>
        </div>
      </div>
    </div>
  </div>
  );
}
