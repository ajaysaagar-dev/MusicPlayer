import { useState, useRef, useEffect } from 'react';
import { Search, Bell, UserCircle, Music2 } from 'lucide-react';
import { useDatabase } from '../context/DatabaseContext';
import { useNavigate } from 'react-router-dom';

export default function TopNav() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const { data } = useDatabase();
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  const filteredResults = searchQuery.trim() 
    ? data.songs.filter(s => s.songname.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate('/songs', { state: { query: searchQuery } });
      setShowResults(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-5rem)] z-[60] bg-transparent flex justify-between items-center px-8 py-4 font-headline tonal-transition">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl" ref={searchRef}>
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onKeyDown={handleSearch}
            onFocus={() => setShowResults(true)}
            className="w-full bg-surface-container-low border-none rounded-full py-2.5 pl-12 pr-4 text-on-surface focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-on-surface-variant/50 text-sm outline-none font-bold"
            placeholder="Search artists, songs, or nebulae..."
          />

          {/* Real-time Results */}
          {showResults && searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-surface-container-highest rounded-[2rem] border border-white/10 shadow-2xl overflow-hidden animate-zoom-in backdrop-blur-3xl p-2">
              <div className="p-4 border-b border-white/5">
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Live Track Matches</p>
              </div>
              <div className="p-2 space-y-1">
                {filteredResults.length > 0 ? (
                  <>
                    {filteredResults.map(song => (
                      <button 
                        key={song.id}
                        onClick={() => {
                          navigate('/songs', { state: { query: song.songname } });
                          setShowResults(false);
                          setSearchQuery('');
                        }}
                        className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-primary/10 hover:text-primary transition-all group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-surface-container border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
                          {song.albumid ? (
                            <img src={data.albums.find(a => a.id === song.albumid)?.albumimage} className="w-full h-full object-cover" />
                          ) : (
                            <Music2 size={16} className="opacity-40" />
                          )}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-sm font-bold truncate group-hover:text-white transition-colors">{song.songname}</p>
                          <p className="text-[10px] font-black uppercase tracking-tighter opacity-40 truncate">
                            {data.artists.filter(a => song.singers.includes(a.id)).map(a => a.artist_name).join(', ')}
                          </p>
                        </div>
                      </button>
                    ))}
                    <button 
                      onClick={() => {
                        navigate('/songs', { state: { query: searchQuery } });
                        setShowResults(false);
                        setSearchQuery('');
                      }}
                      className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 rounded-xl transition-all mt-2"
                    >
                      View all matches
                    </button>
                  </>
                ) : (
                  <div className="p-8 text-center opacity-40">
                    <Search size={24} className="mx-auto mb-2" />
                    <p className="text-xs font-bold uppercase">No tracks found</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6 ml-8">
        <button className="text-zinc-400 hover:text-white transition-all relative group">
          <Bell size={24} className="group-hover:text-primary transition-colors" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.8)]" />
        </button>
        <button className="text-zinc-400 hover:text-white transition-all group">
          <UserCircle size={24} className="fill-current group-hover:text-primary transition-colors" />
        </button>
      </div>
    </header>
  );
}
