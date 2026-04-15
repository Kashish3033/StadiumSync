import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Coffee, Users, AlertTriangle, Activity } from 'lucide-react';

const pageVariants = {
  initial: { opacity: 0, scale: 0.98, y: 10 },
  in: { opacity: 1, scale: 1, y: 0 },
  out: { opacity: 0, scale: 0.98, y: -10 }
};

const HomeScreen = ({ setActiveTab, userId = 'user_demo', ticketActive, setTicketActive, syncStatus }) => {

  // Pulse effect simulation
  const crowds = [
    'Vibes are immaculate at Sahara', 
    'Heineken House is at Capacity', 
    'Short lines at Main Gate', 
    'Headliner starting in 15 mins'
  ];
  const [pulseIndex, setPulseIndex] = useState(0);

  useEffect(() => {
    const i = setInterval(() => {
      setPulseIndex((prev) => (prev + 1) % crowds.length);
    }, 4000);
    return () => clearInterval(i);
  }, []);

  return (
    <motion.div 
      initial="initial" animate="in" exit="out" variants={pageVariants}
      transition={{ duration: 0.3 }}
      className="p-6 flex flex-col items-center justify-start min-h-screen w-full pt-16 pb-32 overflow-y-auto"
    >
      <div className="w-full max-w-sm mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight mb-1">Dashboard</h1>
          <div className="flex items-center gap-2">
             <div className={`w-2 h-2 rounded-full ${syncStatus === 'SYNC ACTIVE' ? 'bg-[#00FF41] animate-pulse shadow-[0_0_10px_#00FF41]' : syncStatus === 'POWER SAVING' ? 'bg-white/30' : 'bg-danger'}`}></div>
             <p className={`text-[10px] font-bold uppercase tracking-widest ${syncStatus === 'SYNC ACTIVE' ? 'text-[#00FF41]' : syncStatus === 'POWER SAVING' ? 'text-white/50' : 'text-danger'}`}>
               {syncStatus}
             </p>
          </div>
        </div>
        <div className="w-12 h-12 rounded-full bg-surface border border-white/10 flex items-center justify-center overflow-hidden">
          <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=Felix" alt="avatar" />
        </div>
      </div>

      {/* Kinetic Ticket Hero */}
      <motion.div 
        animate={{ 
          boxShadow: ticketActive 
            ? ['0px 0px 15px rgba(0,255,65,0.2)', '0px 0px 30px rgba(0,255,65,0.4)', '0px 0px 15px rgba(0,255,65,0.2)'] 
            : '0px 0px 0px rgba(0,0,0,0)'
        }}
        transition={{ repeat: Infinity, duration: 2.5 }}
        className={`relative w-full max-w-sm bg-surface backdrop-blur-xl border ${ticketActive ? 'border-primary/50' : 'border-white/10'} rounded-[32px] p-6 mb-8 flex flex-col gap-6 overflow-hidden shadow-2xl`}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
        <div className="relative z-10 w-full flex justify-between items-center">
          <div>
             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Entry Ticket</p>
             <p className={`text-xl font-black uppercase tracking-widest ${ticketActive ? 'text-primary drop-shadow-[0_0_10px_rgba(0,255,65,0.6)]' : 'text-danger'}`}>
                {ticketActive ? 'Verified' : 'Offline'}
             </p>
             <p className="text-[10px] text-gray-500 font-bold uppercase mt-2">ID: CCHLA-{userId.substring(0,4).toUpperCase()}</p>
          </div>
          <div className="w-24 h-24 bg-white p-2 rounded-2xl flex items-center justify-center shadow-2xl ml-4 relative overflow-hidden">
             <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=TicketFor${userId}`}
                alt="QR"
                className={`w-full h-full object-contain rounded-xl ${!ticketActive ? 'grayscale opacity-30 blur-[2px]' : ''}`}
             />
             {!ticketActive && (
                <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-black/60 rounded-2xl">
                  <span className="text-danger font-black text-xs uppercase tracking-widest">Connect</span>
                </div>
             )}
          </div>
        </div>

        <motion.button 
          whileTap={{ scale: 0.95 }}
          onClick={setTicketActive}
          className={`relative z-10 w-full h-12 rounded-full font-black uppercase tracking-widest transition-colors text-sm shadow-xl ${ticketActive ? 'bg-danger/20 text-danger border border-danger/50' : 'bg-primary text-black'}`}
        >
          {ticketActive ? 'STOP SYNC' : 'START SYNC'}
        </motion.button>
      </motion.div>

      {/* 2x2 Grid of Action Cards */}
      <div className="w-full max-w-sm grid grid-cols-2 gap-4 mb-8">
         <motion.button whileTap={{ scale: 0.95 }} onClick={() => setActiveTab('map')} className="bg-surface hover:bg-white/5 transition-colors backdrop-blur-xl border border-white/10 rounded-[28px] p-6 flex flex-col items-start gap-6 text-left">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(0,255,65,0.2)]">
               <Map size={24} />
            </div>
            <div>
              <p className="font-black text-white uppercase text-[15px] leading-tight">Explore<br/>Map</p>
            </div>
         </motion.button>

         <motion.button whileTap={{ scale: 0.95 }} onClick={() => setActiveTab('queue')} className="bg-surface hover:bg-white/5 transition-colors backdrop-blur-xl border border-white/10 rounded-[28px] p-6 flex flex-col items-start gap-6 text-left">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-[#F5A623] shadow-[0_0_15px_rgba(245,166,35,0.2)]">
               <Coffee size={24} />
            </div>
            <div>
              <p className="font-black text-white uppercase text-[15px] leading-tight">Order<br/>Food</p>
            </div>
         </motion.button>

         <motion.button whileTap={{ scale: 0.95 }} onClick={() => setActiveTab('map', { openModal: 'squad' })} className="bg-surface hover:bg-white/5 transition-colors backdrop-blur-xl border border-white/10 rounded-[28px] p-6 flex flex-col items-start gap-6 text-left">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-[#A66CFF] shadow-[0_0_15px_rgba(166,108,255,0.2)]">
               <Users size={24} />
            </div>
            <div>
              <p className="font-black text-white uppercase text-[15px] leading-tight">My<br/>Squad</p>
            </div>
         </motion.button>

         <motion.button whileTap={{ scale: 0.95 }} className="bg-danger/10 hover:bg-danger/20 transition-colors backdrop-blur-xl border border-danger/20 rounded-[28px] p-6 flex flex-col items-start gap-6 text-left">
            <div className="w-12 h-12 rounded-full bg-danger/20 flex items-center justify-center text-danger shadow-[0_0_15px_rgba(255,51,102,0.3)]">
               <AlertTriangle size={24} />
            </div>
            <div>
              <p className="font-black text-white uppercase text-[15px] leading-tight">S.O.S.<br/>Alert</p>
            </div>
         </motion.button>
      </div>

      {/* Venue Pulse Card */}
      <div className="w-full max-w-sm bg-surface backdrop-blur-xl border border-white/10 rounded-[32px] p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3b82f6]/10 to-transparent pointer-events-none"></div>
        <div className="flex items-center gap-2 mb-4 relative z-10">
          <Activity size={16} className="text-[#3b82f6]" />
          <p className="text-[10px] text-[#3b82f6] font-bold uppercase tracking-widest">Venue Pulse</p>
        </div>
        
        <div className="h-10 relative z-10 overflow-hidden">
            <AnimatePresence mode="popLayout">
              <motion.p 
                 key={pulseIndex}
                 initial={{ y: 20, opacity: 0 }}
                 animate={{ y: 0, opacity: 1 }}
                 exit={{ y: -20, opacity: 0 }}
                 transition={{ duration: 0.4 }}
                 className="text-lg font-black text-white leading-tight uppercase absolute inset-0"
              >
                 {crowds[pulseIndex]}
              </motion.p>
            </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default HomeScreen;
