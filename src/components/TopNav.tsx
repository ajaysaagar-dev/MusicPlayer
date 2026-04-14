import { useState } from 'react';
import { Search, Bell, UserCircle } from 'lucide-react';

export default function TopNav() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="fixed top-0 right-0 w-[calc(100%-5rem)] z-40 bg-transparent flex justify-between items-center px-8 py-4 font-headline tonal-transition">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container-low border-none rounded-full py-2.5 pl-12 pr-4 text-on-surface focus:ring-1 focus:ring-emerald-500/30 transition-all placeholder:text-on-surface-variant/50 text-sm outline-none"
            placeholder="Search artists, songs, or nebulae..."
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6 ml-8">
        <button className="text-zinc-400 hover:text-white transition-all relative">
          <Bell size={24} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full" />
        </button>
        <button className="text-zinc-400 hover:text-white transition-all">
          <UserCircle size={24} className="fill-current" />
        </button>
      </div>
    </header>
  );
}
