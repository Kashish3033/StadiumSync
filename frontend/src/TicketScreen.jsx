import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const pageVariants = {
  initial: { opacity: 0, scale: 0.98, y: 10 },
  in: { opacity: 1, scale: 1, y: 0 },
  out: { opacity: 0, scale: 0.98, y: -10 }
};

const TicketScreen = ({ userId = 'user_demo' }) => {
  const [status, setStatus] = useState('ACTIVE');
  const [loading, setLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/ticket/status?user_id=${userId}`);
      const data = await response.json();
      setStatus(data.status || 'INACTIVE');
    } catch (error) {
      console.error("Error fetching ticket status", error);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [userId]);

  const updateLocation = async () => {
    setLoading(true);
    try {
      await fetch(`http://127.0.0.1:5000/api/location/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId })
      });
      fetchStatus();
    } catch (error) {
      console.error(error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }

  const isActive = status === 'ACTIVE';

  return (
    <motion.div 
      initial="initial" animate="in" exit="out" variants={pageVariants}
      transition={{ duration: 0.3 }}
      className="p-6 flex flex-col items-center justify-start min-h-screen w-full pt-16"
    >
      <h1 className="text-3xl font-black uppercase tracking-tight mb-10 w-full max-w-sm text-left">My Ticket</h1>
      
      {/* Kinetic Ticket Card */}
      <motion.div 
        animate={{ 
          boxShadow: isActive 
            ? ['0px 0px 20px rgba(0,255,65,0.2)', '0px 0px 40px rgba(0,255,65,0.4)', '0px 0px 20px rgba(0,255,65,0.2)'] 
            : '0px 0px 0px rgba(0,0,0,0)'
        }}
        transition={{ repeat: Infinity, duration: 2.5 }}
        className={`relative w-full max-w-sm bg-surface backdrop-blur-xl border ${isActive ? 'border-primary/50' : 'border-white/10'} rounded-3xl p-8 flex flex-col items-center gap-8 overflow-hidden`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
        <div className="text-center w-full relative z-10">
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Entry Status</p>
          <motion.p 
            animate={{ opacity: isActive ? [0.8, 1, 0.8] : 1 }}
            transition={{ repeat: Infinity, duration: 2 }}
            className={`text-2xl font-black uppercase tracking-widest ${isActive ? 'text-primary drop-shadow-[0_0_10px_rgba(0,255,65,0.6)]' : 'text-danger'}`}
          >
            {isActive ? 'Verified' : 'Reconnect Required'}
          </motion.p>
        </div>

        <div className="relative w-56 h-56 bg-white p-3 rounded-[32px] flex items-center justify-center z-10 shadow-2xl">
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=TicketFor${userId}`}
            alt="Ticket QR Code"
            className={`w-full h-full object-contain rounded-2xl ${!isActive ? 'grayscale opacity-30 blur-[2px]' : ''}`}
          />
          {!isActive && (
            <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-black/60 rounded-[32px]">
              <span className="text-danger font-black text-xl uppercase tracking-widest">Offline</span>
            </div>
          )}
        </div>

        <div className="text-center relative z-10">
          <p className="text-white/40 text-xs font-semibold leading-relaxed px-2 uppercase tracking-wide">
            Keep location active for real-time validation.
          </p>
        </div>
      </motion.div>

      <motion.button 
        whileTap={{ scale: 0.95 }}
        onClick={updateLocation} 
        disabled={loading}
        className="mt-10 w-full max-w-sm h-14 bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-md border border-white/10 rounded-full font-black uppercase tracking-widest text-sm text-white flex items-center justify-center gap-2"
      >
        {loading ? <span className="animate-pulse text-primary">Syncing...</span> : 'Ping Location'}
      </motion.button>
    </motion.div>
  );
};

export default TicketScreen;
