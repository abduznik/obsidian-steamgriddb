export interface SteamGridDBGame {
    id: number;
    name: string;
    release_date?: number;
    types?: string[];
    verified?: boolean;
}

export interface SteamGridDBImage {
    id: number;
    score: number;
    style: string;
    url: string;
    thumb: string;
    tags?: string[];
    author?: {
        name: string;
        steam64: string;
        avatar: string;
    };
}
