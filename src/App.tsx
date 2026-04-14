import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PlayerProvider } from './context/PlayerContext';
import { DatabaseProvider } from './context/DatabaseContext';
import { Toaster } from 'sonner';
import Layout from './components/Layout';
import Home from './pages/Home';
import Playlists from './pages/Playlists';
import Songs from './pages/Songs';
import Database from './pages/Database';
import NowPlaying from './pages/NowPlaying';
import Settings from './pages/Settings';

export default function App() {
  return (
    <BrowserRouter>
      <DatabaseProvider>
        <PlayerProvider>
          <Toaster 
            theme="dark" 
            position="top-right"
            toastOptions={{ 
              style: { 
                background: 'rgba(24, 24, 27, 0.8)', 
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#fff'
              } 
            }}
          />
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="playlists" element={<Playlists />} />
              <Route path="songs" element={<Songs />} />
              <Route path="database" element={<Database />} />
              <Route path="now-playing" element={<NowPlaying />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </PlayerProvider>
      </DatabaseProvider>
    </BrowserRouter>
  );
}
