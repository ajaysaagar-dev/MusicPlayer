import { usePlayer } from '../context/PlayerContext';
import { useDatabase } from '../context/DatabaseContext';
import { X, PlayCircle, Music2, PauseCircle } from 'lucide-react';

export default function ArtistDetailOverlay() {
    const { activeArtistId, setActiveArtistId, currentSong, isPlaying, play, togglePlay } = usePlayer();
    const { data } = useDatabase();

    if (!activeArtistId) return null;

    const artist = data.artists.find(a => a.id === activeArtistId);
    if (!artist) return null;

    const artistSongs = data.songs.filter(s => {
        const isSinger = s.singers && s.singers.includes(activeArtistId);
        const album = data.albums.find(a => a.id === s.albumid);
        const isComposer = album?.composerids && album.composerids.includes(activeArtistId);
        return isSinger || isComposer;
    });

    const getAlbumImg = (s: any) => {
        if (s.albumid) {
            return data.albums.find(a => a.id === s.albumid)?.albumimage || s.imageUrl;
        }
        return s.imageUrl;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
            <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl animate-fade-in" onClick={() => setActiveArtistId(null)} />
            
            <div className="relative bg-surface-container-highest w-full max-w-5xl rounded-[4rem] shadow-2xl border border-white/10 overflow-hidden animate-zoom-in flex flex-col md:flex-row h-[80vh]">
                
                {/* Left: Artist Info */}
                <div className="w-full md:w-1/2 relative h-full group">
                    <img 
                        src={artist.artist_image} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                        alt={artist.artist_name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    
                    <div className="absolute bottom-16 left-16 right-16">
                        <h2 className="text-[5rem] font-black font-headline text-white leading-none tracking-tighter mb-4 drop-shadow-2xl">
                            {artist.artist_name}
                        </h2>
                        <p className="text-xs font-black uppercase tracking-[0.4em] text-primary mb-8">
                            Artist Profile
                        </p>
                        
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={() => {
                                    if (artistSongs.length > 0) play(artistSongs[0], artistSongs);
                                }}
                                className="px-10 py-4 bg-primary text-on-primary-fixed rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/20"
                            >
                                Play All Songs
                            </button>
                        </div>
                    </div>

                    <button 
                        onClick={() => setActiveArtistId(null)}
                        className="absolute top-10 left-10 w-12 h-12 rounded-full bg-black/20 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all z-10"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Right: Songs List */}
                <div className="w-full md:w-1/2 h-full flex flex-col p-12 overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xs font-black uppercase tracking-[0.5em] text-on-surface-variant opacity-40">
                            Discography ({artistSongs.length})
                        </h3>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-3">
                        {artistSongs.length > 0 ? (
                            artistSongs.map((song, idx) => {
                                const isCurrent = song.id === currentSong?.id;
                                return (
                                    <div 
                                        key={song.id}
                                        className={`flex items-center gap-6 p-4 rounded-3xl transition-all group/item border ${isCurrent ? 'bg-primary/10 border-primary/20' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                                    >
                                        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg relative shrink-0">
                                            <img src={getAlbumImg(song)} className="w-full h-full object-cover" alt="" />
                                            <button 
                                                onClick={() => play(song, artistSongs)}
                                                className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${isCurrent ? 'opacity-100' : 'opacity-0 group-hover/item:opacity-100'}`}
                                            >
                                                {isCurrent && isPlaying ? (
                                                    <PauseCircle size={32} className="text-white" onClick={(e) => { e.stopPropagation(); togglePlay(); }} />
                                                ) : (
                                                    <PlayCircle size={32} className="text-white" />
                                                )}
                                            </button>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-base font-black truncate ${isCurrent ? 'text-primary' : 'text-white'}`}>
                                                {song.songname || song.songName}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <p className="text-[10px] font-bold text-on-surface-variant opacity-40 uppercase tracking-widest truncate">
                                                    Track {idx + 1}
                                                </p>
                                                {(() => {
                                                    const isS = song.singers?.includes(activeArtistId);
                                                    const alb = data.albums.find(a => a.id === song.albumid);
                                                    const isC = alb?.composerids?.includes(activeArtistId);
                                                    return (
                                                        <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-white/5 text-primary/60 uppercase tracking-tighter">
                                                            {[isS && 'Vocalist', isC && 'Composer'].filter(Boolean).join(' • ')}
                                                        </span>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center opacity-20">
                                <Music2 size={48} className="mb-4" />
                                <p className="text-xs font-black uppercase tracking-widest">No songs cataloged</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
