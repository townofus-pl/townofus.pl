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

  const roles = useMemo(() => {
    const fileContentMap = new Map(fileContent?.split("\r\n").reduce((acc, current, index) => {
      if (index % 2 == 0) {
        acc.push([current]);
      }
      else {
        acc[acc.length - 1].push(current);
      }
      return acc;
    }, []));
    return Roles.map(role => {
      Object.keys(role.settings).forEach(key => {
        if (!fileContentMap.has(key)) {
          return
        }
        console.log(key);
        console.log(fileContentMap.get(key));
        role.settings[key].value = fileContentMap.get(key);
      }
      );

      return role;
    })
  }, [fileContent])

  return (
    <div className="p-4">
      <input type="file" accept=".txt" onChange={handleFileChange} className="mb-2" />

      <RolesList roles={roles} modifiers={[]} />
    </div>

  );
}
