// Lista dostępnych gier - dodaj tutaj nowe pliki
export const availableGames = [
    {
        id: "20250702_2156_14",
        fileName: "game_data_20250702_2156"
    },
    {
        id: "20250702_2148_13",
        fileName: "game_data_20250702_2148"
    },
    {   
        id: "20250702_2132_12",
        fileName: "game_data_20250702_2132"
    },
    {   
        id: "20250702_2110_11",
        fileName: "game_data_20250702_2110" 
    },
    {   
        id: "20250702_2054_10",
        fileName: "game_data_20250702_2054"
    },
    {  
        id: "20250702_2043_09",
        fileName: "game_data_20250702_2043"
    },
    {
        id: "20250702_2029_08",
        fileName: "game_data_20250702_2029"
    },
    {
        id: "20250702_2004_07",
        fileName: "game_data_20250702_2004"
    },
    {
        id: "20250702_1943_06",
        fileName: "game_data_20250702_1943"
    },
    {
        id: "20250702_1924_05",
        fileName: "game_data_20250702_1924"
    },
    {
        id: "20250702_1904_04",
        fileName: "game_data_20250702_1904"
    },
    {
        id: "20250702_1845_03",
        fileName: "game_data_20250702_1845"
    },
    {
        id: "20250702_1832_02",
        fileName: "game_data_20250702_1832"
    },
    {
        id: "20250702_1816_01",
        fileName: "game_data_20250702_1816"
    },
    // Dodaj kolejne gry tutaj w formacie:
    // {
    //     id: "YYYYMMDD_HHMM", 
    //     fileName: "game_data_YYYYMMDD_HHMM"
    // }
];

export type GameListItem = {
    id: string;
    fileName: string;
};
