import { usePlayer } from '../context/PlayerContext';
import { useDatabase } from '../context/DatabaseContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import {
  HeadphoneOff,
  ChevronLeft,
} from 'lucide-react';

const getYoutubeId = (url?: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function NowPlaying() {
  const { currentSong, setActiveArtistId, setActiveAlbumId } = usePlayer();
  const { data } = useDatabase();
  const player = usePlayer();
  const navigate = useNavigate();

  const [showControls, setShowControls] = useState(false);
  const [preferredViewMode, setPreferredViewMode] = useState<'audio' | 'video'>('audio');

  // Logic to determine what to actually show
  const hasVideo = !!getYoutubeId(currentSong?.videourl);
  const effectiveViewMode = (preferredViewMode === 'video' && hasVideo) ? 'video' : 'audio';

  useEffect(() => {
    // Initial setup based on current song
    if (currentSong?.isVideoEnabled && currentSong?.videourl) {
      setPreferredViewMode('video');
    } else {
      setPreferredViewMode('audio');
    }
  }, []); // Only on mount to establish initial preference

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const threshold = window.innerHeight * 0.25;
      if (e.clientY <= threshold) {
        setShowControls(true);
      } else {
        setShowControls(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Sync YouTube play/pause with app player
  const iframeRef = useRef<HTMLIFrameElement>(null);
  useEffect(() => {
    if (effectiveViewMode === 'video' && iframeRef.current) {
      const command = player.isPlaying ? 'playVideo' : 'pauseVideo';
      iframeRef.current.contentWindow?.postMessage(JSON.stringify({
        event: 'command',
        func: command,
        args: ''
      }), '*');
    }
  }, [player.isPlaying, effectiveViewMode]);

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
  const videoId = getYoutubeId(currentSong.videourl);

  const zoomDuration = (data.account.settings?.zoomSpeed || 10) * 2;
  const blurLevel = data.account.settings?.blurLevel ?? 1;

  return (
    <div className="relative h-screen w-full overflow-y-auto overflow-x-hidden bg-black custom-scrollbar">
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

      {/* Hero Section (First Fold) */}
      <div className="relative min-h-screen w-full flex items-center justify-center">
        {/* MASTER PARALLAX BACKGROUND */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-black">
          {effectiveViewMode === 'video' && videoId ? (
            <div className="absolute inset-0 w-full h-full scale-110 pointer-events-none">
              <iframe
                ref={iframeRef}
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&modestbranding=1&rel=0&vq=hd1440&enablejsapi=1`}
                className="w-full h-full border-none"
                allow="autoplay; encrypted-media"
                style={{ height: '110%', width: '110%', position: 'absolute', top: '-5%', left: '-5%' }}
              />
              <div className="absolute inset-0 bg-black/20" />
            </div>
          ) : (
            <div className="w-full h-full animate-opposing-zoom-bg">
              <img
                src={fullImg}
                alt={songName}
                className="w-full h-full object-cover opacity-90 transition-[filter] duration-1000"
                style={{ filter: blurLevel > 0 ? `blur(${blurLevel}px)` : 'none' }}
              />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
        </div>

        {/* Top Controls: Switcher & Back */}
        <div className={`fixed top-0 left-0 w-full p-10 z-[60] transition-all duration-700 ease-in-out flex items-center justify-between ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-10 pointer-events-none'}`}>
          <button
            onClick={() => navigate(-1)}
            className="w-14 h-14 bg-white/5 backdrop-blur-3xl rounded-2xl border border-white/10 flex items-center justify-center transition-all text-white shadow-2xl hover:bg-white/10 active:scale-90"
            title="Go Back"
          >
            <ChevronLeft size={28} />
          </button>

          <div className="absolute left-1/2 -translate-x-1/2 flex items-center bg-white/5 backdrop-blur-3xl rounded-2xl border border-white/10 p-1.5 shadow-2xl gap-2">
            <button
              onClick={() => setPreferredViewMode('audio')}
              className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${preferredViewMode === 'audio' ? 'bg-primary text-on-primary-fixed shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white'}`}
            >
              Audio
            </button>
            <button
              onClick={() => setPreferredViewMode('video')}
              className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${preferredViewMode === 'video' ? 'bg-primary text-on-primary-fixed shadow-lg shadow-primary/20' : 'text-white/40 hover:text-white'}`}
            >
              Video
            </button>
          </div>

          <div className="w-14" />
        </div>

        {/* SYNCED PARALLAX TEXT CONTAINER */}
        <div className="relative z-30 w-full max-w-7xl px-12 text-center pointer-events-none animate-opposing-zoom-text">
          <div className="space-y-4 transform">
            <div className="space-y-1">
              <span className="text-primary font-black uppercase tracking-[0.5em] text-[10px] opacity-60">Currently Auditioning</span>
              <h1 className="text-[7.5rem] font-black font-headline tracking-tighter text-white leading-none drop-shadow-[0_10px_60px_rgba(0,0,0,0.8)] mix-blend-plus-lighter">
                {songName}
              </h1>
            </div>

            <button
              onClick={() => setActiveAlbumId(currentSong.albumid)}
              className="group flex items-center justify-center gap-6 pointer-events-auto mx-auto"
            >
              <div className="h-[2px] w-20 bg-gradient-to-r from-transparent to-primary group-hover:w-32 transition-all duration-500 shrink-0" />
              <p className="text-3xl text-white/90 font-black tracking-[0.2em] font-headline uppercase drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)] group-hover:text-primary transition-colors text-center whitespace-nowrap">
                {movieName}
              </p>
              <div className="h-[2px] w-20 bg-gradient-to-l from-transparent to-primary group-hover:w-32 transition-all duration-500 shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {/* Contributors Section (Second Fold) */}
      <div className="relative z-30 bg-black py-32 px-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-6 mb-16">
            <div className="h-[1px] flex-1 bg-white/10" />
            <h2 className="text-xs font-black uppercase tracking-[0.8em] text-on-surface-variant opacity-40">Contributors</h2>
            <div className="h-[1px] flex-1 bg-white/10" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10">
            {(() => {
              const album = data.albums.find(a => a.id === currentSong.albumid);
              const singerIds = currentSong.singers || [];
              const composerIds = album?.composerids || [];

              // Combine unique IDs
              const allArtistIds = Array.from(new Set([...singerIds, ...composerIds]));

              // Sort: Composers first, then Vocalists
              allArtistIds.sort((a, b) => {
                const isAComposer = composerIds.includes(a);
                const isBComposer = composerIds.includes(b);
                if (isAComposer && !isBComposer) return -1;
                if (!isAComposer && isBComposer) return 1;
                return 0;
              });

              return allArtistIds.map((aid: string) => {
                const artist = data.artists.find(a => a.id === aid);
                if (!artist) return null;

                const isSinger = singerIds.includes(aid);
                const isComposer = composerIds.includes(aid);

                return (
                  <button 
                    key={aid} 
                    onClick={() => setActiveArtistId(aid)}
                    className="group relative flex flex-col items-center text-center space-y-6 cursor-pointer focus:outline-none"
                  >
                    <div className="relative w-48 h-48 rounded-full overflow-hidden border-2 border-white/5 shadow-2xl group-hover:border-primary/50 transition-all duration-500">
                      <img
                        src={artist.artist_image}
                        alt={artist.artist_name}
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-40" />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl font-black font-headline text-white group-hover:text-primary transition-colors tracking-tight">
                        {artist.artist_name}
                      </h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-30">
                        {[isSinger && 'Vocalist', isComposer && 'Composer'].filter(Boolean).join(' • ')}
                      </p>
                    </div>

                    {/* Aesthetic Background Glow */}
                    <div className="absolute -z-10 w-64 h-64 bg-primary/5 blur-[80px] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700" />
                  </button>
                );
              });
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
