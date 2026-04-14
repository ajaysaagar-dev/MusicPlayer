import { usePlayer } from '../context/PlayerContext';
import { useDatabase } from '../context/DatabaseContext';
import { Shuffle, Play, Clock, Activity, CloudOff } from 'lucide-react';
import type { Song as GHSong } from '../types';

export default function Songs() {
  const { play, currentSong, isPlaying } = usePlayer();
  const { data, isInitialized } = useDatabase();

  // Determine which data to use
  const tracks = isInitialized ? data.songs : [];

  const getArtistNames = (artistIds: string[]) => {
    if (!artistIds || artistIds.length === 0) return 'Various Artists';
    return artistIds
      .map(id => data.artists.find(a => a.id === id)?.artist_name || 'Unknown Artist')
      .join(', ');
  };

  const getAlbumName = (albumId: string) => {
    return data.albums.find(a => a.id === albumId)?.albumname || 'Single';
  };

  const getAlbumImage = (albumId: string) => {
    return data.albums.find(a => a.id === albumId)?.albumimage || '';
  };

  const handlePlaySong = (song: any, index: number) => {
    void index;
    // Map GHSong to Player Song format if necessary, 
    // but for now we'll assume compatibility or pass as is
    play(song, tracks);
  };

  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
        <div className="w-20 h-20 rounded-3xl bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-6 shadow-xl">
          <CloudOff size={40} />
        </div>
        <h2 className="text-3xl font-black font-headline mb-3">Sync Required</h2>
        <p className="text-on-surface-variant max-w-md mb-8">
          Your high-performance cloud vault is not connected. 
          Initialize your GitHub database to access your lossless collection.
        </p>
        <a 
          href="/database" 
          className="px-8 py-3 bg-primary text-on-primary-fixed rounded-full font-bold hover:brightness-110 transition-all"
        >
          Go to Database
        </a>
      </div>
    );
  }

  return (
    <div className="px-2 pb-20">
      <section className="mb-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-secondary font-label text-sm font-bold tracking-[0.2em] uppercase">
              Cloud Archive
            </span>
            <h1 className="text-6xl font-headline font-extrabold tracking-tighter mt-2 text-on-surface">
              Vault Index
            </h1>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => {
                const shuffled = [...tracks].sort(() => Math.random() - 0.5);
                if (shuffled.length > 0) play(shuffled[0], shuffled);
              }}
              className="flex items-center justify-center bg-surface-container-high hover:bg-surface-bright w-14 h-14 rounded-full transition-all text-zinc-300 border border-white/5 active:scale-95"
            >
              <Shuffle size={24} />
            </button>
            <button
              onClick={() => tracks.length > 0 && play(tracks[0], tracks)}
              className="flex items-center justify-center bg-gradient-to-br from-primary to-primary-container text-on-primary-container w-14 h-14 rounded-full transition-all shadow-xl shadow-primary/10 active:scale-95"
            >
              <Play size={24} fill="currentColor" />
            </button>
          </div>
        </div>

        {/* Tracks Table */}
        <div className="bg-surface-container/30 backdrop-blur-xl rounded-[2rem] overflow-hidden ghost-border animate-fade-in">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-on-surface-variant text-[10px] font-bold uppercase tracking-[0.2em] border-b border-white/5">
                <th className="px-6 py-6 w-16">#</th>
                <th className="px-6 py-6">Composition</th>
                <th className="px-6 py-6">Artists</th>
                <th className="px-6 py-6">Collection</th>
                <th className="px-6 py-6 text-right">
                  <Clock size={16} className="inline opacity-40" />
                </th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {tracks.map((song, i) => {
                const isCurrentlyPlaying = currentSong?.id === song.id && isPlaying;
                const albumImg = getAlbumImage(song.albumid);
                
                return (
                  <tr
                    key={song.id}
                    className={`group hover:bg-white/5 transition-all cursor-pointer ${
                      currentSong?.id === song.id ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => handlePlaySong(song, i)}
                  >
                    <td className="px-6 py-5 text-on-surface-variant w-16 font-mono text-xs">
                      {isCurrentlyPlaying ? (
                        <div className="flex items-end gap-0.5 h-3">
                           <div className="w-1 bg-primary animate-bounce" style={{animationDelay: '0s', height: '100%'}} />
                           <div className="w-1 bg-primary animate-bounce" style={{animationDelay: '0.2s', height: '60%'}} />
                           <div className="w-1 bg-primary animate-bounce" style={{animationDelay: '0.1s', height: '80%'}} />
                        </div>
                      ) : (
                        <span className="group-hover:hidden tracking-tighter">
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      )}
                      {!isCurrentlyPlaying && (
                        <Play size={16} className="hidden group-hover:block text-primary" fill="currentColor" />
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl overflow-hidden bg-surface-container-highest shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                          {albumImg ? (
                             <img className="w-full h-full object-cover" src={albumImg} alt={song.songname} />
                          ) : (
                             <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-surface-container-highest to-surface-container text-primary/40 font-black italic">
                               M
                             </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className={`font-bold truncate text-base ${currentSong?.id === song.id ? 'text-primary' : 'text-on-surface'}`}>
                            {song.songname}
                          </p>
                          <p className="text-[10px] text-on-surface-variant mt-0.5 uppercase tracking-widest font-bold opacity-60">
                            Hi-Res Lossless
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-medium text-on-surface/80">
                        {getArtistNames(song.singers)}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                       <p className="text-sm font-medium text-on-surface-variant">
                        {getAlbumName(song.albumid)}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-right font-mono text-xs opacity-40">
                      --:--
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {tracks.length === 0 && (
            <div className="p-20 text-center">
              <p className="text-on-surface-variant font-medium">No tracks found in your vault.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
