import { usePlayer } from '../context/PlayerContext';
import { useDatabase } from '../context/DatabaseContext';
import { Play, PlayCircle, ChevronLeft, ChevronRight, Sparkles, Zap, Sun, CloudLightning } from 'lucide-react';

const mixingIcons = {
  auto_awesome: Sparkles,
  electric_bolt: Zap,
  flare: Sun,
};

export default function Home() {
  const { play } = usePlayer();
  const { data, isInitialized } = useDatabase();

  const handlePlayAlbum = (album: any) => {
    if (!album.songs || album.songs.length === 0) return;
    const albumSongs = album.songs.map((id: string) => data.songs.find(s => s.id === id)).filter(Boolean);
    if (albumSongs.length > 0) {
      play(albumSongs[0], albumSongs);
    }
  };

  const getArtistName = (artistId: string) => {
    return data.artists.find(a => a.id === artistId)?.artist_name || 'Various Artists';
  };

  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] px-8 text-center bg-surface-container/20 rounded-[3rem] border border-white/5 mx-2">
         <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-8 glow-primary">
            <CloudLightning size={48} />
         </div>
         <h2 className="text-4xl font-extrabold font-headline mb-4 tracking-tighter">Your Nebula is Offline</h2>
         <p className="text-on-surface-variant max-w-lg text-lg mb-10 opacity-70">
           Initialize your High-Performance GitHub Database to unlock your curated cloud collections, 
           lossless tracks, and personalized mixes.
         </p>
         <button 
           onClick={() => window.location.href = '/database'}
           className="px-10 py-4 bg-primary text-on-primary-fixed rounded-2xl font-bold text-lg shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
         >
           Initialize Cloud Vault
         </button>
      </div>
    );
  }

  // Use real data from DB
  const featuredAlbum = data.albums[0];
  const secondaryAlbums = data.albums.slice(1, 3);
  const recentTracks = data.songs.slice(0, 8);

  return (
    <div className="space-y-16 px-2 pb-20">
      {/* Hero Section: New Releases */}
      <section>
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <span className="text-primary text-[10px] font-bold tracking-[0.3em] uppercase mb-2 block opacity-60">
              Featured Experience
            </span>
            <h3 className="font-headline text-6xl font-extrabold tracking-tighter">
              New Releases
            </h3>
          </div>
          <button className="text-primary font-bold hover:underline text-sm tracking-widest uppercase">
            Discovery
          </button>
        </div>

        <div className="grid grid-cols-12 gap-6 h-[450px]">
          {/* Featured Bento Card */}
          {featuredAlbum && (
            <div
              className="col-span-8 relative rounded-[3rem] overflow-hidden group cursor-pointer shadow-2xl shadow-black/40"
              onClick={() => handlePlayAlbum(featuredAlbum)}
            >
              <img
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                src={featuredAlbum.albumimage}
                alt={featuredAlbum.albumname}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 p-12 w-full">
                <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-xl text-white text-[10px] font-bold tracking-[0.2em] uppercase mb-6 border border-white/20">
                  Top Trending Album
                </span>
                <h4 className="font-headline text-7xl font-black mb-4 tracking-tighter">
                  {featuredAlbum.albumname}
                </h4>
                <p className="text-white/70 text-xl mb-8 max-w-md font-medium">
                  Produced by {getArtistName(featuredAlbum.composerid)} • {featuredAlbum.songs.length} tracks
                </p>
                <div className="flex items-center gap-4">
                  <div className="p-6 bg-primary text-on-primary-fixed rounded-full shadow-2xl shadow-primary/40 hover:scale-110 transition-transform">
                    <Play size={28} fill="currentColor" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Secondary Bento Cards */}
          <div className="col-span-4 flex flex-col gap-6">
            {secondaryAlbums.map((album) => (
              <div
                key={album.id}
                className="flex-1 glass-panel rounded-[2.5rem] p-10 flex flex-col justify-end relative overflow-hidden group cursor-pointer border border-white/5"
                onClick={() => handlePlayAlbum(album)}
              >
                <img
                  className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-110 transition-all duration-[1s]"
                  src={album.albumimage}
                  alt={album.albumname}
                />
                <div className="relative z-10">
                  <h5 className="font-headline text-3xl font-black tracking-tight mb-1">
                    {album.albumname}
                  </h5>
                  <p className="text-on-surface-variant text-sm font-bold uppercase tracking-wider opacity-60">
                    {getArtistName(album.composerid)}
                  </p>
                </div>
              </div>
            ))}
            {secondaryAlbums.length === 0 && (
               <div className="flex-1 glass-panel rounded-[2.5rem] flex items-center justify-center border border-white/5 opacity-40">
                  <p className="text-xs font-bold uppercase tracking-widest">Awaiting Content</p>
               </div>
            )}
          </div>
        </div>
      </section>

      {/* Recently Played Carousel */}
      <section>
        <div className="flex items-baseline justify-between mb-8">
          <h3 className="font-headline text-4xl font-black tracking-tight">
            Vault History
          </h3>
          <div className="flex gap-3">
             <button className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center hover:bg-white/5 transition-all text-white/40">
               <ChevronLeft size={24} />
             </button>
             <button className="w-12 h-12 rounded-full border border-primary/20 flex items-center justify-center hover:bg-primary/5 transition-all text-primary">
               <ChevronRight size={24} />
             </button>
          </div>
        </div>
        <div className="flex gap-8 overflow-x-auto no-scrollbar pb-4 -mx-2 px-2">
          {recentTracks.map((song) => (
            <div
              key={song.id}
              className="flex-none w-56 group cursor-pointer"
              onClick={() => play(song, recentTracks)}
            >
              <div className="aspect-square rounded-[2rem] overflow-hidden bg-surface-container-highest mb-6 relative shadow-xl hover:shadow-primary/10 transition-shadow">
                <div className="w-full h-full bg-gradient-to-br from-surface-container-highest to-surface-container flex items-center justify-center text-primary/20 font-black text-4xl italic">M</div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <PlayCircle size={64} className="text-primary" fill="currentColor" />
                </div>
              </div>
              <h4 className="font-headline text-lg font-bold truncate px-1">
                {song.songname}
              </h4>
              <p className="text-on-surface-variant text-sm font-medium truncate px-1 opacity-60">
                {getArtistName(song.singers[0])}
              </p>
            </div>
          ))}
          {recentTracks.length === 0 && (
             <div className="p-12 text-on-surface-variant/40 font-bold uppercase tracking-widest text-xs">
               Empty Vault History
             </div>
          )}
        </div>
      </section>

      {/* Your Top Mixes */}
      <section>
        <div className="mb-10">
          <h3 className="font-headline text-4xl font-black tracking-tight mb-2">
            Top Frequency Mixes
          </h3>
          <p className="text-on-surface-variant text-lg opacity-60">
            Synthesized compositions from your cloud listening patterns.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-8">
          {[
            { title: 'Nebula\nEssentials', icon: 'auto_awesome', color: 'primary', num: '01' },
            { title: 'Synth\nDynamics', icon: 'electric_bolt', color: 'secondary', num: '02' },
            { title: 'Ambient\nAtmosphere', icon: 'flare', color: 'tertiary', num: '03' },
          ].map((mix, i) => {
            const Icon = mixingIcons[mix.icon as keyof typeof mixingIcons];
            return (
              <div
                key={mix.num}
                className="group relative aspect-square rounded-[3.5rem] p-1.5 overflow-hidden cursor-pointer bg-surface-container shadow-2xl"
              >
                <div className="relative h-full w-full bg-surface-container-high rounded-[3.2rem] p-10 flex flex-col justify-between overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />
                  <div className="relative flex justify-between items-start">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-primary">
                      <Icon size={28} />
                    </div>
                    <span className="text-on-surface-variant/40 font-black text-sm tracking-widest">
                      {mix.num}
                    </span>
                  </div>
                  <div className="relative">
                    <h4 className="font-headline text-4xl font-black leading-none mb-4 whitespace-pre-line tracking-tighter">
                      {mix.title}
                    </h4>
                    <p className="text-on-surface-variant text-sm font-bold uppercase tracking-widest opacity-40">
                      Auto-Generated Mix
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
