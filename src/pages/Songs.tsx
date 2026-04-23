import { usePlayer } from '../context/PlayerContext';
import { useDatabase } from '../context/DatabaseContext';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shuffle, Play, Clock, Activity, CloudOff, Edit2, ListPlus, Share2, CloudLightning, Disc, Zap, X, Save, Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

export default function Songs() {
  const { play, currentSong, isPlaying, setActiveArtistId, setActiveAlbumId } = usePlayer();
  const { data, isInitialized } = useDatabase();
  const navigate = useNavigate();
  const location = useLocation();

  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, song: GHSong | null } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState<any>(null);
  const [artistSearch, setArtistSearch] = useState('');
  const [albumSearch, setAlbumSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;
  
  const menuRef = useRef<HTMLDivElement>(null);
  const searchQuery = location.state?.query || '';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const handleContextMenu = (e: React.MouseEvent, song: GHSong) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, song });
  };

  // Determine which data to use and filter
  const filteredTracks = useMemo(() => {
    if (!isInitialized) return [];
    if (!searchQuery) return data.songs;
    return data.songs.filter(s => 
       s.songname.toLowerCase().includes(searchQuery.toLowerCase()) ||
       data.artists.filter(a => s.singers.includes(a.id)).some(a => a.artist_name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [isInitialized, data.songs, searchQuery, data.artists]);

  const totalPages = Math.ceil(filteredTracks.length / ITEMS_PER_PAGE);
  const paginatedTracks = filteredTracks.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page on search
  }, [searchQuery]);

  const renderArtistNames = (artistIds: string[]) => {
    if (!artistIds || artistIds.length === 0) return <span className="opacity-40">Various Artists</span>;
    return artistIds.map((id, idx) => {
      const artist = data.artists.find(a => a.id === id);
      return (
        <span key={id}>
          <span 
            onClick={(e) => { e.stopPropagation(); setActiveArtistId(id); }}
            className="hover:text-primary hover:underline underline-offset-4 cursor-pointer transition-colors"
          >
            {artist?.artist_name || 'Unknown Artist'}
          </span>
          {idx < artistIds.length - 1 && <span className="opacity-40">, </span>}
        </span>
      );
    });
  };

  const getAlbumName = (albumId: string) => {
    return data.albums.find(a => a.id === albumId)?.albumname || 'Single';
  };

  const getAlbumImage = (albumId: string) => {
    return data.albums.find(a => a.id === albumId)?.albumimage || '';
  };

  const handlePlaySong = (song: any) => {
    play(song, filteredTracks);
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
                const shuffled = [...filteredTracks].sort(() => Math.random() - 0.5);
                if (shuffled.length > 0) play(shuffled[0], shuffled);
              }}
              className="flex items-center justify-center bg-surface-container-high hover:bg-surface-bright w-14 h-14 rounded-full transition-all text-zinc-300 border border-white/5 active:scale-95"
            >
              <Shuffle size={24} />
            </button>
            <button
              onClick={() => filteredTracks.length > 0 && play(filteredTracks[0], filteredTracks)}
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
              {paginatedTracks.map((song, i) => {
                const isCurrentlyPlaying = currentSong?.id === song.id && isPlaying;
                const albumImg = getAlbumImage(song.albumid);
                const globalIndex = (currentPage - 1) * ITEMS_PER_PAGE + i + 1;
                
                return (
                  <tr
                    key={song.id}
                    className={`group hover:bg-white/5 transition-all cursor-pointer ${
                      currentSong?.id === song.id ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => handlePlaySong(song)}
                    onContextMenu={(e) => handleContextMenu(e, song)}
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
                          {String(globalIndex).padStart(2, '0')}
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
                          <div className="flex items-center gap-2">
                             <p className={`font-bold truncate text-base ${currentSong?.id === song.id ? 'text-primary' : 'text-on-surface'}`}>
                               {song.songname}
                             </p>
                             {song.isVideoEnabled && song.videourl && (
                               <div className="px-1.5 py-0.5 rounded-md bg-primary/20 border border-primary/30 flex items-center gap-1 animate-pulse">
                                 <CloudLightning size={8} className="text-primary" />
                                 <span className="text-[7px] font-black text-primary uppercase tracking-widest">Video</span>
                               </div>
                             )}
                          </div>
                          <p className="text-[10px] text-on-surface-variant mt-0.5 uppercase tracking-widest font-bold opacity-60">
                            Hi-Res Lossless
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-medium text-on-surface/80">
                        {renderArtistNames(song.singers)}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                       <button 
                        onClick={(e) => { e.stopPropagation(); setActiveAlbumId(song.albumid); }}
                        className="text-sm font-medium text-on-surface-variant hover:text-primary transition-colors text-left"
                       >
                        {getAlbumName(song.albumid)}
                      </button>
                    </td>
                    <td className="px-6 py-5 text-right font-mono text-xs opacity-40">
                      --:--
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-10 py-8 bg-black/20 border-t border-white/5">
               <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">
                  Showing {Math.min(filteredTracks.length, (currentPage - 1) * ITEMS_PER_PAGE + 1)} - {Math.min(filteredTracks.length, currentPage * ITEMS_PER_PAGE)} of {filteredTracks.length} tracks
               </p>
               <div className="flex items-center gap-4">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className="w-10 h-10 rounded-full flex items-center justify-center border border-white/5 hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <div className="flex items-center gap-2">
                     {[...Array(totalPages)].map((_, i) => (
                        <button 
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-primary text-on-primary-fixed shadow-lg shadow-primary/20' : 'hover:bg-white/5 text-on-surface-variant'}`}
                        >
                           {i + 1}
                        </button>
                     ))}
                  </div>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className="w-10 h-10 rounded-full flex items-center justify-center border border-white/5 hover:bg-white/5 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
               </div>
            </div>
          )}

          {filteredTracks.length === 0 && (
            <div className="p-20 text-center">
              <p className="text-on-surface-variant font-medium">No matches found in your vault index.</p>
            </div>
          )}
        </div>
      </section>

      {/* Context Menu */}
      {contextMenu && (
        <div 
          ref={menuRef}
          className="fixed z-[100] w-64 bg-surface-container-highest/90 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-zoom-in"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
           <div className="p-2 border-b border-white/5">
              <p className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">Track Options</p>
           </div>
           <div className="p-1.5">
              <button 
                onClick={() => {
                   setCurrentEditItem({ ...contextMenu.song });
                   setIsEditing(true);
                   setContextMenu(null);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-primary/10 hover:text-primary transition-all text-sm font-bold group"
              >
                 <Edit2 size={16} className="opacity-40 group-hover:opacity-100" />
                 Edit Track Data
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-sm font-bold group opacity-40 cursor-not-allowed">
                 <ListPlus size={16} className="opacity-40" />
                 Add to Playlist
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all text-sm font-bold group opacity-40 cursor-not-allowed">
                 <Share2 size={16} className="opacity-40" />
                 Share Source
              </button>
           </div>
        </div>
      )}

      {/* In-Place Editor Modal */}
      {isEditing && currentEditItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-8">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-fade-in" onClick={() => setIsEditing(false)} />
           <div className="relative bg-surface-container-highest w-full max-w-2xl rounded-[3rem] shadow-2xl border border-white/10 overflow-hidden animate-zoom-in">
              <div className="px-10 py-8 border-b border-white/5 flex justify-between items-center bg-surface-container">
                 <div>
                    <h4 className="text-2xl font-black font-headline">Manage Track</h4>
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">Record Identifier: {currentEditItem.id}</p>
                 </div>
                 <button onClick={() => setIsEditing(false)} className="w-12 h-12 rounded-full hover:bg-white/5 flex items-center justify-center transition-all text-on-surface-variant"><X /></button>
              </div>

              <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                 <div className="space-y-2">
                    <label className="text-[10px] uppercase font-black text-on-surface-variant ml-1">Track Title</label>
                    <input 
                      value={currentEditItem.songname} 
                      onChange={e => setCurrentEditItem({ ...currentEditItem, songname: e.target.value })} 
                      className="w-full bg-surface-container border border-white/5 rounded-2xl p-5 text-sm focus:outline-none focus:border-primary/40 font-bold" 
                    />
                 </div>

                 {/* Reusable Selector Logic (Simplified for Songs Page) */}
                 <div className="space-y-4">
                    <label className="text-[10px] uppercase font-black text-on-surface-variant ml-1">Collaborators</label>
                    <div className="flex flex-wrap gap-2">
                       {data.artists.filter(a => currentEditItem.singers.includes(a.id)).map(art => (
                          <button key={art.id} onClick={() => setCurrentEditItem({...currentEditItem, singers: currentEditItem.singers.filter((id: string) => id !== art.id)})} className="flex items-center gap-2 px-2 py-1.5 rounded-full border bg-primary/20 border-primary/40 text-primary text-[10px] font-black uppercase tracking-tight transition-all hover:bg-error/10 hover:border-error/40 hover:text-error group">
                             <img src={art.artist_image} className="w-6 h-6 rounded-full object-cover" />
                             {art.artist_name}
                             <X size={10} className="opacity-0 group-hover:opacity-100" />
                          </button>
                       ))}
                       <div className="relative flex-1 min-w-[200px]">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-30" size={14} />
                          <input 
                            placeholder="Search artists..."
                            value={artistSearch}
                            onChange={(e) => setArtistSearch(e.target.value)}
                            className="w-full bg-surface-container-low border border-white/5 rounded-full py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-primary/40 font-bold"
                          />
                          {artistSearch && (
                             <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-highest border border-white/10 rounded-2xl shadow-2xl z-50 max-h-48 overflow-y-auto p-2">
                                {data.artists.filter(a => a.artist_name.toLowerCase().includes(artistSearch.toLowerCase()) && !currentEditItem.singers.includes(a.id)).map(a => (
                                   <button key={a.id} onClick={() => { setCurrentEditItem({...currentEditItem, singers: [...currentEditItem.singers, a.id]}); setArtistSearch(''); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-xs font-bold text-left">
                                      <img src={a.artist_image} className="w-8 h-8 rounded-full object-cover" />
                                      {a.artist_name}
                                   </button>
                                ))}
                             </div>
                          )}
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <label className="text-[10px] uppercase font-black text-on-surface-variant ml-1">Album Link</label>
                    <div className="relative group">
                       <input 
                         placeholder="Search albums..." 
                         value={albumSearch || data.albums.find(a => a.id === currentEditItem.albumid)?.albumname || ''} 
                         onChange={(e) => setAlbumSearch(e.target.value)}
                         className="w-full bg-surface-container border border-white/5 rounded-2xl p-5 text-sm focus:outline-none focus:border-primary/40 font-bold" 
                       />
                       {albumSearch && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-highest border border-white/10 rounded-2xl shadow-2xl z-50 max-h-48 overflow-y-auto p-2">
                             {data.albums.filter(a => a.albumname.toLowerCase().includes(albumSearch.toLowerCase())).map(a => (
                                <button key={a.id} onClick={() => { setCurrentEditItem({...currentEditItem, albumid: a.id}); setAlbumSearch(''); }} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 text-xs font-bold text-left">
                                   <img src={a.albumimage} className="w-8 h-8 rounded-lg object-cover" />
                                   {a.albumname}
                                </button>
                             ))}
                          </div>
                       )}
                    </div>
                 </div>

                 <div className="space-y-2"><label className="text-[10px] uppercase font-black text-on-surface-variant ml-1">Stream URL (.mp3)</label><input value={currentEditItem.songurl} onChange={e => setCurrentEditItem({ ...currentEditItem, songurl: e.target.value })} className="w-full bg-surface-container border border-white/5 rounded-2xl p-5 text-sm focus:outline-none focus:border-primary/40 font-bold" /></div>

                 <div className="pt-4 border-t border-white/5 space-y-6">
                    <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-2xl border border-white/5">
                       <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl ${currentEditItem.isVideoEnabled ? 'bg-primary/20 text-primary' : 'bg-white/5 text-on-surface-variant opacity-40'}`}>
                             <CloudLightning size={20} />
                          </div>
                          <div><p className="text-xs font-bold">Cinema Mode</p><p className="text-[10px] text-on-surface-variant opacity-50">YouTube background</p></div>
                       </div>
                       <button onClick={() => setCurrentEditItem({...currentEditItem, isVideoEnabled: !currentEditItem.isVideoEnabled})} className={`w-12 h-6 rounded-full transition-all relative ${currentEditItem.isVideoEnabled ? 'bg-primary' : 'bg-white/10'}`}><div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${currentEditItem.isVideoEnabled ? 'left-7' : 'left-1'}`} /></button>
                    </div>
                    {currentEditItem.isVideoEnabled && (
                       <div className="space-y-2 animate-fade-in"><label className="text-[10px] uppercase font-black text-on-surface-variant ml-1">YouTube Video URL</label><input value={currentEditItem.videourl || ''} placeholder="https://..." onChange={e => setCurrentEditItem({...currentEditItem, videourl: e.target.value})} className="w-full bg-surface-container border border-white/5 rounded-2xl p-5 text-sm focus:outline-none focus:border-primary/40 font-bold" /></div>
                    )}
                 </div>
              </div>

              <div className="p-10 border-t border-white/5 bg-surface-container">
                 <button 
                   onClick={() => {
                      const updatedSongs = data.songs.map((s: GHSong) => s.id === currentEditItem.id ? currentEditItem : s);
                      data.updateSongs(updatedSongs);
                      setIsEditing(false);
                   }}
                   className="w-full py-5 rounded-2xl bg-primary text-on-primary-fixed font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-primary/20"
                 >
                    <Save size={18} /> Update Track Data
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
