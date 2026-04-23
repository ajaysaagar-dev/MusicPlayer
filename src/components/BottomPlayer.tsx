import { useState, useEffect } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useDatabase } from '../context/DatabaseContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Heart,
    Shuffle,
    SkipBack,
    SkipForward,
    Play,
    Pause,
    Repeat,
    Repeat1,
    ListMusic,
    Volume2,
    Maximize2,
    X,
    UserCircle,
    PlusCircle,
    ListPlus,
    CheckCircle2,
    Disc,
    RefreshCcw,
    Music2,
    PlayCircle,
    ChevronUp,
    ChevronDown
} from 'lucide-react';

function formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function BottomPlayer({ onMenuStateChange }: { onMenuStateChange?: (isOpen: boolean) => void }) {
    const {
        currentSong,
        isPlaying,
        progress,
        duration,
        volume,
        shuffleMode,
        repeatMode,
        playlist,
        play,
        togglePlay,
        next,
        prev,
        seek,
        setVolume,
        toggleShuffle,
        toggleRepeat,
        reorderPlaylist,
        setActiveArtistId
    } = usePlayer();
    const { data } = useDatabase();
    const navigate = useNavigate();
    const location = useLocation();
    const isNowPlaying = location.pathname === '/now-playing';

    const [showArtists, setShowArtists] = useState(false);
    const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
    const [showQueue, setShowQueue] = useState(false);
    const [isSyncingFav, setIsSyncingFav] = useState(false);

    // Notify parent if any menu is open
    useEffect(() => {
        onMenuStateChange?.(showArtists || showPlaylistMenu || showQueue);
    }, [showArtists, showPlaylistMenu, showQueue]);

    const progressPercent = duration > 0 ? (progress / duration) * 100 : 0;

    // Resolvers for GitHub DB
    const getSongName = (s: any) => s.songname || s.songName || 'Unknown Track';

    const getSingersList = (s: any) => {
        if (Array.isArray(s.singers)) {
            return s.singers.map((id: string) => data.artists.find(a => a.id === id)).filter(Boolean);
        }
        return [];
    };

    const singersList = currentSong ? getSingersList(currentSong) : [];
    const singersText = singersList.map(a => a?.artist_name).join(', ') || 'Unknown Artist';

    const getAlbumImg = (s: any) => {
        if (s.albumid) {
            return data.albums.find(a => a.id === s.albumid)?.albumimage || s.imageUrl;
        }
        return s.imageUrl;
    };

    const toggleLike = async () => {
        if (!currentSong) return;
        setIsSyncingFav(true);
        const likedSongs = data.playlists['Liked'] || [];
        let newLiked;
        if (likedSongs.includes(currentSong.id)) {
            newLiked = likedSongs.filter(id => id !== currentSong.id);
        } else {
            newLiked = [...likedSongs, currentSong.id];
        }
        try {
            await data.updatePlaylists({ ...data.playlists, Liked: newLiked }, true);
        } finally {
            setIsSyncingFav(false);
        }
    };

    const isLiked = currentSong && (data.playlists['Liked'] || []).includes(currentSong.id);

    const toggleInPlaylist = async (playlistName: string) => {
        if (!currentSong) return;
        const currentSongs = data.playlists[playlistName] || [];
        let newList;
        if (currentSongs.includes(currentSong.id)) {
            newList = { ...data.playlists, [playlistName]: currentSongs.filter(id => id !== currentSong.id) };
        } else {
            newList = { ...data.playlists, [playlistName]: [...currentSongs, currentSong.id] };
        }
        await data.updatePlaylists(newList);
    };

    const moveItem = (index: number, direction: 'up' | 'down') => {
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= playlist.length) return;
        reorderPlaylist(index, targetIndex);
    };

    return (
        <footer className="fixed bottom-0 w-full h-[104px] z-50 bg-surface-container-highest/75 border-t border-white/5 flex flex-col items-center shadow-[0_-10px_50px_rgba(0,0,0,0.5)]">
            {/* Absolute Top Progress Bar Overlay */}
            <div
                className="w-full h-1.5 bg-white/5 cursor-pointer relative group transition-all hover:h-2"
                onMouseDown={(e) => {
                    const handleMove = (moveEvent: MouseEvent) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const percent = Math.max(0, Math.min(1, (moveEvent.clientX - rect.left) / rect.width));
                        // Update UI only during move
                        seek(percent * duration, false);
                    };

                    const handleUp = (upEvent: MouseEvent) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const percent = Math.max(0, Math.min(1, (upEvent.clientX - rect.left) / rect.width));
                        // Commit seek on mouse up
                        seek(percent * duration, true);

                        window.removeEventListener('mousemove', handleMove);
                        window.removeEventListener('mouseup', handleUp);
                    };

                    const rect = e.currentTarget.getBoundingClientRect();
                    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    seek(percent * duration, true);

                    window.addEventListener('mousemove', handleMove);
                    window.addEventListener('mouseup', handleUp);
                }}
            >
                <div
                    className="absolute h-full bg-gradient-to-r from-primary to-primary-container shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"
                    style={{ width: `${progressPercent}%` }}
                />
                <div
                    className="absolute h-3 w-3 bg-white rounded-full -top-[3px] shadow-xl hidden group-hover:block transition-all"
                    style={{ left: `${progressPercent}%`, transform: 'translateX(-50%)' }}
                />
            </div>

            <div className="flex-1 w-full px-12 flex justify-between items-center bg-gradient-to-t from-black/40 to-transparent relative">

                {/* Playback Queue Popover */}
                {showQueue && (
                    <div className="absolute bottom-[110px] right-12 w-96 bg-surface-container-highest rounded-[2.5rem] shadow-2xl border border-white/10 p-8 animate-zoom-in backdrop-blur-3xl z-[60]">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h6 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Up Next</h6>
                                <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">{playlist.length} Tracks in Sequence</p>
                            </div>
                            <button onClick={() => setShowQueue(false)} className="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center transition-all">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2 pb-4">
                            {playlist.length > 0 ? (
                                playlist.map((song, idx) => {
                                    const isCurrent = song.id === currentSong?.id;
                                    return (
                                        <div
                                            key={`${song.id}-${idx}`}
                                            className={`flex items-center gap-4 p-3 rounded-2xl group transition-all border ${isCurrent ? 'bg-primary/10 border-primary/20' : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/5'}`}
                                        >
                                            {/* Command Center - Up/Down */}
                                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    disabled={idx === 0}
                                                    onClick={() => moveItem(idx, 'up')}
                                                    className="p-1 hover:bg-primary/20 rounded-lg text-on-surface-variant hover:text-primary disabled:opacity-0 transition-all"
                                                >
                                                    <ChevronUp size={16} />
                                                </button>
                                                <button
                                                    disabled={idx === playlist.length - 1}
                                                    onClick={() => moveItem(idx, 'down')}
                                                    className="p-1 hover:bg-primary/20 rounded-lg text-on-surface-variant hover:text-primary disabled:opacity-0 transition-all"
                                                >
                                                    <ChevronDown size={16} />
                                                </button>
                                            </div>

                                            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg border border-white/5 relative shrink-0 cursor-pointer" onClick={() => play(song)}>
                                                <img src={getAlbumImg(song)} className="w-full h-full object-cover" />
                                                {isCurrent && (
                                                    <div className="absolute inset-0 bg-primary/40 flex items-center justify-center">
                                                        <div className="flex gap-0.5 items-end h-4">
                                                            <div className="w-1 bg-white animate-pulse h-full" />
                                                            <div className="w-1 bg-white animate-pulse h-2/3 [animation-delay:0.2s]" />
                                                            <div className="w-1 bg-white animate-pulse h-1/2 [animation-delay:0.4s]" />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => play(song)}>
                                                <p className={`text-sm font-bold truncate ${isCurrent ? 'text-primary' : 'text-white'}`}>{getSongName(song)}</p>
                                                <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant opacity-40 truncate">
                                                    Cloud Index ID: {song.id}
                                                </p>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => play(song)}>
                                                <PlayCircle size={18} className="text-primary" />
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="py-12 text-center opacity-20">
                                    <Music2 size={32} className="mx-auto mb-2" />
                                    <p className="text-xs font-bold uppercase">Queue is empty</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Artist Credits Popover */}
                {showArtists && currentSong && (
                    <div className="absolute bottom-[110px] left-12 w-80 bg-surface-container-highest rounded-[2rem] shadow-2xl border border-white/10 p-6 animate-zoom-in backdrop-blur-3xl z-[60]">
                        <div className="flex justify-between items-center mb-6">
                            <h6 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Song Collaborators</h6>
                            <button onClick={() => setShowArtists(false)} className="text-on-surface-variant hover:text-white transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                            {singersList.length > 0 ? (
                                singersList.map(artist => (
                                    <div 
                                        key={artist?.id} 
                                        onClick={() => artist?.id && setActiveArtistId(artist.id)}
                                        className="flex items-center gap-4 group cursor-pointer hover:bg-white/5 p-2 rounded-2xl transition-all active:scale-95"
                                    >
                                        <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg border border-white/5 transition-transform group-hover:scale-110">
                                            <img src={artist?.artist_image} className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{artist?.artist_name}</p>
                                            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">Vocalist</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center opacity-20">
                                    <UserCircle size={32} className="mx-auto mb-2" />
                                    <p className="text-xs font-bold uppercase">No data found</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Playlist Selector Popover */}
                {showPlaylistMenu && currentSong && (
                    <div className="absolute bottom-[110px] right-1/4 w-72 bg-surface-container-highest rounded-[2.5rem] shadow-2xl border border-white/10 p-6 animate-zoom-in backdrop-blur-3xl z-[60]">
                        <div className="flex justify-between items-center mb-6">
                            <h6 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">Add to Vault</h6>
                            <button onClick={() => setShowPlaylistMenu(false)} className="text-on-surface-variant hover:text-white transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                            {Object.keys(data.playlists).length > 0 ? (
                                Object.keys(data.playlists).map(name => {
                                    const isIncluded = data.playlists[name].includes(currentSong.id);
                                    return (
                                        <button
                                            key={name}
                                            onClick={() => toggleInPlaylist(name)}
                                            className={`w-full flex items-center justify-between p-3 rounded-2xl border transition-all ${isIncluded ? 'bg-secondary/10 border-secondary/20 shadow-lg shadow-secondary/5' : 'bg-surface-container border-white/5 hover:bg-white/5 hover:border-white/20'}`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Disc size={14} className={isIncluded ? 'text-secondary' : 'text-on-surface-variant'} />
                                                <p className={`text-xs font-bold truncate ${isIncluded ? 'text-secondary' : 'text-white'}`}>{name}</p>
                                            </div>
                                            {isIncluded && <CheckCircle2 size={14} className="text-secondary" />}
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="py-8 text-center opacity-20">
                                    <ListPlus size={32} className="mx-auto mb-2" />
                                    <p className="text-xs font-bold uppercase">No playlists found</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Track Info */}
                <div className="flex items-center gap-5 w-1/4 min-w-0">
                    {currentSong ? (
                        <>
                            <div className="relative group shrink-0">
                                <img
                                    src={getAlbumImg(currentSong)}
                                    alt={getSongName(currentSong)}
                                    className="w-16 h-16 rounded-xl object-cover shadow-2xl transition-transform group-hover:scale-105 cursor-pointer"
                                    onClick={() => navigate('/now-playing')}
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center pointer-events-none">
                                    <Maximize2 size={20} className="text-white" />
                                </div>
                            </div>
                            <div className="min-w-0">
                                <h5 className="text-[15px] font-black tracking-tight truncate mb-1 text-on-surface">
                                    {getSongName(currentSong)}
                                </h5>
                                <p
                                    onClick={() => setShowArtists(!showArtists)}
                                    className="text-[10px] font-extrabold text-on-surface-variant/60 uppercase tracking-widest truncate cursor-pointer hover:text-primary hover:opacity-100 transition-all active:scale-95"
                                >
                                    {singersText}
                                </p>
                            </div>
                            <div className="w-10 h-10 flex items-center justify-center relative shrink-0">
                                {isSyncingFav ? (
                                    <div className="flex gap-1 items-center">
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                                        <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                                    </div>
                                ) : (
                                    <button
                                        onClick={toggleLike}
                                        className={`transition-all hover:scale-125 active:scale-90 ${isLiked ? 'text-error animate-scale-in' : 'text-on-surface-variant hover:text-error'}`}
                                    >
                                        <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
                                    </button>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center gap-4 opacity-20">
                            <div className="w-14 h-14 rounded-xl bg-surface-container-highest animate-pulse" />
                            <div className="space-y-2">
                                <div className="w-24 h-3 bg-white/20 rounded-full" />
                                <div className="w-32 h-2 bg-white/10 rounded-full" />
                            </div>
                        </div>
                    )}
                </div>

                {/* Playback Controls */}
                <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-10">
                        <button
                            onClick={toggleShuffle}
                            className={`transition-all hover:scale-110 active:scale-95 ${shuffleMode ? 'text-primary' : 'text-on-surface-variant/40 hover:text-on-surface'}`}
                        >
                            <Shuffle size={20} />
                        </button>
                        <button
                            onClick={prev}
                            className="text-on-surface-variant hover:text-on-surface transition-all hover:scale-110 active:scale-90"
                        >
                            <SkipBack size={28} fill="currentColor" />
                        </button>
                        <button
                            onClick={togglePlay}
                            className="w-14 h-14 bg-primary text-on-primary-fixed rounded-full flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all"
                        >
                            {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                        </button>
                        <button
                            onClick={next}
                            className="text-on-surface-variant hover:text-on-surface transition-all hover:scale-110 active:scale-90"
                        >
                            <SkipForward size={28} fill="currentColor" />
                        </button>
                        <button
                            onClick={toggleRepeat}
                            className={`transition-all hover:scale-110 active:scale-95 ${repeatMode !== 'off' ? 'text-primary' : 'text-on-surface-variant/40 hover:text-on-surface'}`}
                        >
                            {repeatMode === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
                        </button>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] font-black text-on-surface-variant/40 tracking-widest font-mono">
                        <span>{formatTime(progress)}</span>
                        <div className="w-1 h-1 bg-white/10 rounded-full" />
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* System Utilities */}
                <div className="flex items-center justify-end gap-6 w-1/4">
                    <button
                        onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
                        className={`transition-colors hover:scale-110 active:scale-95 ${showPlaylistMenu ? 'text-secondary' : 'text-on-surface-variant hover:text-secondary'}`}
                    >
                        <ListPlus size={20} />
                    </button>

                    <button
                        onClick={() => setShowQueue(!showQueue)}
                        className={`transition-all hover:scale-110 active:scale-95 ${showQueue ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`}
                    >
                        <ListMusic size={20} />
                    </button>
                    <div className="flex items-center gap-3">
                        <Volume2 size={18} className="text-on-surface-variant/60" />
                        <div
                            className="w-24 h-1 bg-white/5 rounded-full overflow-hidden relative cursor-pointer"
                            onClick={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const percent = (e.clientX - rect.left) / rect.width;
                                setVolume(Math.max(0, Math.min(1, percent)));
                            }}
                        >
                            <div className="absolute h-full bg-on-surface-variant/30" style={{ width: `${volume * 100}%` }} />
                        </div>
                    </div>
                    {!isNowPlaying && (
                        <button onClick={() => navigate('/now-playing')} className="text-on-surface-variant hover:text-primary transition-all"><Maximize2 size={20} /></button>
                    )}
                </div>
            </div>
        </footer>
    );
}
