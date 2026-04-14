export interface Song {
  id: string;
  songname: string;
  singers: string[]; // artist IDs
  albumid: string;
  songurl: string;
  // Legacy fields for UI compatibility if needed
  movieName?: string;
  imageUrl?: string;
  fullscreenImageUrl?: string;
}

export interface Artist {
  id: string;
  artist_name: string;
  artist_image: string;
}

export interface Album {
  id: string;
  albumname: string;
  albumimage: string;
  composerids: string[]; // Array of artist IDs
  year: string;
  songs: string[]; // [...songids]
}

export type Playlists = Record<string, string[]>; // { playlistname: [...songids] }

export interface GHDabaseConfig {
  token: string;
  owner: string;
  repo: string;
}
