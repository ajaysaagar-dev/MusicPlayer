import { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useDatabase } from '../context/DatabaseContext';
import { 
  Plus, 
  Play, 
  PlayCircle, 
  Library, 
  CloudOff, 
  X, 
  Search, 
  PlusCircle, 
  Trash2, 
  CheckCircle2, 
  Music,
  ArrowRight
} from 'lucide-react';
import type { Song } from '../types';

export default function Playlists() {
  const { play } = usePlayer();
  const { data, isInitialized, isLoading } = useDatabase();
  
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);
  const [isAddingSongs, setIsAddingSongs] = useState(false);
  const [songSearch, setSongSearch] = useState('');

  const playlistEntries = Object.entries(data.playlists);

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return;
    const newList = { ...data.playlists, [newPlaylistName.trim()]: [] };
    await data.updatePlaylists(newList);
    setNewPlaylistName('');
    setIsCreating(false);
  };

  const handleDeletePlaylist = async (name: string) => {
    const newList = { ...data.playlists };
    delete newList[name];
    await data.updatePlaylists(newList);
    if (selectedPlaylist === name) setSelectedPlaylist(null);
  };

  const handleToggleSong = async (playlistName: string, songId: string) => {
    const currentSongs = data.playlists[playlistName] || [];
    let newSongs;
    if (currentSongs.includes(songId)) {
        newSongs = currentSongs.filter(id => id !== songId);
    } else {
        newSongs = [...currentSongs, songId];
    }
    const newList = { ...data.playlists, [playlistName]: newSongs };
    await data.updatePlaylists(newList);
  };

  const getPlaylistDetails = (name: string, songIds: string[]) => {
    const playlistSongs = songIds
      .map(id => data.songs.find(s => s.id === id))
      .filter(Boolean);
    
    const firstSong = playlistSongs[0];
    const album = firstSong ? data.albums.find(a => a.id === (firstSong as any).albumid) : null;
    
    return {
      name,
      songs: playlistSongs as Song[],
      image: album?.albumimage || '',
      count: playlistSongs.length,
    };
  };

  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center px-4">
        <div className="w-20 h-20 rounded-3xl bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-6 shadow-xl">
          <CloudOff size={40} />
        </div>
        <h2 className="text-3xl font-black font-headline mb-3">Sync Required</h2>
        <p className="text-on-surface-variant max-w-md mb-8">
          Personalized playlists are locked in your cloud vault. 
          Initialize your GitHub database to begin curating.
        </p>
        <a href="/database" className="px-8 py-3 bg-primary text-on-primary-fixed rounded-full font-bold hover:brightness-110 transition-all">Go to Database</a>
      </div>
    );
  }

  const filteredSongs = data.songs.filter(s => s.songname.toLowerCase().includes(songSearch.toLowerCase()));

  return (
    <div className="px-4 pb-20">
      {/* Header Area */}
      <section className="mb-12">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-primary font-black tracking-[0.4em] text-[10px] uppercase mb-3 block opacity-60">High-Res Collections</span>
            <h2 className="text-7xl font-black font-headline tracking-tighter text-on-surface leading-tight">Your Vaults</h2>
          </div>
          <button 
            onClick={() => setIsCreating(true)}
            className="bg-gradient-to-br from-primary to-primary-container text-on-primary-fixed w-20 h-20 rounded-[2.5rem] flex items-center justify-center hover:scale-110 transition-all active:scale-95 shadow-2xl shadow-primary/20"
          >
            <Plus size={36} />
          </button>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-10">
        
        {/* Playlists sidebar-style list */}
        <div className="col-span-4 space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-on-surface-variant mb-6 opacity-40 px-4">Active Playlists</h3>
            {playlistEntries.map(([name, ids]) => {
                const details = getPlaylistDetails(name, ids);
                const isActive = selectedPlaylist === name;
                return (
                    <div 
                        key={name}
                        onClick={() => setSelectedPlaylist(name)}
                        className={`group p-4 rounded-3xl border transition-all cursor-pointer flex items-center gap-4 ${isActive ? 'bg-primary/10 border-primary shadow-xl scale-105' : 'bg-surface-container border-white/5 hover:border-white/10'}`}
                    >
                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-surface-container-highest shrink-0 shadow-lg relative">
                             {details.image ? <img src={details.image} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Library size={24} className="opacity-20"/></div>}
                             <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                 <PlayCircle size={28} className="text-white fill-primary" />
                             </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-lg truncate">{name}</h4>
                            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">{details.count} Tracks</p>
                        </div>
                        {name !== 'Liked' && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleDeletePlaylist(name); }}
                                className="p-3 opacity-0 group-hover:opacity-100 text-error/40 hover:text-error hover:bg-error/10 rounded-xl transition-all"
                            >
                                <Trash2 size={16}/>
                            </button>
                        )}
                    </div>
                );
            })}
        </div>

        {/* Selected Playlist View */}
        <div className="col-span-8">
            {selectedPlaylist ? (
                <div className="bg-surface-container rounded-[3rem] p-10 border border-white/5 animate-fade-in min-h-[500px] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-[0.03] rotate-12 pointer-events-none"><Music size={300} /></div>
                    
                    <div className="flex justify-between items-start mb-10 relative z-10">
                        <div>
                            <span className="px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">Collection Details</span>
                            <h3 className="text-5xl font-black font-headline tracking-tighter">{selectedPlaylist}</h3>
                            <p className="text-on-surface-variant font-bold uppercase tracking-widest text-xs mt-2">{data.playlists[selectedPlaylist]?.length || 0} lossless tracks curated</p>
                        </div>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setIsAddingSongs(true)}
                                className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 border border-white/5 transition-all"
                            >
                                <PlusCircle size={18}/> Manage Tracks
                            </button>
                            <button 
                                onClick={() => {
                                    const songs = data.playlists[selectedPlaylist]?.map(id => data.songs.find(s => s.id === id)).filter(Boolean);
                                    if (songs && songs[0]) play(songs[0] as any, songs as any);
                                }}
                                className="px-10 py-4 bg-primary text-on-primary-fixed rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                <Play size={18} fill="currentColor"/> Play Vault
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3 relative z-10">
                        {data.playlists[selectedPlaylist]?.length > 0 ? (
                            data.playlists[selectedPlaylist].map((songId, idx) => {
                                const song = data.songs.find(s => s.id === songId);
                                if (!song) return null;
                                return (
                                    <div key={songId} className="flex items-center gap-6 p-4 rounded-2xl bg-surface-container-low border border-white/5 group hover:bg-white/5 transition-all">
                                        <span className="w-6 font-mono text-[10px] opacity-30">{String(idx + 1).padStart(2, '0')}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm truncate">{song.songname}</p>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">Index ID: {song.id}</p>
                                        </div>
                                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button 
                                                onClick={() => handleToggleSong(selectedPlaylist, songId)} 
                                                className="p-2 text-error/60 hover:text-error hover:bg-error/10 rounded-lg transition-all"
                                                title="Remove from Vault"
                                            >
                                                <X size={16}/>
                                            </button>
                                            <button 
                                                onClick={() => play(song as any, data.playlists[selectedPlaylist].map(id => data.songs.find(s => s.id === id)).filter(Boolean) as any)} 
                                                className="p-2 text-primary hover:bg-primary/20 rounded-lg transition-all"
                                                title="Play Track"
                                            >
                                                <Play size={16} fill="currentColor"/>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem] opacity-20">
                                <Library size={48} className="mx-auto mb-4"/>
                                <p className="font-black uppercase tracking-[0.3em] text-sm">No songs in this collection</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center p-20 border-2 border-dashed border-white/5 rounded-[3.5rem] opacity-20 text-center">
                    <ArrowRight size={64} className="mb-6 animate-bounce-x" />
                    <h4 className="text-xl font-black uppercase tracking-[0.3em]">Select a Vault</h4>
                    <p className="text-sm font-bold mt-2">Choose a collection from the left sidebar to manage its contents</p>
                </div>
            )}
        </div>
      </div>

      {/* Modals */}
      
      {/* Create Modal */}
      {isCreating && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-3xl animate-fade-in" onClick={() => setIsCreating(false)} />
              <div className="relative bg-surface-container-highest w-full max-w-lg rounded-[3rem] shadow-2xl border border-white/10 overflow-hidden animate-zoom-in">
                  <div className="p-10 text-center">
                      <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mx-auto mb-8 transition-transform hover:rotate-12"><Library size={40} /></div>
                      <h4 className="text-3xl font-black font-headline tracking-tighter mb-2">New Collection</h4>
                      <p className="text-on-surface-variant font-bold uppercase tracking-widest text-[10px] opacity-60 mb-8">Establish a new musical vault</p>
                      <input 
                        autoFocus
                        placeholder="Vault Name (e.g., Midnight Lossless)"
                        value={newPlaylistName}
                        onChange={(e) => setNewPlaylistName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreatePlaylist()}
                        className="w-full bg-surface-container border border-white/5 rounded-2xl p-6 text-sm font-bold focus:outline-none focus:border-primary/40 text-center mb-8"
                      />
                      <div className="flex gap-4">
                          <button onClick={() => setIsCreating(false)} className="flex-1 py-5 rounded-2xl bg-white/5 hover:bg-white/10 font-bold transition-all text-sm">Discard</button>
                          <button onClick={handleCreatePlaylist} className="flex-[2] py-5 rounded-2xl bg-primary text-on-primary-fixed font-black uppercase tracking-widest text-xs hover:scale-[1.02] shadow-xl shadow-primary/20 transition-all">Initialize Vault</button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* Add Songs Modal */}
      {isAddingSongs && selectedPlaylist && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
               <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl animate-fade-in" onClick={() => setIsAddingSongs(false)} />
               <div className="relative bg-surface-container-highest w-full max-w-3xl h-[80vh] rounded-[3.5rem] shadow-2xl border border-white/5 overflow-hidden flex flex-col animate-zoom-in">
                  <div className="p-10 border-b border-white/5 flex justify-between items-center bg-surface-container/50">
                      <div>
                          <h4 className="text-3xl font-black font-headline tracking-tighter">Vault Curation</h4>
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Target: {selectedPlaylist}</p>
                      </div>
                      <button onClick={() => setIsAddingSongs(false)} className="w-12 h-12 rounded-full hover:bg-white/5 flex items-center justify-center transition-all"><X /></button>
                  </div>
                  <div className="p-6 bg-surface-container">
                      <div className="relative">
                          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant/40" size={20}/>
                          <input 
                            placeholder="Filter library index..."
                            value={songSearch}
                            onChange={(e) => setSongSearch(e.target.value)}
                            className="w-full bg-surface-container-low border border-white/5 rounded-3xl py-5 pl-16 pr-6 text-sm font-bold focus:outline-none focus:border-primary/40"
                          />
                      </div>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-10 pt-0 space-y-2">
                       {filteredSongs.map(song => {
                           const isAdded = data.playlists[selectedPlaylist].includes(song.id);
                           return (
                               <div 
                                    key={song.id} 
                                    className={`flex items-center gap-6 p-4 rounded-2xl border transition-all cursor-pointer ${isAdded ? 'bg-primary/20 border-primary' : 'bg-surface-container border-transparent hover:border-white/10 hover:bg-white/5'}`}
                                    onClick={() => handleToggleSong(selectedPlaylist, song.id)}
                               >
                                   <div className="w-12 h-12 rounded-xl bg-surface-container-low overflow-hidden shadow-md">
                                       <img src={data.albums.find(a => a.id === song.albumid)?.albumimage} className="w-full h-full object-cover" />
                                   </div>
                                   <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm truncate">{song.songname}</p>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant opacity-40">ID: {song.id}</p>
                                   </div>
                                   {isAdded ? (
                                       <CheckCircle2 size={24} className="text-primary animate-scale-in" />
                                   ) : (
                                       <div className="w-6 h-6 border-2 border-white/10 rounded-full group-hover:border-primary/40" />
                                   )}
                               </div>
                           );
                       })}
                  </div>
                  <div className="p-8 border-t border-white/5 bg-surface-container text-center">
                       <button onClick={() => setIsAddingSongs(false)} className="px-12 py-5 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all">Finish Curation</button>
                  </div>
               </div>
          </div>
      )}
    </div>
  );
}
