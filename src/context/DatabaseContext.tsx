import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Octokit } from 'octokit';
import { toast } from 'sonner';
import type { Song, Artist, Album, Playlists } from '../types';

interface DatabaseContextType {
  token: string;
  owner: string;
  repo: string;
  isInitialized: boolean;
  isLoading: boolean;
  isSilentSyncing: boolean; // Tracking non-masking operations
  error: string | null;
  config: {
    setToken: (token: string) => void;
    setOwner: (owner: string) => void;
    initializeRepo: () => Promise<void>;
  };
  data: {
    songs: Song[];
    artists: Artist[];
    albums: Album[];
    playlists: Playlists;
    account: any;
    refresh: (silent?: boolean) => Promise<void>;
    updateSongs: (newSongs: Song[]) => Promise<void>;
    updateArtists: (newArtists: Artist[]) => Promise<void>;
    updateAlbums: (newAlbums: Album[]) => Promise<void>;
    updatePlaylists: (newPlaylists: Playlists, silent?: boolean) => Promise<void>;
    updateAccount: (newAccount: any) => Promise<void>;
  };
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export function useDatabase() {
  const ctx = useContext(DatabaseContext);
  if (!ctx) throw new Error('useDatabase must be used within DatabaseProvider');
  return ctx;
}

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('gh_token') || '');
  const [owner, setOwner] = useState(localStorage.getItem('gh_owner') || '');
  const repo = 'MyMusic';

  const [isLoading, setIsLoading] = useState(false);
  const [isSilentSyncing, setIsSilentSyncing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [playlists, setPlaylists] = useState<Playlists>({});
  const [account, setAccount] = useState<any>({ 
    profile: { name: 'Guest User', email: 'guest@myplay.com' },
    settings: { zoomSpeed: 10, theme: 'nebula' }
  });

  const getOctokit = useCallback(() => {
    if (!token) return null;
    return new Octokit({ auth: token });
  }, [token]);

  const saveConfig = (newToken: string, newOwner: string) => {
    localStorage.setItem('gh_token', newToken);
    localStorage.setItem('gh_owner', newOwner);
    setToken(newToken);
    setOwner(newOwner);
  };

  const fetchFile = async (octokit: Octokit, path: string) => {
    try {
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
      });
      if ('content' in data) {
        const content = atob(data.content.replace(/\n/g, ''));
        return JSON.parse(content);
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const refresh = useCallback(async (silent = false) => {
    const octokit = getOctokit();
    if (!octokit || !owner) return;

    if (silent) setIsSilentSyncing(true); else setIsLoading(true);
    try {
      const [s, ar, al, p, acc] = await Promise.all([
        fetchFile(octokit, 'songs.json'),
        fetchFile(octokit, 'artists.json'),
        fetchFile(octokit, 'albums.json'),
        fetchFile(octokit, 'playlists.json'),
        fetchFile(octokit, 'account.json'),
      ]);

      if (Array.isArray(s)) setSongs(s);
      if (Array.isArray(ar)) setArtists(ar);
      if (Array.isArray(al)) setAlbums(al);
      if (p && typeof p === 'object') setPlaylists(p);
      if (acc && typeof acc === 'object') setAccount(acc);
      
      setIsInitialized(true);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
      setIsSilentSyncing(false);
    }
  }, [getOctokit, owner]);

  const updateFile = async (path: string, content: any, message: string, successMsg: string, silent = false) => {
    const octokit = getOctokit();
    if (!octokit || !owner) throw new Error("No database connection");

    if (silent) setIsSilentSyncing(true); else setIsLoading(true);
    try {
      let sha: string | undefined;
      try {
        const { data: fileData } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path,
        });
        if ('sha' in fileData) sha = fileData.sha;
      } catch (e) {}

      const jsonString = JSON.stringify(content, null, 2);
      const encodedContent = btoa(unescape(encodeURIComponent(jsonString)));

      await octokit.rest.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message,
        content: encodedContent,
        sha,
      });
      
      await refresh(silent);
      toast.success(successMsg);
    } catch (e: any) {
      toast.error(`Sync error: ${e.message}`);
      throw e;
    } finally {
        setIsLoading(false);
        setIsSilentSyncing(false);
    }
  };

  const initializeRepo = async () => {
    const octokit = getOctokit();
    if (!octokit || !owner) {
      toast.error('Token and Owner are required.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let repoExists = false;
      try {
        await octokit.rest.repos.get({ owner, repo });
        repoExists = true;
      } catch (e: any) {
        if (e.status !== 404) throw e;
      }

      if (!repoExists) {
        await octokit.rest.repos.createForAuthenticatedUser({
          name: repo,
          private: true,
          description: 'Music database for MyPlay',
        });
        toast.info('Cloud repository created');
      }

      const ensureFile = async (path: string, content: any) => {
        try {
          await octokit.rest.repos.getContent({ owner, repo, path });
        } catch (e: any) {
          if (e.status === 404) {
             const jsonString = JSON.stringify(content, null, 2);
             const encodedContent = btoa(unescape(encodeURIComponent(jsonString)));
             await octokit.rest.repos.createOrUpdateFileContents({
               owner,
               repo,
               path,
               message: `Initialize ${path}`,
               content: encodedContent,
             });
             return true;
          }
          throw e;
        }
        return false;
      };

      const results = await Promise.all([
        ensureFile('songs.json', []),
        ensureFile('artists.json', []),
        ensureFile('albums.json', []),
        ensureFile('playlists.json', {}),
        ensureFile('account.json', { 
            profile: { name: 'Guest User', email: 'guest@myplay.com' },
            settings: { zoomSpeed: 10, theme: 'nebula' }
        }),
      ]);

      const filesCreated = results.some(r => r === true);
      
      await refresh();
      
      if (filesCreated || !repoExists) {
        toast.success('Database vault initialized successfully');
      } else {
        toast.success('Synced with existing cloud vault');
      }

    } catch (e: any) {
      toast.error(`Initialization failed: ${e.message}`);
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token && owner) {
      refresh();
    }
  }, [token, owner, refresh]);

  return (
    <DatabaseContext.Provider value={{
      token, owner, repo, isInitialized, isLoading, isSilentSyncing, error,
      config: {
        setToken: (t) => saveConfig(t, owner),
        setOwner: (o) => saveConfig(token, o),
        initializeRepo,
      },
      data: {
        songs, artists, albums, playlists, account, refresh,
        updateSongs: (s) => updateFile('songs.json', s, 'Sync songs', 'Songs database updated'),
        updateArtists: (ar) => updateFile('artists.json', ar, 'Sync artists', 'Artist registry updated'),
        updateAlbums: (al) => updateFile('albums.json', al, 'Sync albums', 'Album collection updated'),
        updatePlaylists: (p, silent = false) => updateFile('playlists.json', p, 'Sync playlists', 'Playlists synced to cloud', silent),
        updateAccount: (acc) => updateFile('account.json', acc, 'Sync account', 'Account & Settings synced to cloud'),
      }
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};
