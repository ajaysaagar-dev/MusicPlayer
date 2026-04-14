import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { Song } from '../types';

interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  playlist: Song[];
  shuffleMode: boolean;
  repeatMode: 'off' | 'all' | 'one';
}

interface PlayerContextType extends PlayerState {
  play: (song: Song, list?: Song[]) => void;
  pause: () => void;
  resume: () => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (time: number) => void;
  setVolume: (vol: number) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  reorderPlaylist: (startIndex: number, endIndex: number) => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export function usePlayer(): PlayerContextType {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [state, setState] = useState<PlayerState>({
    currentSong: null,
    isPlaying: false,
    progress: 0,
    duration: 0,
    volume: 0.75,
    playlist: [],
    shuffleMode: false,
    repeatMode: 'off',
  });

  useEffect(() => {
    const audio = new Audio();
    audio.volume = state.volume;
    audioRef.current = audio;

    const onTimeUpdate = () => setState(prev => ({ ...prev, progress: audio.currentTime }));
    const onLoadedMetadata = () => setState(prev => ({ ...prev, duration: audio.duration }));
    const onPlaying = () => setState(prev => ({ ...prev, isPlaying: true }));
    const onPause = () => setState(prev => ({ ...prev, isPlaying: false }));
    const onEnded = () => {
      setState(prev => {
        if (prev.repeatMode === 'one') {
          audio.currentTime = 0;
          audio.play();
          return prev;
        }
        return { ...prev, isPlaying: false };
      });
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.pause();
    };
  }, []);

  // Auto-next logic
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleNext = () => {
      const { playlist, currentSong, repeatMode, shuffleMode } = state;
      if (repeatMode === 'one') return;
      if (playlist.length > 0) {
        const idx = playlist.findIndex((s) => s.id === currentSong?.id);
        const nextIdx = shuffleMode 
          ? Math.floor(Math.random() * playlist.length) 
          : idx + 1;

        if (nextIdx < playlist.length) {
          play(playlist[nextIdx]);
        } else if (repeatMode === 'all') {
          play(playlist[0]);
        }
      }
    };
    audio.addEventListener('ended', handleNext);
    return () => audio.removeEventListener('ended', handleNext);
  }, [state]);

  const play = useCallback((song: Song, list?: Song[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = song.songurl;
    audio.play().catch(e => console.error("Playback failed", e));
    setState((prev) => ({
      ...prev,
      currentSong: song,
      isPlaying: true,
      progress: 0,
      playlist: list ?? prev.playlist,
    }));
  }, []);

  const pause = useCallback(() => audioRef.current?.pause(), []);
  const resume = useCallback(() => audioRef.current?.play().catch(() => {}), []);

  const togglePlay = useCallback(() => {
    if (state.isPlaying) pause();
    else resume();
  }, [state.isPlaying, pause, resume]);

  const next = useCallback(() => {
    const { playlist, currentSong, shuffleMode } = state;
    if (playlist.length === 0) return;
    const idx = playlist.findIndex((s) => s.id === currentSong?.id);
    const nextIdx = shuffleMode 
      ? Math.floor(Math.random() * playlist.length) 
      : (idx + 1) % playlist.length;
    play(playlist[nextIdx]);
  }, [state, play]);

  const prev = useCallback(() => {
    const { playlist, currentSong } = state;
    if (playlist.length === 0) return;
    const audio = audioRef.current;
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    const idx = playlist.findIndex((s) => s.id === currentSong?.id);
    const prevIdx = (idx - 1 + playlist.length) % playlist.length;
    play(playlist[prevIdx]);
  }, [state, play]);

  const seek = useCallback((time: number) => {
    if (audioRef.current) audioRef.current.currentTime = time;
  }, []);

  const setVolume = useCallback((vol: number) => {
    if (audioRef.current) audioRef.current.volume = vol;
    setState((prev) => ({ ...prev, volume: vol }));
  }, []);

  const toggleShuffle = useCallback(() => {
    setState((prev) => ({ ...prev, shuffleMode: !prev.shuffleMode }));
  }, []);

  const toggleRepeat = useCallback(() => {
    setState((prev) => {
      const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one'];
      const idx = modes.indexOf(prev.repeatMode);
      return { ...prev, repeatMode: modes[(idx + 1) % 3] };
    });
  }, []);

  const reorderPlaylist = useCallback((startIndex: number, endIndex: number) => {
    setState((prev) => {
        const result = Array.from(prev.playlist);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return { ...prev, playlist: result };
    });
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        ...state,
        play,
        pause,
        resume,
        togglePlay,
        next,
        prev,
        seek,
        setVolume,
        toggleShuffle,
        toggleRepeat,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}
