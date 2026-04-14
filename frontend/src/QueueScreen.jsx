import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, scale: 0.98, y: 10 },
  in: { opacity: 1, scale: 1, y: 0 },
  out: { opacity: 0, scale: 0.98, y: -10 }
};

const QueueScreen = ({ userId = 'user_demo' }) => {
  const [inQueue, setInQueue] = useState(false);
  const [position, setPosition] = useState(null);
  const [eta, setEta] = useState(null);
  const [stallId, setStallId] = useState('stall_1');

  useEffect(() => {
    let intervalId;
    const fetchStatus = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/api/queue/status?user_id=${userId}&stall_id=${stallId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'in_queue') {
            setPosition(data.position);
            setEta(data.eta_minutes);
            setInQueue(true);
          }
        } else if (response.status === 404) {
          setInQueue(false);
          setPosition(null);
        }
      } catch (err) {}
    };

    if (inQueue) {
      fetchStatus();
      intervalId = setInterval(fetchStatus, 3000);
    }
    return () => clearInterval(intervalId);
  }, [inQueue, userId, stallId]);

  const joinQueue = async () => {
    try {
      await fetch(`http://127.0.0.1:5000/api/queue/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, stall_id: stallId })
      });
      setInQueue(true);
      setPosition(8); // Optimistic mock
      setEta(4); 
    } catch (err) {}
  };

  const advanceQueue = async () => {
    try {
      await fetch(`http://127.0.0.1:5000/api/queue/advance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stall_id: stallId })
      });
    } catch (err) {}
  };

  const isFrontOfLine = position === 0;

  return (
    <motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={{ duration: 0.3 }} className="p-6 flex flex-col items-center min-h-screen w-full pt-16">
      <h1 className="text-3xl font-black uppercase tracking-tight mb-10 w-full max-w-sm text-left">Concessions</h1>

      <AnimatePresence mode="wait">
        {!inQueue ? (
          <motion.div key="join" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="w-full max-w-sm bg-surface backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col gap-8 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
               <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Select Vendor</h3>
               <select 
                 value={stallId} 
                 onChange={(e) => setStallId(e.target.value)}
                 className="w-full p-4 bg-black/50 border border-white/20 rounded-2xl text-white outline-none focus:border-primary transition-colors appearance-none font-bold text-lg"
               >
                 <option value="stall_1">Burger & Fries - Sec 120</option>
                 <option value="stall_2">Beer & Pretzels - Sec 145</option>
               </select>
            </div>

            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={joinQueue} 
              className="relative z-10 w-full h-14 bg-white text-black font-black uppercase tracking-widest rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)] mt-4"
            >
              Join Queue
            </motion.button>
          </motion.div>
        ) : (
          <motion.div key="status" initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="w-full max-w-sm bg-surface backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col items-center gap-10 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
            
            <div className="text-center relative z-10">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Current Wait</p>
              <h2 className="text-6xl font-black text-white">{eta}<span className="text-xl text-gray-600 ml-2">min</span></h2>
            </div>
            
            <div className="w-full flex items-center justify-center gap-10 relative z-10">
              {/* Vertical Progress Bar */}
              <div className="relative w-4 h-[160px] bg-white/5 rounded-full overflow-hidden shadow-inner border border-white/10">
                <motion.div 
                  className="absolute bottom-0 left-0 w-full bg-primary"
                  initial={{ height: '0%' }}
                  animate={{ height: `${Math.max(10, 100 - (position * 10))}%` }}
                  transition={{ type: "spring", stiffness: 40 }}
                />
              </div>
              <div className="flex flex-col justify-around h-[160px]">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Position</p>
                  <p className="text-4xl font-black">{position + 1}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Vendor</p>
                  <p className="text-lg font-bold uppercase truncate max-w-[120px]">{stallId.replace('_', ' ')}</p>
                </div>
              </div>
            </div>

            <motion.button 
              whileTap={{ scale: isFrontOfLine ? 0.95 : 1 }}
              disabled={!isFrontOfLine} 
              className={`relative z-10 w-full h-14 rounded-full font-black uppercase tracking-widest transition-all duration-300 ${isFrontOfLine ? 'bg-primary text-black shadow-[0_0_20px_rgba(0,255,65,0.5)] cursor-pointer' : 'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed'}`}
            >
              {isFrontOfLine ? 'Scan to Pay' : 'Wait your turn'}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-16 w-full max-w-sm rounded-[32px] border border-dashed border-white/20 p-6 flex flex-col items-center">
        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-4">Vendor Simulator</p>
        <button onClick={advanceQueue} className="px-6 py-3 bg-danger/20 text-danger border border-danger/50 rounded-full font-bold uppercase tracking-wider text-xs">Serve Next Customer</button>
      </div>

    </motion.div>
  );
};

export default QueueScreen;
