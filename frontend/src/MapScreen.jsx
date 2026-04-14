import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Navigation, Users, X, Share2, MapPin } from 'lucide-react';
import { MapContainer, ImageOverlay, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const pageVariants = {
  initial: { opacity: 0, scale: 0.98, y: 10 },
  in: { opacity: 1, scale: 1, y: 0 },
  out: { opacity: 0, scale: 0.98, y: -10 }
};

const pois = ['Washrooms', 'Sahara Stage', 'Heineken House', 'Main Stage', 'Food Court'];

const MapScreen = ({ userId = 'user_demo', initialModal = null }) => {
  const [search, setSearch] = useState('');
  const [showPath, setShowPath] = useState(false);
  const [modalOpen, setModalOpen] = useState(initialModal === 'squad');
  const [squadPos, setSquadPos] = useState(null);
  const [sharing, setSharing] = useState(false);
  
  // Georeferencing bounds
  const bounds = [
    [33.686, -116.242], // Top-Left
    [33.675, -116.232]  // Bottom-Right
  ];
  const defaultCenter = [33.6805, -116.237];

  const [myPos, setMyPos] = useState(defaultCenter); 

  // Watch User Geolocation
  useEffect(() => {
    let watchId;
    if ("geolocation" in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setMyPos([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error fetching location, using fallback:", error);
        },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );
    }
    return () => {
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Location Sharing Heartbeat
  useEffect(() => {
    let interval;
    if (sharing) {
      interval = setInterval(() => {
        fetch('http://127.0.0.1:5000/api/heartbeat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId, lat: myPos[0], lng: myPos[1] })
        }).catch(() => {});
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [sharing, userId, myPos]);

  const handleFindSquad = (e) => {
    e.preventDefault();
    // Simulate finding squad coordinates
    setSquadPos([33.682, -116.239]); 
    setModalOpen(false);
  };

  const filteredPOIs = search ? pois.filter(p => p.toLowerCase().includes(search.toLowerCase())) : [];

  const neonUserIcon = L.divIcon({
    className: 'bg-transparent border-none',
    html: '<div class="relative w-4 h-4"><div class="absolute inset-0 rounded-full bg-primary shadow-[0_0_15px_#00FF41] animate-ping opacity-75"></div><div class="absolute inset-0 rounded-full bg-primary shadow-[0_0_20px_#00FF41]"></div></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });

  const neonSquadIcon = L.divIcon({
    className: 'bg-transparent border-none',
    html: '<div class="relative w-4 h-4"><div class="absolute inset-0 rounded-full bg-[#A66CFF] shadow-[0_0_15px_#A66CFF] animate-pulse"></div></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });

  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.3 }} className="relative h-screen w-full bg-black overflow-hidden flex flex-col items-center">
      
      {/* Zoomable Map Layer using React-Leaflet */}
      <div className="absolute inset-0 z-0 bg-black">
        <MapContainer 
          center={defaultCenter} 
          zoom={15} 
          style={{ height: '100%', width: '100%', backgroundColor: '#000' }}
          zoomControl={false}
          attributionControl={false}
        >
          <ImageOverlay
            url="/coachella-map.jpg"
            bounds={bounds}
            className="image-filter" // Inverts / dims image slightly via index.css
          />

          <Marker position={myPos} icon={neonUserIcon} />

          {/* Fastest Exit Route Overlay */}
          {showPath && (
            <Polyline 
              positions={[ myPos, [33.676, -116.233] ]} // Simulated nearest exit node
              pathOptions={{ color: '#00FF41', weight: 4, dashArray: '10, 10' }}
            />
          )}

          {/* Squad Connection Direct Line */}
          {squadPos && (
            <>
              <Marker position={squadPos} icon={neonSquadIcon} />
              <Polyline 
                positions={[ myPos, squadPos ]}
                pathOptions={{ color: '#A66CFF', weight: 4 }}
              />
            </>
          )}
        </MapContainer>
      </div>

      {/* Floating UI Top - Search Bar */}
      <div className="absolute top-12 w-full px-6 z-20 pointer-events-none">
        <div className="relative w-full max-w-md mx-auto pointer-events-auto">
          <input 
            type="text" 
            placeholder="Search venue POIs..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-14 bg-surface/80 backdrop-blur-xl border border-white/10 rounded-[32px] px-14 text-white font-bold tracking-wider outline-none focus:border-primary shadow-2xl transition-all"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          
          {search && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="absolute top-16 w-full bg-surface/90 backdrop-blur-xl border border-white/10 rounded-[28px] overflow-hidden shadow-2xl">
              {filteredPOIs.length > 0 ? (
                filteredPOIs.map(p => (
                  <div key={p} className="px-6 py-4 border-b border-white/5 text-sm font-bold uppercase tracking-widest text-white/80 hover:bg-white/5 active:bg-white/10 cursor-pointer" onClick={() => {setSearch(p);}}>
                    {p}
                  </div>
                ))
              ) : (
                <div className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-white/40">No locations found.</div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Floating UI Bottom - Action Stack */}
      <div className="absolute bottom-28 w-full px-6 flex flex-col gap-3 z-20 items-center pointer-events-none">
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => { setShowPath(!showPath); setSquadPos(null); }}
          className="pointer-events-auto w-full max-w-sm h-14 bg-primary text-black font-black uppercase tracking-widest rounded-full shadow-[0_0_20px_rgba(0,255,65,0.4)] flex items-center justify-center gap-3 active:scale-95 transition-transform"
        >
          <Navigation size={20} className={showPath ? 'animate-bounce' : ''} />
          {showPath ? 'Clear Fastest Path' : 'Exit: Fastest Path'}
        </motion.button>

        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={() => setModalOpen(true)}
          className="pointer-events-auto w-full max-w-sm h-14 bg-surface/80 backdrop-blur-xl border border-white/10 text-white font-black uppercase tracking-widest rounded-full shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform hover:bg-white/5"
        >
          <Users size={20} className="text-[#A66CFF]" />
          Find My Squad
        </motion.button>
      </div>

      {/* Modal Selection */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-6 bg-black/60 backdrop-blur-sm pointer-events-auto"
          >
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full max-w-sm bg-surface backdrop-blur-2xl border border-white/10 rounded-[36px] p-8 relative shadow-2xl">
              <button className="absolute top-6 right-6 text-white/40 hover:text-white" onClick={() => setModalOpen(false)}>
                <X size={24} />
              </button>
              
              <h2 className="text-2xl font-black uppercase tracking-tight mb-8">Squad Comms</h2>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => setSharing(!sharing)} 
                  className={`w-full h-16 rounded-[24px] border ${sharing ? 'bg-[#3b82f6]/20 border-[#3b82f6]/50 text-[#3b82f6]' : 'bg-white/5 border-white/10 text-white'} flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-sm transition-colors cursor-pointer active:scale-95`}
                >
                  <Share2 size={18} />
                  {sharing ? 'Live Location Active' : 'Broadcast Location'}
                </button>

                <div className="w-full h-px bg-white/10 my-2"></div>
                
                <form onSubmit={handleFindSquad} className="flex flex-col gap-4">
                  <div className="flex bg-black/50 border border-white/10 rounded-[24px] overflow-hidden focus-within:border-[#A66CFF] transition-colors">
                    <div className="pl-4 flex items-center justify-center"><MapPin size={18} className="text-gray-400" /></div>
                    <input type="text" placeholder="Enter Coordinates / ID" required className="w-full h-16 bg-transparent px-3 text-white outline-none font-bold placeholder:text-white/20 uppercase text-sm" />
                  </div>
                  <button type="submit" className="w-full h-14 bg-[#A66CFF] text-black font-black uppercase tracking-widest rounded-[24px] shadow-[0_0_20px_rgba(166,108,255,0.4)] active:scale-95 transition-transform cursor-pointer">
                    Locate Friend
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default MapScreen;
