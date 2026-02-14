"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTimeTogether, isTrackUnlocked, getTimeUntil } from '@/utils/date';
import { Heart, Music, Clock, RefreshCw, Bell, Download, X, Lock } from 'lucide-react';
import Gallery from './Gallery';
import SecretCinema from './SecretCinema';
import Ambiance from './Ambiance';
import Link from 'next/link';
import { useValentine } from '@/utils/ValentineContext';

declare global {
  interface Window {
    electronAPI?: {
      closeApp: () => void;
      isElectron: boolean;
    };
  }
}

const LiveCountdown = ({ day, hour = 0 }: { day: number, hour?: number }) => {
  const [timeLeft, setTimeLeft] = useState(getTimeUntil(day, hour));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeUntil(day, hour));
    }, 1000);
    return () => clearInterval(timer);
  }, [day, hour]);

  return (
    <div className="flex gap-1 text-[10px] font-mono font-bold text-valentine-soft">
      <span>{String(timeLeft.hours).padStart(2, '0')}h</span>
      <span>:</span>
      <span>{String(timeLeft.minutes).padStart(2, '0')}m</span>
      <span>:</span>
      <span>{String(timeLeft.seconds).padStart(2, '0')}s</span>
    </div>
  );
};

const UnlockableNote = ({ id, day, hour = 0, content }: { id: string, day: number, hour?: number, content: React.ReactNode }) => {
  const [timerDone, setTimerDone] = React.useState(false);
  const [unlocked, setUnlocked] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState(getTimeUntil(day, hour));
  const storageKey = `user_unlocked_${id}`;

  React.useEffect(() => {
    const userUnlocked = localStorage.getItem(storageKey) === 'true';
    setUnlocked(userUnlocked);
    const interval = setInterval(() => {
      const t = getTimeUntil(day, hour);
      setTimeLeft(t);
      if (t.hours === 0 && t.minutes === 0 && t.seconds === 0) {
        setTimerDone(true);
      } else {
        setTimerDone(false);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [day, hour, storageKey]);

  const handleUnlock = () => {
    localStorage.setItem(storageKey, 'true');
    setUnlocked(true);
  };

  if (!timerDone) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2 text-valentine-soft relative">
        <Clock size={24} aria-hidden="true" />
        <div className="group relative">
          <span className="font-mono text-xs">{String(timeLeft.hours).padStart(2, '0')}h:{String(timeLeft.minutes).padStart(2, '0')}m:{String(timeLeft.seconds).padStart(2, '0')}s</span>
        </div>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2 text-valentine-soft">
        <button 
          className="bg-valentine-red text-white px-4 py-2 rounded-full shadow font-bold hover:bg-valentine-red/90 transition-all focus:outline-none"
          onClick={handleUnlock}
        >
          Unlock
        </button>
      </div>
    );
  }
  return <>{content}</>;
};

const Dashboard = () => {
  const { config } = useValentine();
  const [time, setTime] = useState(getTimeTogether());
  const [showAdmin, setShowAdmin] = useState(false);
  const [tapCount, setTapCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(getTimeTogether());
    }, 1000);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'R') {
        setShowAdmin(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearInterval(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleTitleTap = () => {
    const newCount = tapCount + 1;
    setTapCount(newCount);
    if (newCount >= 5) {
      setShowAdmin(true);
      setTapCount(0);
    }
    setTimeout(() => setTapCount(0), 3000);
  };

  const handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  const LockedState = ({ day, hour = 0 }: { day: number, hour?: number }) => {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-2 text-valentine-soft">
        <Clock size={40} aria-hidden="true" />
        <p className="text-sm font-medium">Unlocks in</p>
        <LiveCountdown day={day} hour={hour} />
      </div>
    );
  };

  if (!config) return null;

  const getSpotifyItems = () => {
    const items = [];
    const totalDays = config.totalDays || 3;
    for (let i = 0; i < totalDays; i++) {
      const dayNum = 14 - i;
      const trackId = config.spotifyTracks[`day${dayNum}`];
      items.push({
        day: dayNum,
        id: trackId,
        title: dayNum === 14 ? 'Feb 14: Valentine\'s Day' : `Feb ${dayNum}: The Countdown`
      });
    }
    return items.sort((a, b) => a.day - b.day);
  };

  const spotifyItems = getSpotifyItems();

  return (
    <div className="min-h-screen bg-valentine-cream p-4 md:p-8 relative pb-32">
      <Ambiance />
      
      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        <header className="text-center space-y-2">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleTitleTap}
            className="text-4xl md:text-6xl font-bold text-valentine-red cursor-pointer select-none font-sacramento"
          >
            Our Sanctuary
          </motion.h1>
          <p className="text-valentine-soft font-medium text-sm md:text-base italic">Everything I love about us, in one place.</p>
        </header>

        <section className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <motion.div whileHover={{ scale: 1.02 }} className="md:col-span-2 bg-white/50 backdrop-blur-sm border-2 border-valentine-pink/20 rounded-3xl p-6 shadow-sm">
                <h3 className="text-valentine-soft text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Clock size={14} aria-hidden="true" />
                  Our Time Together
                </h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-center items-center">
                  {Object.entries(time).map(([unit, value]) => (
                    <div key={unit} className="flex flex-col">
                      <span className="text-2xl md:text-3xl font-bold text-valentine-red">{value}</span>
                      <span className="text-[10px] uppercase tracking-wider text-valentine-soft">{unit}</span>
                    </div>
                  ))}
                </div>
             </motion.div>

             {spotifyItems.map((item, idx) => (
                <motion.div
                  key={item.day}
                  whileHover={{ scale: 1.02 }}
                  className={`${idx === spotifyItems.length - 1 && spotifyItems.length % 2 !== 0 ? 'md:col-span-2' : 'col-span-1'} bg-white/50 backdrop-blur-sm border-2 border-valentine-pink/20 rounded-3xl p-6 shadow-sm flex flex-col`}
                >
                  <h3 className="text-valentine-soft text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Music size={14} aria-hidden="true" />
                    {item.title}
                  </h3>
                  <div className="flex-grow">
                    {isTrackUnlocked(item.day) && item.id ? (
                      <div className="w-full h-full min-h-[152px]">
                        <iframe 
                          style={{ borderRadius: '12px' }} 
                          src={`https://open.spotify.com/embed/track/${item.id}?utm_source=generator`} 
                          width="100%" height="152" frameBorder="0" 
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                          loading="lazy"
                        ></iframe>
                      </div>
                    ) : (
                      <LockedState day={item.day} />
                    )}
                  </div>
                </motion.div>
             ))}
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-[1px] flex-grow bg-valentine-pink/30" />
            <h2 className="text-3xl font-bold text-valentine-red font-sacramento text-5xl px-4">Notes</h2>
            <div className="h-[1px] flex-grow bg-valentine-pink/30" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.notes.map((note) => (
              <motion.div
                key={note.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white/50 backdrop-blur-sm border-2 border-valentine-pink/20 rounded-3xl p-6 shadow-sm flex flex-col"
              >
                <h3 className="text-valentine-soft text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Heart size={14} aria-hidden="true" />
                  Note
                </h3>
                <div className="flex-grow">
                  <UnlockableNote 
                    id={note.id} 
                    day={note.day} 
                    hour={note.hour}
                    content={
                      <div className="italic text-base text-valentine-red p-2 leading-relaxed h-full flex items-center justify-center text-center break-words">
                        {note.content}
                      </div>
                    }
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <Gallery />
        <SecretCinema />
      </div>

      {config.plan === 'free' && (
        <div className="fixed bottom-0 left-0 w-full p-4 bg-white/80 backdrop-blur-md border-t border-valentine-pink/20 text-center z-50">
            <p className="text-xs text-valentine-soft font-medium flex items-center justify-center gap-2">
                Created with <span className="font-bold text-valentine-red uppercase tracking-tighter">Valentine Wizard</span>
                <Link href="/wizard" className="underline hover:text-valentine-red ml-2">Make yours free →</Link>
            </p>
        </div>
      )}

      {showAdmin && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-8">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-valentine-red mb-6">Admin Panel</h2>
            <button 
              onClick={handleReset}
              className="w-full py-4 border-2 border-valentine-red text-valentine-red rounded-xl font-bold hover:bg-valentine-red hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={20} /> Reset All Data
            </button>
            <button onClick={() => setShowAdmin(false)} className="mt-4 w-full text-valentine-soft font-bold">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
