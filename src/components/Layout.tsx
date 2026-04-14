import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDatabase } from '../context/DatabaseContext';
import { CloudLightning, RefreshCcw } from 'lucide-react';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import BottomPlayer from './BottomPlayer';
import TitleBar from './TitleBar';

function LoadingOverlay() {
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center animate-fade-in">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-2xl" />
            <div className="relative z-10 text-center space-y-8 scale-in-center">
                <div className="relative">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-surface-container border border-white/5 flex items-center justify-center shadow-2xl">
                        <CloudLightning size={48} className="text-primary animate-pulse" />
                    </div>
                    {/* Ring animation */}
                    <div className="absolute inset-0 rounded-[2.5rem] border-2 border-primary/20 animate-ping opacity-20" />
                    <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-surface-container border border-white/5 flex items-center justify-center animate-bounce shadow-xl">
                        <RefreshCcw size={20} className="text-secondary animate-spin" />
                    </div>
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-black font-headline tracking-tighter text-white">Cloud Pulse Sync</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-on-surface-variant opacity-60">Architecting Auditory Vault...</p>
                </div>
                {/* Micro-loader */}
                <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden mx-auto">
                    <div className="h-full bg-gradient-to-r from-primary to-secondary animate-shimmer w-full origin-left" />
                </div>
            </div>
        </div>
    );
}

export default function Layout() {
  const { isLoading, isSilentSyncing } = useDatabase();
  const location = useLocation();
  const isNowPlaying = location.pathname === '/now-playing';
  const [showBar, setShowBar] = useState(!isNowPlaying); // Default visible only on non-full pages

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const threshold = window.innerHeight * 0.75;
      
      if (isNowPlaying) {
        // Strict 25% height rule for NowPlaying
        if (e.clientY >= threshold) {
          setShowBar(true);
        } else {
          setShowBar(false);
        }
      } else {
        // Always show on standard pages
        setShowBar(true);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isNowPlaying]);

  return (
    <div className="min-h-screen bg-surface text-on-surface select-none relative overflow-hidden">
      {/* Global Loading Filter - Only show if NOT a silent operation */}
      {isLoading && !isSilentSyncing && <LoadingOverlay />}

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
        className={`transition-all duration-500 ${
          isNowPlaying ? 'ml-0 pt-0 pb-0 px-0' : 'ml-20 pt-24 pb-32 px-8'
        } min-h-screen`}
      >
        <Outlet />
      </main>

      {/* Bottom Player - Strictly locked to 25% height trigger */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out ${
          showBar 
            ? 'translate-y-0 opacity-100 pointer-events-auto' 
            : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <BottomPlayer />
      </div>
    </div>
  );
}
