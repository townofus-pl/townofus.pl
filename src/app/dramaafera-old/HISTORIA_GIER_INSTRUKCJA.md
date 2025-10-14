# System Historii Gier - Instrukcja

## Jak dodać nową grę

### 1. Struktura plików
System obsługuje pliki w formacie `game_data_YYYYMMDD_HHMM.ts` z interfejsami:
- `GameMetadata` - podstawowe informacje o grze
- `PlayerStats` - statystyki graczy 
- `GameEvent` - wydarzenia w grze
- `MeetingData` - dane o spotkaniach i głosowaniach
- `GameData` - główny obiekt z wszystkimi danymi

### 2. Dodawanie nowej gry

1. **Skopiuj plik gry** do folderu `src/data/games/`
   ```
   game_data_20250706_1609.ts
   ```

2. **Zaktualizuj `src/data/games/index.ts`**
   - Dodaj nowy wpis do tablicy `availableGames`:
   ```typescript
   const availableGames = [
       {
           id: "20250706_1609",
           fileName: "game_data_20250706_1609"
       },
       {
           id: "20250707_2030",  // Nowa gra
           fileName: "game_data_20250707_2030"
       }
   ];
   ```

### 3. Format danych

#### GameMetadata:
```typescript
{
    startTime: "2025-07-06 16:09:57",
    endTime: "2025-07-06 16:12:02", 
    duration: "02:05",
    playerCount: 5,
    map: "Polus"
}
```

#### PlayerStats:
```typescript
{
    playerName: "NickGracza",
    roleHistory: ["Miner"],
    modifiers: ["Double Shot", "Sixth Sense"],
    win: 0, // 0 = przegrana, >0 = wygrana
    correctKills: 1,
    completedTasks: 0,
    totalPoints: 3.0,
    // ... inne statystyki
}
```

#### GameEvent:
```typescript
{
    timestamp: "16:11:36",
    description: "Malkiz 1 (Soul Collector) killed Malkiz 4 (Imitator) — Correct kill"
}
```

#### MeetingData:
```typescript
{
    meetingNumber: 1,
    deathsSinceLastMeeting: ["Gracz (Rola) - Przyczyna"],
    votes: {
        "GraczGłosujący": ["Kandydat1", "Kandydat2"]
    },
    skipVotes: [],
    noVotes: [],
    wasTie: false,
    wasBlessed: false
}
```

### 4. Automatyczna konwersja

System automatycznie:
- ✅ **Konwertuje** dane na format UI
- ✅ **Określa zwycięzców** na podstawie pola `win`
- ✅ **Klasyfikuje zespoły** używając systemu ról z `@/roles` i `@/constants/teams`
- ✅ **Normalizuje nazwy ról** (np. "GuardianAngel" → "Guardian Angel")
- ✅ **Kategoryzuje wydarzenia** (kill/meeting/vote/other)
- ✅ **Generuje podsumowania** dla listy gier

### 5. Mapowanie ról

System używa istniejących definicji ról z folderu `/src/roles/`:
- **Crewmate roles**: Engineer, Detective, Sheriff, itp.
- **Impostor roles**: Miner, Shapeshifter, itp. 
- **Neutral roles**: Jester, Guardian Angel, Soul Collector, itp.

Role są automatycznie rozpoznawane i konwertowane na format z odstępami:
- `GuardianAngel` → `Guardian Angel`
- `SoulCollector` → `Soul Collector`

### 5. Co będzie wyświetlane

#### Na liście gier:
- Data i czas rozpoczęcia
- Czas trwania
- Liczba graczy
- Mapa
- Zwycięzca i warunek wygranej
- Nicki zwycięzców

#### Na stronie szczegółów:
- **Tabela graczy**: role, modyfikatory, zespoły, punkty
- **Timeline wydarzeń**: zabójstwa, spotkania, głosowania
- **Szczegóły spotkań**: kto za kogo głosował, remisy
- **Statystyki**: zabójstwa, ukończone zadania

### 6. Wskazówki

- **ID gry**: Używaj formatu `YYYYMMDD_HHMM`
- **Nazwy plików**: `game_data_YYYYMMDD_HHMM.ts`
- **Zespoły**: System automatycznie rozpoznaje role Impostorów/Crewmates/Neutral
- **Wydarzenia**: Opisy są automatycznie kategoryzowane
- **Błędy**: Sprawdź konsolę przeglądarki w przypadku problemów

### 7. Przykład dodania gry:

1. Masz plik: `game_data_20250707_2030.ts`
2. Kopiujesz go do `src/data/games/`
3. Dodajesz do `index.ts`:
   ```typescript
   {
       id: "20250707_2030",
       fileName: "game_data_20250707_2030"
   }
   ```
4. Gra automatycznie pojawi się na liście! 🎉
