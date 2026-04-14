import { NavLink } from 'react-router-dom';
import { Home, Library, Music, Database, Settings, UserCircle } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/playlists', icon: Library, label: 'Playlists' },
  { to: '/songs', icon: Music, label: 'Songs' },
  { to: '/database', icon: Database, label: 'Database' },
];

export default function Sidebar() {
  return (
    <aside className="flex flex-col h-screen p-4 pb-32 overflow-y-auto bg-zinc-900/80 w-20 fixed left-0 top-0 z-50 transition-all duration-300">
      {/* Logo - simplified for icon-only sidebar */}
      <div className="mb-12 flex flex-col items-center">
        <div className="w-10 h-10 rounded-xl bg-emerald-400 flex items-center justify-center text-zinc-900 font-bold text-xl">
          SN
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 flex flex-col items-center space-y-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            title={item.label}
            className={({ isActive }) =>
              `flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 ${isActive
                ? 'text-emerald-400 bg-emerald-400/10 shadow-[0_0_15px_rgba(52,211,153,0.1)]'
                : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`
            }
          >
            <item.icon size={24} />
          </NavLink>
        ))}
      </nav>

      {/* Settings (separate section) */}
      <div className="mt-auto pt-6 border-t border-outline-variant/10 flex flex-col items-center space-y-6">
        <NavLink
          to="/settings"
          title="Settings"
          className={({ isActive }) =>
            `flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-200 ${isActive
              ? 'text-emerald-400 bg-emerald-400/10 shadow-[0_0_15px_rgba(52,211,153,0.1)]'
              : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`
          }
        >
          <Settings size={24} />
        </NavLink>

        {/* User Profile */}
        <div className="flex flex-col items-center gap-3 pb-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container-high flex items-center justify-center border border-white/5 cursor-pointer hover:border-primary/30 transition-colors">
            <UserCircle size={28} className="text-on-surface-variant" />
          </div>
        </div>
      </div>
    </aside>
  );
}
