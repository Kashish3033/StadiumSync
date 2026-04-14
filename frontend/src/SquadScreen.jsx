import React, { useState } from 'react';
import { motion } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, scale: 0.98, y: 10 },
  in: { opacity: 1, scale: 1, y: 0 },
  out: { opacity: 0, scale: 0.98, y: -10 }
};

const SquadScreen = () => {
  const [section, setSection] = useState('');
  const [row, setRow] = useState('');
  const [targetPoint, setTargetPoint] = useState(null);

  const locateSquad = () => {
    if (!section) return;
    const secNum = parseInt(section, 10) || 100;
    let x = 50, y = 50;
    if (secNum < 200) { x = 15; y = 50; }
    else if (secNum < 300) { x = 50; y = 15; }
    else if (secNum < 400) { x = 85; y = 50; }
    else { x = 50; y = 85; }
    
    // Add small random noise for aesthetics
    x += (Math.random() - 0.5) * 10;
    y += (Math.random() - 0.5) * 10;
    
    setTargetPoint({ x, y });
  };

  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.3 }} className="p-6 flex flex-col items-center min-h-screen w-full pt-16">
      <div className="w-full max-w-sm mb-6">
        <h1 className="text-3xl font-black uppercase tracking-tight mb-1">Squad Search</h1>
        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Locate Seat Navigation</p>
      </div>

      <div className="w-full max-w-sm bg-surface backdrop-blur-xl border border-white/10 rounded-[32px] p-6 mb-8 shadow-2xl flex flex-col gap-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
        <div className="flex gap-4 relative z-10">
          <div className="flex-1">
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest pl-2 mb-1 block">Section</label>
            <input 
              value={section} 
              onChange={(e) => setSection(e.target.value)} 
              className="w-full bg-black/60 border border-white/10 p-4 rounded-[20px] text-white outline-none focus:border-primary transition-colors text-center font-black text-xl" 
              placeholder="110" 
            />
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest pl-2 mb-1 block">Row</label>
            <input 
              value={row} 
              onChange={(e) => setRow(e.target.value)} 
              className="w-full bg-black/60 border border-white/10 p-4 rounded-[20px] text-white outline-none focus:border-primary transition-colors text-center font-black text-xl" 
              placeholder="G" 
            />
          </div>
        </div>
        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={locateSquad} 
          className="relative z-10 w-full h-14 bg-primary text-black font-black uppercase tracking-widest rounded-full shadow-[0_0_20px_rgba(0,255,65,0.4)] mt-2"
        >
          Find Seat
        </motion.button>
      </div>

      <div className="relative w-full max-w-sm h-72 bg-surface backdrop-blur-xl border border-white/10 rounded-[32px] overflow-hidden shadow-2xl p-4 flex items-center justify-center">
         <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
         
         <div className="relative w-full h-full border-2 border-white/5 rounded-[24px] bg-black/30 overflow-hidden">
           
           <motion.div 
             className="absolute w-5 h-5 bg-white rounded-full z-10 bottom-8 left-1/2 -ml-2.5 shadow-[0_0_15px_white]"
             initial={{ scale: 0 }}
             animate={{ scale: 1 }}
           >
             <div className="absolute inset-0 rounded-full animate-ping bg-white/50"></div>
           </motion.div>
           
           {targetPoint && (
             <>
               <motion.div 
                 className="absolute w-5 h-5 bg-danger rounded-full z-10 -ml-2.5 -mt-2.5 shadow-[0_0_20px_#FF3366]"
                 style={{ left: `${targetPoint.x}%`, top: `${targetPoint.y}%` }}
                 initial={{ scale: 0 }}
                 animate={{ scale: [0, 1.5, 1] }}
               />
               <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ strokeDasharray: '8 8' }}>
                 <motion.path 
                   d={`M ${160} ${220} Q ${160} ${128} ${targetPoint.x * 3.2} ${targetPoint.y * 2.56}`} 
                   fill="none"
                   style={{ stroke: '#00FF41', strokeWidth: 3 }}
                   initial={{ pathLength: 0 }}
                   animate={{ pathLength: 1 }}
                   transition={{ duration: 1.5, ease: "easeOut" }}
                 />
                 <motion.path 
                   d={`M ${160} ${220} Q ${160} ${128} ${targetPoint.x * 3.2} ${targetPoint.y * 2.56}`} 
                   fill="none"
                   style={{ stroke: '#00FF41', strokeWidth: 8, filter: 'blur(8px)', opacity: 0.5 }}
                   initial={{ pathLength: 0 }}
                   animate={{ pathLength: 1 }}
                   transition={{ duration: 1.5, ease: "easeOut" }}
                 />
               </svg>
             </>
           )}
         </div>
      </div>
    </motion.div>
  );
};

export default SquadScreen;
