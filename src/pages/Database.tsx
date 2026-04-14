import { useState } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { toast } from 'sonner';
import { 
  GitBranch, 
  ShieldCheck, 
  RefreshCcw, 
  Trash2, 
  Wand2, 
  ChevronRight, 
  Database as DatabaseIcon,
  User,
  Key,
  CloudLightning,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit2,
  X,
  Music,
  UserCircle,
  Disc,
  Save,
  Search,
  Calendar,
  Layers,
  Zap,
  TriangleAlert,
  ArrowRight
} from 'lucide-react';
import type { Song, Artist, Album } from '../types';

type Tab = 'connection' | 'songs' | 'artists' | 'albums';

export default function Database() {
  const { token, owner, repo, isInitialized, isLoading, error, config, data } = useDatabase();
  const [activeTab, setActiveTab] = useState<Tab>('connection');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Editor States
  const [isEditing, setIsEditing] = useState(false);
  const [editingType, setEditingType] = useState<Tab | null>(null);
  const [currentEditItem, setCurrentEditItem] = useState<any>(null);

  // Deletion States
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<Tab | null>(null);

  // Selector States
  const [artistSearch, setArtistSearch] = useState('');
  const [albumSearch, setAlbumSearch] = useState('');

  const openEditor = (type: Tab, item: any = null) => {
    setEditingType(type);
    setIsEditing(true);
    setArtistSearch('');
    setAlbumSearch('');
    if (item) {
      setCurrentEditItem({ ...item });
    } else {
      if (type === 'songs') setCurrentEditItem({ id: `s_${Date.now()}`, songname: '', singers: [], albumid: '', songurl: '' });
      if (type === 'artists') setCurrentEditItem({ id: `ar_${Date.now()}`, artist_name: '', artist_image: '' });
      if (type === 'albums') setCurrentEditItem({ id: `al_${Date.now()}`, albumname: '', albumimage: '', composerids: [], year: new Date().getFullYear().toString(), songs: [] });
    }
  };

  const toggleSelection = (id: string, field: 'singers' | 'composerids') => {
    const current = currentEditItem[field] || [];
    if (current.includes(id)) {
      setCurrentEditItem({ ...currentEditItem, [field]: current.filter((i: string) => i !== id) });
    } else {
      setCurrentEditItem({ ...currentEditItem, [field]: [...current, id] });
    }
  };

  const handleQuickAddArtist = async (field: 'singers' | 'composerids') => {
    if (!artistSearch.trim()) return;
    const existing = data.artists.find(a => a.artist_name.toLowerCase() === artistSearch.toLowerCase());
    if (existing) {
        if (!currentEditItem[field].includes(existing.id)) toggleSelection(existing.id, field);
        setArtistSearch('');
        return;
    }
    const newArtist: Artist = {
        id: `ar_${Date.now()}`,
        artist_name: artistSearch,
        artist_image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400'
    };
    try {
        await data.updateArtists([...data.artists, newArtist]);
        setCurrentEditItem({ ...currentEditItem, [field]: [...(currentEditItem[field] || []), newArtist.id] });
        setArtistSearch('');
    } catch (e) {}
  };

  const handleQuickAddAlbum = async () => {
    if (!albumSearch.trim()) return;
    const existing = data.albums.find(a => a.albumname.toLowerCase() === albumSearch.toLowerCase());
    if (existing) {
        setCurrentEditItem({ ...currentEditItem, albumid: existing.id });
        setAlbumSearch('');
        return;
    }
    const newAlbum: Album = {
        id: `al_${Date.now()}`,
        albumname: albumSearch,
        albumimage: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=400',
        composerids: [],
        year: new Date().getFullYear().toString(),
        songs: [currentEditItem.id]
    };
    try {
        await data.updateAlbums([...data.albums, newAlbum]);
        setCurrentEditItem({ ...currentEditItem, albumid: newAlbum.id });
        setAlbumSearch('');
    } catch (e) {}
  };

  const handleSave = async () => {
    if (!editingType || !currentEditItem) return;
    try {
      if (editingType === 'songs') {
        const existing = data.songs.find(s => s.id === currentEditItem.id);
        const newList = existing ? data.songs.map(s => s.id === currentEditItem.id ? currentEditItem : s) : [...data.songs, currentEditItem];
        await data.updateSongs(newList);
      } else if (editingType === 'artists') {
        const existing = data.artists.find(a => a.id === currentEditItem.id);
        const newList = existing ? data.artists.map(a => a.id === currentEditItem.id ? currentEditItem : a) : [...data.artists, currentEditItem];
        await data.updateArtists(newList);
      } else if (editingType === 'albums') {
        const existing = data.albums.find(a => a.id === currentEditItem.id);
        const newList = existing ? data.albums.map(a => a.id === currentEditItem.id ? currentEditItem : a) : [...data.albums, currentEditItem];
        await data.updateAlbums(newList);
      }
      setIsEditing(false);
      setCurrentEditItem(null);
    } catch (e) {}
  };

  const initiateDelete = (type: Tab, id: string) => {
    setDeleteId(id);
    setDeleteType(type);
    setIsDeleting(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId || !deleteType) return;
    try {
      if (deleteType === 'songs') await data.updateSongs(data.songs.filter(s => s.id !== deleteId));
      if (deleteType === 'artists') await data.updateArtists(data.artists.filter(a => a.id !== deleteId));
      if (deleteType === 'albums') await data.updateAlbums(data.albums.filter(a => a.id !== deleteId));
      setIsDeleting(false);
      setDeleteId(null);
      setDeleteType(null);
    } catch (e) {}
  };

  const renderMultiArtistSelector = (field: 'singers' | 'composerids') => {
    const filteredArtists = data.artists.filter(a => a.artist_name.toLowerCase().includes(artistSearch.toLowerCase()));
    return (
        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            <label className="text-[10px] uppercase font-black text-on-surface-variant ml-1 flex justify-between">
              Collaborators
              <span className="text-primary">{currentEditItem[field]?.length || 0} selected</span>
            </label>
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50" size={16}/>
                <input 
                    placeholder="Search or type name to add new..."
                    value={artistSearch}
                    onChange={(e) => setArtistSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleQuickAddArtist(field))}
                    className="w-full bg-surface-container border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-sm focus:outline-none focus:border-primary/40 font-bold"
                />
                {artistSearch && (
                    <button onClick={() => handleQuickAddArtist(field)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-primary/20 text-primary rounded-xl hover:bg-primary/30 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"><Plus size={14}/> Add</button>
                )}
            </div>
          </div>
          <div className="bg-surface-container-low border border-white/5 rounded-3xl p-4 max-h-56 overflow-y-auto custom-scrollbar grid grid-cols-2 gap-3 shadow-inner relative">
            {filteredArtists.length > 0 ? filteredArtists.map(art => {
                    const isSelected = currentEditItem[field]?.includes(art.id);
                    return (
                      <button key={art.id} type="button" onClick={() => toggleSelection(art.id, field)} className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${isSelected ? 'bg-primary/20 border-primary shadow-lg shadow-primary/5' : 'bg-surface-container border-white/5 opacity-50 hover:opacity-100'}`}>
                        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md"><img src={art.artist_image} className="w-full h-full object-cover" /></div>
                        <div className="flex-1 min-w-0"><p className={`text-xs font-bold truncate ${isSelected ? 'text-primary' : 'text-on-surface-variant'}`}>{art.artist_name}</p></div>
                        {isSelected && <Zap size={12} className="text-primary animate-pulse" />}
                      </button>
                    );
                }) : <div className="col-span-2 py-10 flex flex-col items-center justify-center text-on-surface-variant opacity-40"><UserCircle size={40} className="mb-2" /><p className="text-xs font-bold uppercase tracking-widest">No existing matches</p></div>}
          </div>
        </div>
    );
  };

  const renderAlbumSelector = () => {
    const filteredAlbums = data.albums.filter(a => a.albumname.toLowerCase().includes(albumSearch.toLowerCase()));
    return (
        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            <label className="text-[10px] uppercase font-black text-on-surface-variant ml-1 flex justify-between">
              Album Selection
              {currentEditItem.albumid && <span className="text-primary flex items-center gap-1"><Disc size={10}/> Linked</span>}
            </label>
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50" size={16}/>
                <input 
                    placeholder="Search or type name to add new album..."
                    value={albumSearch}
                    onChange={(e) => setAlbumSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleQuickAddAlbum())}
                    className="w-full bg-surface-container border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-sm focus:outline-none focus:border-primary/40 font-bold"
                />
                {albumSearch && (
                    <button onClick={() => handleQuickAddAlbum()} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-secondary/20 text-secondary rounded-xl hover:bg-secondary/30 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"><Plus size={14}/> Add New</button>
                )}
            </div>
          </div>
          <div className="bg-surface-container-low border border-white/5 rounded-3xl p-4 max-h-56 overflow-y-auto custom-scrollbar grid grid-cols-2 gap-3 shadow-inner relative">
            {filteredAlbums.length > 0 ? filteredAlbums.map(alb => {
                const isSelected = currentEditItem.albumid === alb.id;
                return (
                    <button key={alb.id} type="button" onClick={() => setCurrentEditItem({ ...currentEditItem, albumid: alb.id })} className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${isSelected ? 'bg-secondary/20 border-secondary shadow-lg shadow-secondary/5' : 'bg-surface-container border-white/5 opacity-50 hover:opacity-100'}`}>
                        <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md"><img src={alb.albumimage} className="w-full h-full object-cover" /></div>
                        <div className="flex-1 min-w-0"><p className={`text-xs font-bold truncate ${isSelected ? 'text-secondary' : 'text-on-surface-variant'}`}>{alb.albumname}</p></div>
                        {isSelected && <CheckCircle size={12} className="text-secondary" />}
                    </button>
                );
            }) : <div className="col-span-2 py-10 flex flex-col items-center justify-center text-on-surface-variant opacity-40"><Disc size={40} className="mb-2" /><p className="text-xs font-bold uppercase tracking-widest">No albums found</p></div>}
          </div>
        </div>
    );
  };

  const renderConnection = () => (
    <div className="grid grid-cols-12 gap-6 animate-fade-in">
        <div className="col-span-12 lg:col-span-8 bg-surface-container rounded-3xl p-10 ghost-border relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 pointer-events-none"><GitBranch size={240} /></div>
          <div className="relative z-10">
            <h3 className="text-3xl font-bold font-headline mb-8 flex items-center gap-4"><GitBranch className="text-primary" size={32} />GitHub Vault Connection</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black tracking-[0.2em] text-on-surface-variant ml-1 opacity-70">GitHub Personal Token</label>
                <div className="relative group">
                  <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={20} />
                  <input type="password" placeholder="ghp_xxxxxxxxxxxx" value={token} onChange={(e) => config.setToken(e.target.value)} className="w-full bg-surface-container-low border border-white/5 rounded-2xl py-5 pl-14 pr-4 text-sm focus:outline-none focus:border-primary/30 focus:bg-surface-bright transition-all shadow-inner" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] uppercase font-black tracking-[0.2em] text-on-surface-variant ml-1 opacity-70">Owner Account</label>
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={20} />
                  <input type="text" placeholder="octocat" value={owner} onChange={(e) => config.setOwner(e.target.value)} className="w-full bg-surface-container-low border border-white/5 rounded-2xl py-5 pl-14 pr-4 text-sm focus:outline-none focus:border-primary/30 focus:bg-surface-bright transition-all shadow-inner" />
                </div>
              </div>
            </div>
            {error && <div className="mt-8 p-5 rounded-2xl bg-error/10 border border-error/20 text-error text-xs flex items-center gap-4 animate-shake"><AlertCircle size={20} /><span className="font-bold">{error}</span></div>}
            <div className="mt-12 pt-10 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-end gap-8"><div className="text-left"><p className="text-[10px] text-on-surface-variant uppercase font-black tracking-widest mb-1 opacity-50">Protocol</p><p className={`text-sm font-bold ${isInitialized ? 'text-primary' : 'text-on-surface-variant'}`}>{isInitialized ? 'SYNC ACTIVE' : 'UNINITIALIZED'}</p></div></div>
              <button onClick={config.initializeRepo} disabled={isLoading || !token || !owner} className="px-12 py-5 bg-gradient-to-br from-primary to-primary-container text-on-primary-fixed rounded-2xl font-bold flex items-center gap-3 shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale disabled:scale-100">{isLoading ? <RefreshCcw className="animate-spin" size={22} /> : <CloudLightning size={22} />}Initialize Database</button>
            </div>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
          <div className="flex-1 bg-surface-container-high rounded-[2.5rem] p-8 ghost-border flex flex-col justify-between shadow-2xl">
            <h4 className="text-xs font-black font-headline uppercase tracking-[0.3em] text-on-surface-variant mb-8 opacity-40">Vault Resources</h4>
            <div className="space-y-5">
               <div className="p-6 rounded-3xl bg-surface-container-low border border-white/5"><p className="text-[10px] uppercase text-on-surface-variant mb-2 font-black tracking-widest opacity-60">Tracks</p><div className="flex items-end justify-between"><p className="text-4xl font-black font-headline">{data.songs.length}</p><Music className="text-primary/20" size={32} /></div></div>
               <div className="p-6 rounded-3xl bg-surface-container-low border border-white/5"><p className="text-[10px] uppercase text-on-surface-variant mb-2 font-black tracking-widest opacity-60">Albums</p><div className="flex items-end justify-between"><p className="text-4xl font-black font-headline">{data.albums.length}</p><Disc className="text-secondary/20" size={32} /></div></div>
               <div className="p-6 rounded-3xl bg-surface-container-low border border-white/5"><p className="text-[10px] uppercase text-on-surface-variant mb-2 font-black tracking-widest opacity-60">Artists</p><div className="flex items-end justify-between"><p className="text-4xl font-black font-headline">{data.artists.length}</p><UserCircle className="text-tertiary/20" size={32} /></div></div>
            </div>
            <button onClick={data.refresh} disabled={isLoading} className="mt-8 w-full py-5 rounded-2xl glass-panel border border-white/10 text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white/5 transition-all active:scale-95"><RefreshCcw size={18} className={isLoading ? 'animate-spin' : ''} />Re-sync Repository</button>
          </div>
        </div>
    </div>
  );

  const renderDataGrid = (type: Tab) => {
    let items: any[] = [];
    if (type === 'songs') items = data.songs;
    if (type === 'artists') items = data.artists;
    if (type === 'albums') items = data.albums;
    const filtered = items.filter(i => (i.songname || i.artist_name || i.albumname).toLowerCase().includes(searchQuery.toLowerCase()));
    
    return (
      <div className="animate-fade-in px-2">
        <div className="flex justify-between items-center mb-8">
           <div className="relative w-1/4"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50" size={16} /><input placeholder={`Filter ${type}...`} className="w-full bg-surface-container border border-white/5 rounded-xl py-3 pl-12 pr-4 text-xs focus:outline-none focus:border-primary/30 transition-all font-bold" onChange={(e) => setSearchQuery(e.target.value)} /></div>
           <button onClick={() => openEditor(type)} className="px-6 py-2.5 bg-primary text-on-primary-fixed rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:scale-[1.02] active:scale-95 transition-all"><Plus size={16} /> Add {type.slice(0, -1)}</button>
        </div>
        
        <div className="bg-surface-container/20 rounded-[2rem] border border-white/5 overflow-hidden">
          {filtered.map((item, idx) => (
            <div key={item.id} className={`p-3 group flex items-center gap-4 transition-all hover:bg-white/5 ${idx !== filtered.length - 1 ? 'border-b border-white/5' : ''}`}>
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-surface-container-highest shrink-0 shadow-lg border border-white/5">
                <img src={item.albumimage || item.artist_image || item.imageUrl || ''} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                   <h5 className="font-bold text-sm truncate text-on-surface">{item.songname || item.artist_name || item.albumname}</h5>
                   {item.year && <span className="text-[9px] font-black text-primary opacity-40">{item.year}</span>}
                </div>
                <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-wider opacity-30 truncate">
                  {item.id} {type === 'songs' && `• ${item.albumid}`}
                </p>
              </div>

              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button onClick={() => openEditor(type, item)} className="p-2.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-all">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => initiateDelete(type, item.id)} className="p-2.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="py-20 text-center opacity-20">
              <p className="text-xs font-black uppercase tracking-[0.3em]">Vault is empty or filtered</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="px-4 pb-20 max-w-[1600px] mx-auto">
      <header className="mb-10 flex justify-between items-end">
        <div><span className="text-primary font-black tracking-[0.4em] text-[10px] uppercase mb-3 block opacity-60">Systems Management</span><h2 className="text-6xl font-black tracking-tighter font-headline leading-tight">The Archive</h2></div>
        <div className="flex items-center gap-1 bg-surface-container rounded-2xl p-1.5 border border-white/5">{[{ id: 'connection', label: 'Vault', icon: DatabaseIcon }, { id: 'songs', label: 'Songs', icon: Music }, { id: 'artists', label: 'Artists', icon: UserCircle }, { id: 'albums', label: 'Albums', icon: Disc }].map(t => (<button key={t.id} onClick={() => setActiveTab(t.id as Tab)} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-primary text-on-primary-fixed shadow-xl shadow-primary/10 scale-105' : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'}`}><t.icon size={16} />{t.label}</button>))}</div>
      </header>
      {activeTab === 'connection' ? renderConnection() : renderDataGrid(activeTab)}
      {isEditing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-8">
           <div className="absolute inset-0 bg-black/80 backdrop-blur-xl animate-fade-in" onClick={() => setIsEditing(false)} />
           <div className="relative bg-surface-container-highest w-full max-w-2xl rounded-[3rem] shadow-2xl border border-white/10 overflow-hidden animate-zoom-in">
              <div className="px-10 py-8 border-b border-white/5 flex justify-between items-center bg-surface-container">
                 <div><h4 className="text-2xl font-black font-headline">Manage {editingType?.slice(0, -1)}</h4><p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">Record Identifier: {currentEditItem?.id}</p></div>
                 <button onClick={() => setIsEditing(false)} className="w-12 h-12 rounded-full hover:bg-white/5 flex items-center justify-center transition-all"><X /></button>
              </div>
              <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {editingType === 'songs' && (
                  <>
                    {/* Dynamic Cover Preview */}
                    <div className="flex justify-center mb-8">
                      <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-2xl bg-surface-container border border-white/5 relative group">
                        {currentEditItem.albumid ? (
                          <img 
                            src={data.albums.find(a => a.id === currentEditItem.albumid)?.albumimage} 
                            className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant opacity-20">
                            <Music size={40} />
                            <p className="text-[10px] font-black uppercase tracking-widest mt-2">No Album</p>
                          </div>
                        )}
                        <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-3xl" />
                      </div>
                    </div>
                    <div className="space-y-2"><label className="text-[10px] uppercase font-black text-on-surface-variant ml-1">Track Title</label><input value={currentEditItem.songname} onChange={e => setCurrentEditItem({...currentEditItem, songname: e.target.value})} className="w-full bg-surface-container border border-white/5 rounded-2xl p-5 text-sm focus:outline-none focus:border-primary/40 font-bold" /></div>
                    {renderMultiArtistSelector('singers')}
                    {renderAlbumSelector()}
                    <div className="space-y-2"><label className="text-[10px] uppercase font-black text-on-surface-variant ml-1">Stream URL (.mp3)</label><input value={currentEditItem.songurl} onChange={e => setCurrentEditItem({...currentEditItem, songurl: e.target.value})} className="w-full bg-surface-container border border-white/5 rounded-2xl p-5 text-sm focus:outline-none focus:border-primary/40 font-bold" /></div>
                  </>
                )}
                {editingType === 'artists' && (
                  <><div className="space-y-2"><label className="text-[10px] uppercase font-black text-on-surface-variant ml-1">Artist Name</label><input value={currentEditItem.artist_name} onChange={e => setCurrentEditItem({...currentEditItem, artist_name: e.target.value})} className="w-full bg-surface-container border border-white/5 rounded-2xl p-5 text-sm focus:outline-none focus:border-primary/40 font-bold" /></div><div className="space-y-2"><label className="text-[10px] uppercase font-black text-on-surface-variant ml-1">Profile Image URL</label><input value={currentEditItem.artist_image} onChange={e => setCurrentEditItem({...currentEditItem, artist_image: e.target.value})} className="w-full bg-surface-container border border-white/5 rounded-2xl p-5 text-sm focus:outline-none focus:border-primary/40 font-bold" /></div></>
                )}
                {editingType === 'albums' && (
                  <><div className="space-y-2"><label className="text-[10px] uppercase font-black text-on-surface-variant ml-1">Collection Title</label><input value={currentEditItem.albumname} onChange={e => setCurrentEditItem({...currentEditItem, albumname: e.target.value})} className="w-full bg-surface-container border border-white/5 rounded-2xl p-5 text-sm focus:outline-none focus:border-primary/40 font-bold" /></div><div className="grid grid-cols-2 gap-6"><div className="space-y-2"><label className="text-[10px] uppercase font-black text-on-surface-variant ml-1 flex items-center gap-2"><Calendar size={12}/> Release Year</label><input value={currentEditItem.year} placeholder="2024" onChange={e => setCurrentEditItem({...currentEditItem, year: e.target.value})} className="w-full bg-surface-container border border-white/5 rounded-2xl p-5 text-sm focus:outline-none focus:border-primary/40 font-bold" /></div><div className="space-y-2"><label className="text-[10px] uppercase font-black text-on-surface-variant ml-1 flex items-center gap-2"><Layers size={12}/> Poster Artwork URL</label><input value={currentEditItem.albumimage} onChange={e => setCurrentEditItem({...currentEditItem, albumimage: e.target.value})} className="w-full bg-surface-container border border-white/5 rounded-2xl p-5 text-sm focus:outline-none focus:border-primary/40 font-bold" /></div></div>{renderMultiArtistSelector('composerids')}</>
                )}
              </div>
              <div className="p-10 bg-surface-container/50 border-t border-white/5 flex gap-4"><button onClick={() => setIsEditing(false)} className="flex-1 py-5 rounded-2xl bg-white/5 font-bold hover:bg-white/10 transition-all">Discard Changes</button><button disabled={isLoading} onClick={handleSave} className="flex-[2] py-5 rounded-2xl bg-primary text-on-primary-fixed font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-primary/20">{isLoading ? <RefreshCcw className="animate-spin" size={20} /> : <Save size={20} />}Commit to Vault</button></div>
           </div>
        </div>
      )}
      {isDeleting && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-8">
              <div className="absolute inset-0 bg-black/90 backdrop-blur-md animate-fade-in" onClick={() => setIsDeleting(false)} /><div className="relative bg-surface-container-highest w-full max-w-md rounded-[2.5rem] shadow-2xl border border-error/20 overflow-hidden animate-zoom-in"><div className="p-10 text-center"><div className="w-20 h-20 bg-error/10 text-error rounded-3xl flex items-center justify-center mx-auto mb-6 scale-110 shadow-lg shadow-error/5"><Trash2 size={40} /></div><h4 className="text-2xl font-black font-headline mb-3 text-on-surface">Purge Record?</h4><p className="text-sm text-on-surface-variant leading-relaxed">This action is irreversible. The record will be permanently deleted from the <span className="text-primary font-bold"> {repo} </span> vault.</p></div><div className="p-8 bg-surface-container/50 flex gap-4 border-t border-white/5"><button onClick={() => setIsDeleting(false)} className="flex-1 py-4 rounded-xl font-bold bg-white/5 hover:bg-white/10 transition-all">Cancel</button><button disabled={isLoading} onClick={handleConfirmDelete} className="flex-1 py-4 rounded-xl font-black bg-error text-on-error uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-error/20 flex items-center justify-center gap-2">{isLoading ? <RefreshCcw size={18} className="animate-spin" /> : 'Confirm Purge'}</button></div></div>
          </div>
      )}
    </div>
  );
}
