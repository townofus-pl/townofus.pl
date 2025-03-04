"use client";

import { useState, useMemo } from "react";
import { RolesList } from "@/app/_components";
import { Roles } from "@/roles";

export function FileUpload() {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === "text/plain") {
      setSelectedFile(file);
      readFileContent(file);
    } else {
      alert("Wybierz plik w formacie .txt");
      setSelectedFile(null);
      setFileContent(null);
    }
  };

  const readFileContent = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setFileContent(e.target?.result as string);
    };
    reader.readAsText(file);
  };

  const { roles, filteredRoles } = useMemo(() => {
    if (!fileContent) return { roles: [], filteredRoles: {} };

    // Tworzymy mapę z zawartości pliku
    const fileContentMap = new Map(fileContent.split("\r\n").reduce((acc, current, index) => {
      if (index % 2 === 0) {
        acc.push([current]); // Klucz (nazwa postaci z tagami)
      } else {
        acc[acc.length - 1].push(current); // Wartość (szansa na wystąpienie)
      }
      return acc;
    }, [] as [string, string][]));

    // Funkcja do usuwania tagów <color=...>...</color>
    const extractName = (str: string): string => str.replace(/<color=[^>]+>(.*?)<\/color>/, "$1");

    // Mapa oczyszczonych nazw postaci i ich szans na wystąpienie
    const cleanedFileContentMap = new Map<string, number>();
    fileContentMap.forEach((value, key) => {
      cleanedFileContentMap.set(extractName(key), Number(value));
    });

    // **Filtrowanie ról**
    const filteredRoles = Object.values(Roles)
      .filter(
        (char) =>
          cleanedFileContentMap.has(char.name) &&
          (cleanedFileContentMap.get(char.name) ?? 0) > 1
      )
      .reduce((acc, char) => {
        acc[char.id] = char;
        return acc;
      }, {} as Record<string, typeof Roles[string]>);

    console.log("Filtered Roles:", filteredRoles);

    // **Przetwarzanie ról**
    const rolesArray = Array.isArray(Roles) ? Object.values(Roles) : [];

    const roles = rolesArray.map(role => {
      Object.keys(role.settings).forEach(key => {
        if (fileContentMap.has(key)) {
          role.settings[key].value = fileContentMap.get(key);
        }
      });
      return role;
    });

    return { roles, filteredRoles };
  }, [fileContent]);

  console.log(selectedFile);
  console.log(roles);


  return (
    <div className="p-4">
      <input type="file" accept=".txt" onChange={handleFileChange} className="mb-2" />

      <RolesList roles={Object.values(filteredRoles) || []} modifiers={[]} />
    </div>
  );
}
