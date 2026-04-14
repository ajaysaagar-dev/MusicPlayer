import type { Song } from '../types';
import songsJson from '../../database/songs.json';

export const songs: Song[] = songsJson as Song[];

export const getUniqueMovies = (): string[] => {
  return [...new Set(songs.map((s) => s.movieName))];
};

export const getUniqueComposers = (): string[] => {
  return [...new Set(songs.map((s) => s.composer))];
};

export const getSongsByMovie = (movieName: string): Song[] => {
  return songs.filter((s) => s.movieName === movieName);
};
