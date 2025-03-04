"use client";

import { useState, useEffect, useMemo } from "react";
import { RolesList } from "@/app/_components";
import { Roles } from "@/roles";
import { Modifiers } from "@/modifiers";
import { SettingTypes } from "@/constants/settings";

export function SettingsDramaAfera() {
  const [fileContent, setFileContent] = useState<string | null>(null);

  useEffect(() => {
    fetch("/settings/dramaafera.txt")
      .then(response => {
        console.log('Response status:', response.status);
        return response.text();
      })
      .then(text => {
        console.log('Loaded text:', text);
        setFileContent(text);
      })
      .catch(error => {
        console.error("Error loading file:", error);
        // Możesz ustawić domyślną zawartość
        setFileContent('');
      });
  }, []);


  const { roles, filteredRoles } = useMemo(() => {
    if (!fileContent) {
      return {
        roles: [],
        filteredRoles: {}
      };
    }

    if (!Array.isArray(Roles)) {
      console.error("Roles is not an array:", Roles);
      return {
        roles: [],
        filteredRoles: {}
      };
    }

    // Tworzymy mapę z zawartości pliku
    const fileContentMap = new Map(
      (fileContent || '')
        .split("\r\n")
        .reduce((acc, current, index, array) => {
          if (current && current.trim() !== '') {
            if (index % 2 === 0 && array[index + 1] !== undefined) {
              acc.push([current, array[index + 1]]);
            } else {
              if (acc.length > 0) {
                acc[acc.length - 1].push(current);
              }
            }
          }
          return acc;
        }, [] as [string, string][])
    );

    // Funkcja do usuwania tagów <color=...>...</color>
    const extractName = (str: string): string => str.replace(/<color=[^>]+>(.*?)<\/color>/, "$1");

    // Mapa oczyszczonych nazw postaci i ich szans na wystąpienie
    const cleanedFileContentMap = new Map<string, number>();
    fileContentMap.forEach((value, key) => {
      cleanedFileContentMap.set(extractName(key), Number(value));
    });

    // **Filtrowanie ról**
    const filteredRoles = Roles
      .filter(
        (char) =>
          cleanedFileContentMap.has(char.name) &&
          (cleanedFileContentMap.get(char.name) ?? 0) > 1
      )
      .reduce((acc, char) => {
        acc[char.id] = char;
        return acc;
      }, {} as Record<string, (typeof Roles)[number]>);


    // **Przetwarzanie ról**
    const rolesArray = Array.isArray(Roles) ? Object.values(Roles) : [];

    const roles = rolesArray.map(role => {
      Object.keys(role.settings).forEach(key => {
        if (fileContentMap.has(key)) {
          const value = fileContentMap.get(key);
          if (value !== undefined) {
            const setting = role.settings[key];

            switch (setting.type) {
              case SettingTypes.Boolean:
                setting.value = value.toLowerCase() === 'true';
                break;
              case SettingTypes.Number:
              case SettingTypes.Percentage:
              case SettingTypes.Time:
              case SettingTypes.Multiplier:
                setting.value = Number(value);
                break;
              case SettingTypes.Text:
                setting.value = value;
                break;
            }
          }
        }
      });
      return role;
    });

    return { roles, filteredRoles };
  }, [fileContent]);




  const { modifiers, filteredModifiers } = useMemo(() => {
    // Jeśli fileContent jest null lub undefined, zwróć domyślne wartości
    if (!fileContent) {
      return {
        modifiers: [],
        filteredModifiers: {}
      };
    }

    // Sprawdź, czy Modifiers jest tablicą
    if (!Array.isArray(Modifiers)) {
      console.error("Modifiers is not an array:", Modifiers);
      return {
        modifiers: [],
        filteredModifiers: {}
      };
    }

    // Tworzymy mapę z zawartości pliku
    const fileContentMap = new Map(
      fileContent
        .split("\r\n")
        .reduce((acc, current, index, array) => {
          if (current && current.trim() !== '') {
            if (index % 2 === 0 && array[index + 1] !== undefined) {
              acc.push([current, array[index + 1]]); // Klucz (nazwa postaci z tagami)
            } else {
              if (acc.length > 0) {
                acc[acc.length - 1].push(current); // Wartość (szansa na wystąpienie)
              }
            }
          }
          return acc;
        }, [] as [string, string][])
    );

    // Funkcja do usuwania tagów <color=...>...</color>
    const extractName = (str: string): string => str.replace(/<color=[^>]+>(.*?)<\/color>/, "$1");

    // Mapa oczyszczonych nazw postaci i ich szans na wystąpienie
    const cleanedFileContentMap = new Map<string, number>();
    fileContentMap.forEach((value, key) => {
      cleanedFileContentMap.set(extractName(key), Number(value));
    });

    // **Filtrowanie Modifiers**
    const filteredModifiers = Modifiers
      .filter(
        (char) =>
          cleanedFileContentMap.has(char.name) &&
          (cleanedFileContentMap.get(char.name) ?? 0) > 1
      )
      .reduce((acc, char) => {
        acc[char.id] = char;
        return acc;
      }, {} as Record<string, (typeof Modifiers)[number]>);

    // **Przetwarzanie Modifiers**
    const modifiersArray = Array.isArray(Modifiers) ? Object.values(Modifiers) : [];

    const modifiers = modifiersArray.map(modifier => {
      Object.keys(modifier.settings).forEach(key => {
        if (fileContentMap.has(key)) {
          const value = fileContentMap.get(key);
          if (value !== undefined) {
            const setting = modifier.settings[key];

            switch (setting.type) {
              case SettingTypes.Boolean:
                setting.value = value.toLowerCase() === 'true';
                break;
              case SettingTypes.Number:
              case SettingTypes.Percentage:
              case SettingTypes.Time:
              case SettingTypes.Multiplier:
                setting.value = Number(value);
                break;
              case SettingTypes.Text:
                setting.value = value;
                break;
            }
          }
        }
      });
      return modifier;
    });

    return { modifiers, filteredModifiers };
  }, [fileContent]);

  console.log(roles);
  console.log(modifiers);


  return (
    <div className="p-4">
      <RolesList roles={Object.values(filteredRoles) || []} modifiers={Object.values(filteredModifiers) || []} />
    </div>
  );
}
