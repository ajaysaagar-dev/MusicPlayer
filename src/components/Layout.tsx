import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { CloudLightning, RefreshCcw } from 'lucide-react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import BottomPlayer from './BottomPlayer';
import TitleBar from './TitleBar';
import ArtistDetailOverlay from './ArtistDetailOverlay';
import AlbumDetailOverlay from './AlbumDetailOverlay';

function LoadingQueueBar() {
  return (
    <div className="fixed bottom-32 right-8 z-[100] w-72 animate-slide-up">
      <div className="bg-surface-container-highest/60 backdrop-blur-3xl rounded-[1.5rem] border border-white/10 p-5 shadow-2xl flex flex-col gap-4 overflow-hidden relative group">
        {/* Background Shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
              <CloudLightning size={16} className="text-primary animate-pulse" />
            </div>
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/90">Syncing Vault</h4>
              <p className="text-[8px] font-bold text-primary animate-pulse mt-0.5">ESTABLISHING PULSE...</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-[8px] font-black text-white/20 uppercase tracking-tighter">Queue: 01</span>
            <RefreshCcw size={12} className="text-primary/40 animate-spin" />
          </div>
        </div>

        <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden z-10">
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-secondary animate-shimmer w-full origin-left" />
        </div>
      </div>
    </div>
  );
}

export default function Layout() {
  const { isLoading, isSilentSyncing } = useDatabase();
  const location = useLocation();
  const isNowPlaying = location.pathname === '/now-playing';
  const [showBar, setShowBar] = useState(!isNowPlaying);
  const [isPlayerMenuOpen, setIsPlayerMenuOpen] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const threshold = window.innerHeight * 0.75;

      if (isNowPlaying) {
        // Show only if cursor in bottom 25% OR a sub-menu is open
        if (e.clientY >= threshold || isPlayerMenuOpen) {
          setShowBar(true);
        } else {
          setShowBar(false);
        }
      } else {
        setShowBar(true);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isNowPlaying, isPlayerMenuOpen]);

  return (
    <div className="min-h-screen bg-surface text-on-surface select-none relative overflow-hidden">
      {/* Global Loading Bar - Only show if NOT a silent operation */}
      {isLoading && !isSilentSyncing && <LoadingQueueBar />}

      {/* Custom Desktop Titlebar */}
      <TitleBar />

      {/* Background Mesh (Global) */}
      {!isNowPlaying && (
        <div className="fixed inset-0 mesh-gradient -z-10 pointer-events-none" />
      )}

      {/* Sidebar - Hidden on Now Playing */}
      {!isNowPlaying && <Sidebar />}

      {/* Top Nav - Hidden on Now Playing */}
      {!isNowPlaying && <TopNav />}

      {/* Main Content */}
      <main
        className={`transition-all duration-500 ${isNowPlaying ? 'ml-0 pt-0 pb-0 px-0' : 'ml-20 pt-24 pb-32 px-8'
          } min-h-screen`}
      >
        <Outlet />
      </main>

      {/* Global Overlays */}
      <ArtistDetailOverlay />
      <AlbumDetailOverlay />

      {/* Bottom Player - stays visible while any sub-menu is open */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
          (showBar || isPlayerMenuOpen)
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <BottomPlayer onMenuStateChange={setIsPlayerMenuOpen} />
      </div>
    </div>
  );
}
