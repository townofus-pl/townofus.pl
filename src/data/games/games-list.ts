// Lista dostępnych gier - dodaj tutaj nowe pliki
export const availableGames = [
    {
        id: "20250702_2156",
        fileName: "game_data_20250702_2156"
    },
    {
        id: "20250702_2148",
        fileName: "game_data_20250702_2148"
    },
    {   
        id: "20250702_2132",
        fileName: "game_data_20250702_2132"
    },
    {   
        id: "20250702_2110",
        fileName: "game_data_20250702_2110" 
    },
    {   
        id: "20250702_2054",
        fileName: "game_data_20250702_2054"
    },
    {  
        id: "20250702_2043",
        fileName: "game_data_20250702_2043"
    },
    {
        id: "20250702_2029",
        fileName: "game_data_20250702_2029"
    },
    {
        id: "20250702_2004",
        fileName: "game_data_20250702_2004"
    },
    {
        id: "20250702_1943",
        fileName: "game_data_20250702_1943"
    },
    {
        id: "20250702_1924",
        fileName: "game_data_20250702_1924"
    },
    {
        id: "20250702_1904",
        fileName: "game_data_20250702_1904"
    },
    {
        id: "20250702_1845",
        fileName: "game_data_20250702_1845"
    },
    {
        id: "20250702_1832",
        fileName: "game_data_20250702_1832"
    },
    {
        id: "20250702_1816",
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
