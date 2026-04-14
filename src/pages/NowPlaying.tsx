import { usePlayer } from '../context/PlayerContext';
import { useDatabase } from '../context/DatabaseContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  HeadphoneOff,
  ChevronLeft
} from 'lucide-react';

export default function NowPlaying() {
  const { currentSong } = usePlayer();
  const { data } = useDatabase();
  const navigate = useNavigate();
  const [showBack, setShowBack] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Show back button if cursor is in top 25% of the screen
      const threshold = window.innerHeight * 0.25;
      if (e.clientY <= threshold) {
        setShowBack(true);
      } else {
        setShowBack(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!currentSong) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background gap-6">
        <div className="w-24 h-24 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant/20 animate-pulse">
          <HeadphoneOff size={64} />
        </div>
        <h2 className="text-3xl font-headline font-black tracking-tighter text-on-surface-variant">
          VAULT EMPTY
        </h2>
        <p className="text-on-surface-variant opacity-60 font-medium max-w-xs text-center">
          No track index has been selected for high-latency playback.
        </p>
        <button
          onClick={() => navigate('/songs')}
          className="px-12 py-4 bg-primary text-on-primary-fixed rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
        >
          Browse Songs
        </button>
      </div>
    );
  }

  // Resolvers
  const getSongName = (s: any) => s.songname || s.songName || 'Unknown Track';
  const getMovieName = (s: any) => {
    if (s.albumid) {
      return data.albums.find(a => a.id === s.albumid)?.albumname || s.movieName;
    }
    return s.movieName;
  }
  const getFullImg = (s: any) => {
    if (s.albumid) {
      return data.albums.find(a => a.id === s.albumid)?.albumimage || s.fullscreenImageUrl || s.imageUrl;
    }
    return s.fullscreenImageUrl || s.imageUrl;
  }

  const songName = getSongName(currentSong);
  const movieName = getMovieName(currentSong);
  const fullImg = getFullImg(currentSong);

  const zoomDuration = (data.account.settings?.zoomSpeed || 10) * 2;
  const blurLevel = data.account.settings?.blurLevel ?? 1;

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black flex items-center justify-center">
      {/* Global Injection for Sync Opposing Animations */}
      <style>{`
        @keyframes opposing-zoom-bg {
          0% { transform: scale(1.15); }
          50% { transform: scale(1); }
          100% { transform: scale(1.15); }
        }
        @keyframes opposing-zoom-text {
          0% { transform: scale(1) translateY(0px); opacity: 0.9; }
          50% { transform: scale(1.1) translateY(-10px); opacity: 1; }
          100% { transform: scale(1) translateY(0px); opacity: 0.9; }
        }
        .animate-opposing-zoom-bg {
          animation: opposing-zoom-bg ${zoomDuration}s cubic-bezier(0.45, 0, 0.55, 1) infinite;
        }
        .animate-opposing-zoom-text {
          animation: opposing-zoom-text ${zoomDuration}s cubic-bezier(0.45, 0, 0.55, 1) infinite;
        }
      `}</style>

      {/* 
        MASTER PARALLAX BACKGROUND 
        Opposite Zoom: Scales DOWN (1.15 to 1.0) while text scales UP.
      */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="w-full h-full animate-opposing-zoom-bg">
          <img
            src={fullImg}
            alt={songName}
            className="w-full h-full object-cover opacity-90 transition-[filter] duration-700"
            style={{ filter: blurLevel > 0 ? `blur(${blurLevel}px)` : 'none' }}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
      </div>

      {/* Back Button - Top 25% Trigger Zone */}
      <button
        onClick={() => navigate(-1)}
        className={`absolute top-10 left-10 z-50 w-14 h-14 bg-white/5 backdrop-blur-3xl rounded-2xl border border-white/10 flex items-center justify-center transition-all duration-700 ease-in-out text-white shadow-2xl hover:bg-white/10 active:scale-90 ${showBack ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-10 scale-90 pointer-events-none'
          }`}
        title="Go Back"
      >
        <ChevronLeft size={28} />
      </button>

      {/* 
        SYNCED PARALLAX TEXT CONTAINER 
        Opposite Zoom: Scales UP (1.0 to 1.1) while background scales DOWN.
        Text size reduced to 7.5rem (75% of previous 10rem).
      */}
      <div className="relative z-30 w-full max-w-7xl px-12 text-center pointer-events-none animate-opposing-zoom-text">
        <div className="space-y-4 transform">
          <div className="space-y-1">
            <span className="text-primary font-black uppercase tracking-[0.5em] text-[10px] opacity-60">Currently Auditioning</span>
            <h1 className="text-[7.5rem] font-black font-headline tracking-tighter text-white leading-none drop-shadow-[0_10px_60px_rgba(0,0,0,0.8)] mix-blend-plus-lighter">
              {songName}
            </h1>
          </div>

          <div className="flex items-center justify-center gap-6">
            <div className="h-[2px] w-20 bg-gradient-to-r from-transparent to-primary" />
            <p className="text-3xl text-white/90 font-black tracking-[0.2em] font-headline uppercase drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
              {movieName}
            </p>
            <div className="h-[2px] w-20 bg-gradient-to-l from-transparent to-primary" />
          </div>
        </div>
      </div>

    </div>
  );
}
