import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Home, Map as MapIcon, Coffee } from 'lucide-react';
import HomeScreen from './HomeScreen';
import MapScreen from './MapScreen';
import QueueScreen from './QueueScreen';
import { useBackgroundTracking } from './useBackgroundTracking';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [modalCtx, setModalCtx] = useState(null);
  
  const { isTrackingActive, toggleTracking, syncStatus } = useBackgroundTracking('user123');

  const handleSetTab = (tab, ctx = null) => {
    setModalCtx(ctx);
    setActiveTab(tab);
  };

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'map', label: 'Venue Map', icon: MapIcon },
    { id: 'queue', label: 'Food', icon: Coffee }
  ];

  const renderScreen = () => {
    switch (activeTab) {
      case 'home': return <HomeScreen setActiveTab={handleSetTab} userId="user123" ticketActive={isTrackingActive} setTicketActive={toggleTracking} syncStatus={syncStatus} key="home" />;
      case 'map': return <MapScreen initialModal={modalCtx?.openModal} userId="user123" key="map" />;
      case 'queue': return <QueueScreen userId="user123" key="queue" />;
      default: return <HomeScreen setActiveTab={handleSetTab} userId="user123" ticketActive={isTrackingActive} setTicketActive={toggleTracking} syncStatus={syncStatus} key="home" />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-white overflow-hidden pb-24">
      <main className="flex-grow relative h-full">
        <AnimatePresence mode="wait">
          {renderScreen()}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-xl border-t border-white/10 px-8 py-4 flex justify-between items-center rounded-t-[32px]">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.85 }}
              onClick={() => handleSetTab(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 w-16 h-12 transition-colors ${isActive ? 'text-primary' : 'text-gray-500 hover:text-white/80'}`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'drop-shadow-[0_0_10px_rgba(0,255,65,0.6)]' : ''} />
              <span className="text-[10px] font-bold tracking-wider uppercase mt-1">{tab.label}</span>
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
}

export default App;
