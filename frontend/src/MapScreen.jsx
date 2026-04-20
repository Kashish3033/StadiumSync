import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Navigation, Users, X } from 'lucide-react';
import { MapContainer, ImageOverlay, CircleMarker, Polyline, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const POIs = {
  'Coachella Stage': [33.680, -116.237],
  'Sahara': [33.684, -116.240],
  'Gobi': [33.682, -116.235],
  'Mojave': [33.678, -116.239],
  'Restrooms': [33.676, -116.234],
  'Entrances': [33.685, -116.233]
};

const MapScreen = ({ userId = 'user_demo' }) => {
  const [search, setSearch] = useState('');
  const [heatmapData, setHeatmapData] = useState([]);
  const [showPath, setShowPath] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [squadPos, setSquadPos] = useState(null);
  const mapRef = useRef(null);

  const bounds = [
    [33.686, -116.242], // Top-Left
    [33.675, -116.232]  // Bottom-Right
  ];
  const defaultCenter = [33.6805, -116.237];

  // Fetch Heatmap on interval
  useEffect(() => {
    const fetchHeatmap = () => {
      fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:5000'}/api/heatmap`)
        .then(r => r.json())
        .then(data => {
           if (data.users) setHeatmapData(data.users);
        })
        .catch(() => {});
    };
    fetchHeatmap();
    const int = setInterval(fetchHeatmap, 5000);
    return () => clearInterval(int);
  }, []);

  const handleSelectPOI = (poiName) => {
    setSearch(poiName);
    const coords = POIs[poiName];
    if (coords && mapRef.current) {
      mapRef.current.flyTo(coords, 18, { duration: 1.5 });
    }
  };

  const handleFindSquad = (e) => {
    e.preventDefault();
    // Simulate finding squad coordinates
    const target = [33.682, -116.239];
    setSquadPos(target); 
    setModalOpen(false);
    if (mapRef.current) mapRef.current.flyTo(target, 17, { duration: 1.5 });
  };

  const filteredPOIs = search ? Object.keys(POIs).filter(p => p.toLowerCase().includes(search.toLowerCase())) : [];

  const neonSquadIcon = L.divIcon({
    className: 'bg-transparent border-none',
    html: '<div class="relative w-4 h-4"><div class="absolute inset-0 rounded-full bg-[#BF40BF] shadow-[0_0_15px_#BF40BF] animate-pulse"></div></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="relative h-screen w-full bg-black overflow-hidden flex flex-col items-center"
    >
      {/* Search Bar - Floating */}
      <div className="absolute top-12 w-full px-6 z-20 pointer-events-none">
        <div className="relative w-full max-w-md mx-auto pointer-events-auto">
          <input 
            type="text" 
            placeholder="Search venue POIs..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-14 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl px-14 text-white font-bold tracking-wider outline-none focus:border-primary shadow-2xl transition-all"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary" size={20} />
          
          <AnimatePresence>
            {search && filteredPOIs.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="absolute top-16 w-full bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl mt-2"
              >
                {filteredPOIs.map(p => (
                  <div 
                    key={p} 
                    className="px-6 py-4 border-b border-white/5 text-sm font-bold uppercase tracking-widest text-white/80 hover:bg-white/5 active:bg-white/10 cursor-pointer flex gap-3 items-center"
                    onClick={() => handleSelectPOI(p)}
                  >
                    <MapPin size={16} className="text-[#BF40BF]" />
                    {p}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Leaflet Map */}
      <div className="absolute inset-0 z-0 bg-black">
        <MapContainer 
          center={defaultCenter} 
          zoom={15} 
          style={{ height: '100%', width: '100%', backgroundColor: '#000000' }}
          zoomControl={false}
          attributionControl={false}
          ref={mapRef}
        >
          <ImageOverlay
            url="/coachella-map.jpg"
            bounds={bounds}
            className="image-filter"
          />
          
          {/* Render Heatmap Nodes */}
          {heatmapData.map((node, idx) => (
            <CircleMarker 
              key={idx}
              center={[node.lat, node.lng]}
              radius={8}
              pathOptions={{ fillColor: '#FF3366', color: 'transparent', fillOpacity: 0.5 }}
            />
          ))}

          {/* Render POIs physically on map as points of interest */}
          {Object.entries(POIs).map(([name, coords]) => (
            <CircleMarker 
              key={name}
              center={coords}
              radius={12}
              pathOptions={{ fillColor: '#BF40BF', color: '#BF40BF', weight: 2, fillOpacity: 0.2 }}
            />
          ))}

          {/* Fastest Exit Route Overlay */}
          {showPath && (
            <Polyline 
              positions={[ defaultCenter, [33.685, -116.233] ]} // Connecting center to Entrance/Exit
              pathOptions={{ color: '#00FF41', weight: 4, dashArray: '10, 10' }}
            />
          )}

          {/* Squad Connection Direct Line */}
          {squadPos && (
            <>
              <Marker position={squadPos} icon={neonSquadIcon} />
              <Polyline 
                positions={[ defaultCenter, squadPos ]}
                pathOptions={{ color: '#BF40BF', weight: 4 }}
              />
            </>
          )}
        </MapContainer>
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
          className="pointer-events-auto w-full max-w-sm h-14 bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 text-white font-black uppercase tracking-widest rounded-full shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform hover:bg-white/5"
        >
          <Users size={20} className="text-[#BF40BF]" />
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
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-full max-w-sm bg-[#0A0A0A] backdrop-blur-2xl border border-white/10 rounded-[36px] p-8 relative shadow-2xl">
              <button className="absolute top-6 right-6 text-white/40 hover:text-white" onClick={() => setModalOpen(false)}>
                <X size={24} />
              </button>
              
              <h2 className="text-2xl font-black uppercase tracking-tight mb-8">Squad Comms</h2>

              <div className="flex flex-col gap-4">
                <form onSubmit={handleFindSquad} className="flex flex-col gap-4">
                  <div className="flex bg-black/50 border border-white/10 rounded-[24px] overflow-hidden focus-within:border-[#BF40BF] transition-colors">
                    <div className="pl-4 flex items-center justify-center"><MapPin size={18} className="text-gray-400" /></div>
                    <input type="text" placeholder="Enter Friend ID" required className="w-full h-16 bg-transparent px-3 text-white outline-none font-bold placeholder:text-white/20 uppercase text-sm" />
                  </div>
                  <button type="submit" className="w-full h-14 bg-[#BF40BF] text-white font-black uppercase tracking-widest rounded-[24px] shadow-[0_0_20px_rgba(191,64,191,0.4)] active:scale-95 transition-transform cursor-pointer">
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
