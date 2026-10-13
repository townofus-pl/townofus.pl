export interface UpcomingRoster {
    date: string;
    season: number;
    closesAt: number;
    displayDate: string;
    playerNames: string[];
    revision: string;
}

export interface SignupView {
    roster: UpcomingRoster;
    loggedIn: boolean;
    player: { id: number; name: string } | null;
}
