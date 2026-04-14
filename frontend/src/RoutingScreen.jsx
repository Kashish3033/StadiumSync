import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, scale: 0.98, y: 10 },
  in: { opacity: 1, scale: 1, y: 0 },
  out: { opacity: 0, scale: 0.98, y: -10 }
};

const RoutingScreen = () => {
  const [gates, setGates] = useState([]);
  const [loading, setLoading] = useState(true);

  const defaultGates = [
    { id: 'North Gate', heat_level: 0.9, is_recommended: false, distance: 120, wait_time: 12, walk_time: 3, total_time: 15 },
    { id: 'South Gate', heat_level: 0.4, is_recommended: true, distance: 300, wait_time: 2, walk_time: 5, total_time: 7 },
    { id: 'East Gate', heat_level: 0.2, is_recommended: false, distance: 400, wait_time: 1, walk_time: 7, total_time: 8 },
    { id: 'West Gate', heat_level: 0.7, is_recommended: false, distance: 200, wait_time: 8, walk_time: 4, total_time: 12 },
  ];

  const fetchHeatmapData = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/routing/heatmap');
      const data = await response.json();
      setGates(data.gates.length ? data.gates : defaultGates);
    } catch (err) {
      setGates(defaultGates);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHeatmapData();
    const interval = setInterval(fetchHeatmapData, 8000);
    return () => clearInterval(interval);
  }, []);

  const getHeatColor = (heat_level) => {
    if (heat_level > 0.8) return '#FF3366'; 
    if (heat_level > 0.5) return '#F5A623'; 
    return '#00FF41'; 
  };

  const recommendedGate = gates.find(g => g.is_recommended);

  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.3 }} className="p-6 flex flex-col items-center min-h-screen w-full pt-16">
      <div className="w-full max-w-sm mb-6">
        <h1 className="text-3xl font-black uppercase tracking-tight mb-1">Live Map</h1>
        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Exit Traffic Density</p>
      </div>

      {/* Heatmap Card */}
      <div className="relative w-full max-w-sm h-80 bg-surface backdrop-blur-xl border border-white/10 rounded-[32px] p-4 flex items-center justify-center mb-8 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
        
        <div className="relative w-48 h-64 border-2 border-white/10 rounded-[40px] overflow-hidden bg-black/50">
           {/* Abstract Pitch Lines */}
           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div className="w-full h-px bg-white/10"></div>
             <div className="absolute w-12 h-12 border border-white/10 rounded-full"></div>
           </div>
           
           {gates.map((gate, index) => {
             const isNorth = index === 0;
             const isSouth = index === 1;
             const isEast = index === 2;
             const isWest = index === 3;
             const color = getHeatColor(gate.heat_level);

             return (
               <motion.div 
                 key={gate.id}
                 className="absolute w-12 h-12 -ml-6 -mt-6 rounded-full flex items-center justify-center"
                 style={{
                   top: isNorth ? '12%' : isSouth ? '88%' : '50%',
                   left: isEast ? '88%' : isWest ? '12%' : '50%',
                 }}
               >
                 <motion.div 
                   className="absolute inset-0 rounded-full opacity-60"
                   style={{ backgroundColor: color }}
                   animate={{ scale: [1, 2.5, 1], opacity: [0.6, 0, 0.6] }}
                   transition={{ repeat: Infinity, duration: 2 + index*0.2, ease: "easeInOut" }}
                 />
                 <div className="w-3 h-3 rounded-full z-10 shadow-lg" style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}` }}></div>
                 
                 {gate.is_recommended && (
                   <div className="absolute -top-6 w-8 h-8 bg-primary rounded-full animate-bounce flex items-center justify-center text-xs shadow-[0_0_15px_rgba(0,255,65,0.6)] z-20">⭐</div>
                 )}
               </motion.div>
             )
           })}
        </div>
      </div>

      {recommendedGate && (
        <motion.div initial={{opacity:0, y:20}} animate={{opacity:1,y:0}} className="w-full max-w-sm bg-surface backdrop-blur-xl border border-white/10 rounded-[32px] p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
          
          <div className="flex justify-between items-end border-b border-white/10 pb-4 mb-5 relative z-10">
            <div>
              <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Fastest Route</p>
              <h3 className="text-2xl font-black text-white uppercase">{recommendedGate.id}</h3>
            </div>
            <div className="text-right">
              <span className="text-4xl font-black text-primary">{recommendedGate.total_time}</span>
              <span className="text-xs font-bold text-gray-500 ml-1">MIN</span>
            </div>
          </div>
          
          <div className="flex justify-between relative z-10 px-2">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Walk</p>
              <p className="font-bold text-lg text-white">{recommendedGate.walk_time}m</p>
            </div>
            <div className="w-px h-8 bg-white/10 mt-2"></div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Line</p>
              <p className="font-bold text-lg text-white">{recommendedGate.wait_time}m</p>
            </div>
          </div>
        </motion.div>
      )}

      <motion.button 
        whileTap={{ scale: 0.95 }}
        onClick={fetchHeatmapData}
        className="mt-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest border border-white/10 rounded-full px-6 py-3 hover:text-white transition-colors"
      >
        Force Refresh Map
      </motion.button>
    </motion.div>
  );
};

export default RoutingScreen;
