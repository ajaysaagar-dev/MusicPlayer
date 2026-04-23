import { usePlayer } from '../context/PlayerContext';
import { useDatabase } from '../context/DatabaseContext';
import { X, PlayCircle, PauseCircle, Shuffle, Music2 } from 'lucide-react';
import { useState } from 'react';

export default function AlbumDetailOverlay() {
    const { activeAlbumId, setActiveAlbumId, currentSong, isPlaying, play, togglePlay } = usePlayer();
    const { data } = useDatabase();
    const [shufflePlayback, setShufflePlayback] = useState(false);

    if (!activeAlbumId) return null;

    const album = data.albums.find(a => a.id === activeAlbumId);
    if (!album) return null;

    const albumSongs = data.songs.filter(s => s.albumid === activeAlbumId);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl animate-fade-in" onClick={() => setActiveAlbumId(null)} />
            <div className="relative bg-surface-container-highest w-full max-w-5xl rounded-[4rem] shadow-2xl border border-white/10 overflow-hidden animate-zoom-in flex flex-col md:flex-row h-[80vh]">
                {/* Left: Artwork & Controls */}
                <div className="w-full md:w-1/2 relative h-full group">
                    <img 
                        src={album.albumimage} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        alt={album.albumname}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    
                    <div className="absolute bottom-16 left-16 right-16">
                        <h2 className="text-[5rem] font-black font-headline text-white leading-none tracking-tighter mb-4 drop-shadow-2xl">
                            {album.albumname}
                        </h2>
                        <p className="text-xs font-black uppercase tracking-[0.4em] text-primary mb-8">
                            Collection Archive • {album.year}
                        </p>
                        
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => {
                                    if (albumSongs.length > 0) play(albumSongs[0], albumSongs);
                                }}
                                className="px-10 py-4 bg-primary text-on-primary-fixed rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
                            >
                                Play All
                            </button>
                            <button 
                                onClick={() => {
                                    const shuffled = [...albumSongs].sort(() => Math.random() - 0.5);
                                    if (shuffled.length > 0) play(shuffled[0], shuffled);
                                }}
                                className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all active:scale-90"
                            >
                                <Shuffle size={20} />
                            </button>
                        </div>
                    </div>

                    <button 
                        onClick={() => setActiveAlbumId(null)}
                        className="absolute top-10 left-10 w-12 h-12 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all z-10"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Right: Songs List */}
                <div className="w-full md:w-1/2 h-full flex flex-col p-12 overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xs font-black uppercase tracking-[0.5em] text-on-surface-variant opacity-40">
                            Tracklist Index ({albumSongs.length})
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-3">
                        {albumSongs.map((song, idx) => {
                            const isCurrent = song.id === currentSong?.id;
                            return (
                                <div 
                                    key={song.id}
                                    className={`flex items-center gap-6 p-4 rounded-3xl transition-all group/item border ${isCurrent ? 'bg-primary/10 border-primary/20' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                                >
                                    <div className="w-12 h-12 rounded-2xl overflow-hidden shadow-lg relative shrink-0">
                                        <img src={album.albumimage} className="w-full h-full object-cover opacity-60" alt="" />
                                        <button 
                                            onClick={() => play(song, albumSongs)}
                                            className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover/item:opacity-100'}`}
                                        >
                                            {isCurrent && isPlaying ? (
                                                <PauseCircle size={28} className="text-white" onClick={(e) => { e.stopPropagation(); togglePlay(); }} />
                                            ) : (
                                                <PlayCircle size={28} className="text-white" />
                                            )}
                                        </button>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-base font-black truncate ${isCurrent ? 'text-primary' : 'text-white'}`}>
                                            {song.songname}
                                        </p>
                                        <p className="text-[10px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest truncate">
                                            Track {idx + 1}
                                        </p>
                                    </div>
                                    {isCurrent && (
                                        <div className="flex gap-1 items-end h-4 pb-1">
                                            <div className="w-1 bg-primary animate-pulse h-full" />
                                            <div className="w-1 bg-primary animate-pulse h-2/3 [animation-delay:0.2s]" />
                                            <div className="w-1 bg-primary animate-pulse h-1/2 [animation-delay:0.4s]" />
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
