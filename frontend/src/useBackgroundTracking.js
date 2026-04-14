import { useState, useEffect, useRef } from 'react';

export function useBackgroundTracking(userId) {
  const [isTrackingActive, setIsTrackingActive] = useState(false);
  const [syncStatus, setSyncStatus] = useState('OFF');
  const [speed, setSpeed] = useState(0);
  
  const audioRef = useRef(null);
  const wakeLockRef = useRef(null);

  // Synchronous toggled triggered directly by onClick
  const toggleTracking = () => {
    if (!isTrackingActive) {
      if (!audioRef.current) {
        audioRef.current = new Audio('/silence.mp3');
        audioRef.current.loop = true;
      }
      
      // Play immediately on user gesture to bypass Chrome/Safari Autoplay blocks
      audioRef.current.play().catch(e => console.error("Audio playback blocked:", e));

      const requestWakeLock = async () => {
        try {
          if ('wakeLock' in navigator) {
            wakeLockRef.current = await navigator.wakeLock.request('screen');
          }
        } catch (err) {
          console.error("WakeLock error:", err);
        }
      };
      requestWakeLock();
      
      setIsTrackingActive(true);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (wakeLockRef.current) {
        wakeLockRef.current.release().then(() => {
          wakeLockRef.current = null;
        });
      }
      setIsTrackingActive(false);
    }
  };

  // Re-request wake lock when visibility changes
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isTrackingActive) {
        try {
          if ('wakeLock' in navigator) {
            wakeLockRef.current = await navigator.wakeLock.request('screen');
          }
        } catch (err) {}
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (audioRef.current) audioRef.current.pause();
      if (wakeLockRef.current) wakeLockRef.current.release();
    };
  }, [isTrackingActive]);

  // 2. Adaptive Logic (Geolocation Speed Tracking)
  useEffect(() => {
    if (!isTrackingActive) {
      setSyncStatus('OFF');
      return;
    }

    let currentLat = 33.6805;
    let currentLng = -116.237;
    let currentSpeed = 0;
    
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        currentLat = pos.coords.latitude;
        currentLng = pos.coords.longitude;
        currentSpeed = pos.coords.speed !== null ? pos.coords.speed : (Math.random() > 0.5 ? 2.1 : 0);
        setSpeed(currentSpeed);
      },
      (err) => console.log("Geoloc error:", err),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
    );

    let timeoutId;
    
    const AdaptiveHeartbeat = () => {
      const intervalSecs = currentSpeed > 0.5 ? 30 : 180;
      setSyncStatus(currentSpeed > 0.5 ? 'SYNC ACTIVE' : 'POWER SAVING');
      
      fetch('http://127.0.0.1:5000/api/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: userId, 
          lat: currentLat, 
          lng: currentLng,
          speed: currentSpeed,
          interval: intervalSecs
        })
      }).catch(e => console.log("Heartbeat failed", e));
      
      timeoutId = setTimeout(AdaptiveHeartbeat, intervalSecs * 1000);
    };

    AdaptiveHeartbeat();

    return () => {
      navigator.geolocation.clearWatch(watchId);
      clearTimeout(timeoutId);
    };
  }, [isTrackingActive, userId]);

  return { isTrackingActive, toggleTracking, syncStatus, speed };
}
