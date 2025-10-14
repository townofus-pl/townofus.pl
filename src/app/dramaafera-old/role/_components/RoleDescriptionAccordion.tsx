import { useState } from "react";
import fs from "fs";
import path from "path";

interface RoleDescriptionAccordionProps {
  roleName: string;
}

// SSR: Wczytaj opis roli z pliku Markdown/TSX z folderu roles
function getRoleDescription(roleName: string): string {
  try {
    // Szukaj pliku .ts lub .tsx w src/roles
    const base = path.resolve(process.cwd(), "src/roles");
    const fileName = roleName.toLowerCase().replace(/\s+/g, "") + ".ts";
    const fileNameTsx = roleName.toLowerCase().replace(/\s+/g, "") + ".tsx";
    let filePath = path.join(base, fileName);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(base, fileNameTsx);
      if (!fs.existsSync(filePath)) return "Brak opisu roli.";
    }
    const fileContent = fs.readFileSync(filePath, "utf-8");
    // Wyciągnij opis z eksportowanego obiektu/komentarza na górze pliku
    // Zakładamy, że opis jest w komentarzu /** ... */ na początku pliku
    const match = fileContent.match(/\/\*\*([\s\S]*?)\*\//);
    if (match) {
      return match[1].replace(/^[ \t]*\* ?/gm, "").trim();
    }
    return "Brak opisu roli.";
  } catch {
    return "Brak opisu roli.";
  }
}

export function RoleDescriptionAccordion({ roleName }: RoleDescriptionAccordionProps) {
  const [open, setOpen] = useState(false);
  // SSR: odczytaj opis roli
  const description = getRoleDescription(roleName);
  return (
    <div className="mb-6">
      <button
        className="w-full flex items-center justify-between px-4 py-2 bg-zinc-800/50 rounded-lg border border-zinc-700/50 text-white hover:text-gray-300 hover:bg-zinc-700/50 transition-colors font-semibold text-lg"
        onClick={() => setOpen((v) => !v)}
        type="button"
        aria-expanded={open}
      >
        <span>📖 Opis roli</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div className="p-4 bg-zinc-900/70 border border-zinc-700/50 rounded-b-lg text-base mt-1 whitespace-pre-line">
          {description}
        </div>
      )}
    </div>
  );
}
