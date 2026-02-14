"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTimeTogether, isTrackUnlocked, getTimeUntil } from '@/utils/date';
import { Heart, Music, Clock, Bell, Download, X, Lock, Sparkles, Key } from 'lucide-react';
import Gallery from './Gallery';
import SecretCinema from './SecretCinema';
import Ambiance from './Ambiance';
import Link from 'next/link';
import { useValentine } from '@/utils/ValentineContext';
import DOMPurify from 'isomorphic-dompurify';

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

const UnlockableNote = ({ id, day, hour = 0, content }: { id: string, day: number, hour?: number, content: string }) => {
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
          className="bg-valentine-red text-white px-4 py-2 rounded-full shadow font-bold hover:bg-valentine-red/90 transition-all focus:outline-none text-xs"
          onClick={handleUnlock}
        >
          Unlock
        </button>
      </div>
    );
  }

  return (
    <div 
      className="italic text-base text-valentine-red p-2 leading-relaxed h-full flex items-center justify-center text-center break-words"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
    />
  );
};

const Dashboard = () => {
  const { config, isLocked, decryptWithPasscode } = useValentine();
  const [time, setTime] = useState(getTimeTogether());
  const [passcode, setPasscode] = useState(['', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isPremiumVerified, setIsPremiumVerified] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(getTimeTogether());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (config?.signature) {
        const verify = async () => {
            try {
                const partnerNames = `${config.names.partner1}:${config.names.partner2}`;
                const res = await fetch('/api/verify-premium', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        plan: config.plan, 
                        partnerNames, 
                        signature: config.signature 
                    })
                });
                const data = await res.json();
                setIsPremiumVerified(data.success);
            } catch (e) {
                console.error("Premium verification failed", e);
            }
        };
        verify();
    }
  }, [config]);

  const handleInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newPasscode = [...passcode];
    newPasscode[index] = value.slice(-1);
    setPasscode(newPasscode);
    setError(false);
    if (value && index < 3) {
      document.getElementById(`lock-digit-${index + 1}`)?.focus();
    }
  };

  const handleUnlock = async () => {
    setIsVerifying(true);
    const success = await decryptWithPasscode(passcode.join(''));
    if (!success) {
      setError(true);
      setPasscode(['', '', '', '']);
      document.getElementById('lock-digit-0')?.focus();
    }
    setIsVerifying(false);
  };

  useEffect(() => {
    if (passcode.every(digit => digit !== '')) {
      handleUnlock();
    }
  }, [passcode]);

  if (!config) return null;

  if (isLocked) {
    return (
      <main className="min-h-screen bg-valentine-cream flex flex-col items-center justify-center p-8 text-center text-gray-800">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full bg-white p-12 rounded-3xl shadow-xl space-y-8 border-2 border-valentine-pink/20">
          <div className="w-20 h-20 bg-valentine-red/10 rounded-full flex items-center justify-center mx-auto text-valentine-red">
            <Lock size={40} />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-valentine-red font-sacramento text-5xl">Locked Sanctuary</h2>
            <p className="text-valentine-soft mt-2 italic text-sm">Enter the passcode to mathematically unlock the memories.</p>
          </div>
          
          <div className="flex justify-center gap-3">
            {passcode.map((digit, idx) => (
              <input
                key={idx}
                id={`lock-digit-${idx}`}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleInput(idx, e.target.value)}
                className={`w-12 h-16 text-center text-3xl font-bold rounded-xl border-2 transition-all outline-none ${error ? 'border-red-500 bg-red-50' : 'border-valentine-pink/30 focus:border-valentine-red bg-white shadow-inner'}`}
                autoComplete="off"
              />
            ))}
          </div>
          {isVerifying && <div className="animate-spin text-valentine-red inline-block mx-auto"><Sparkles size={24} /></div>}
          {error && <p className="text-red-500 text-xs font-bold animate-shake">Incorrect code. Try again.</p>}
        </motion.div>
      </main>
    );
  }

  const getSpotifyItems = () => {
    const items = [];
    const totalDays = config.totalDays || 3;
    for (let i = 0; i < totalDays; i++) {
      const dayNum = 14 - i;
      const trackId = config.spotifyTracks[`day${dayNum}`];
      items.push({
        day: dayNum,
        id: trackId,
        title: dayNum === 14 ? 'Feb 14: The Finale' : `Feb ${dayNum}: The Countdown`
      });
    }
    return items.sort((a, b) => a.day - b.day);
  };

  const spotifyItems = getSpotifyItems();

  return (
    <div className="min-h-screen bg-valentine-cream p-4 md:p-8 relative pb-32">
      {config.backgroundUrl && (
        <div 
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{ 
            backgroundImage: `url(${config.backgroundUrl})`,
            opacity: 0.15
          }}
        />
      )}
      <Ambiance />
      
      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        <header className="text-center space-y-2">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold text-valentine-red select-none font-sacramento flex items-center justify-center gap-3"
          >
            Our Sanctuary
            {isPremiumVerified && (
                <div className="group relative">
                    <Sparkles size={24} className="text-yellow-500 fill-yellow-500 animate-pulse" />
                    <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-32 p-2 bg-gray-800 text-white text-[8px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl font-sans uppercase tracking-widest font-bold">
                        Verified Premium
                    </span>
                </div>
            )}
          </motion.h1>
          <p 
            className="text-valentine-soft font-medium text-sm md:text-base italic"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(`For ${config.names.partner2}, with love from ${config.names.partner1}`) }}
          />
        </header>

        <section className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <motion.div whileHover={{ scale: 1.02 }} className="md:col-span-2 bg-white/50 backdrop-blur-sm border-2 border-valentine-pink/20 rounded-3xl p-6 shadow-sm">
                <h3 className="text-valentine-soft text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-left">
                  <Clock size={14} />
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

             {spotifyItems.map((item, idx) => {
                const safeId = item.id?.replace(/[^a-zA-Z0-9]/g, '');
                return (
                  <motion.div
                    key={item.day}
                    whileHover={{ scale: 1.02 }}
                    className={`${idx === spotifyItems.length - 1 && spotifyItems.length % 2 !== 0 ? 'md:col-span-2' : 'col-span-1'} bg-white/50 backdrop-blur-sm border-2 border-valentine-pink/20 rounded-3xl p-6 shadow-sm flex flex-col`}
                  >
                    <h3 className="text-valentine-soft text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-left">
                      <Music size={14} />
                      {item.title}
                    </h3>
                    <div className="flex-grow">
                      {isTrackUnlocked(item.day) && safeId ? (
                        <div className="w-full h-full min-h-[152px]">
                          <iframe 
                            style={{ borderRadius: '12px' }} 
                            src={`https://open.spotify.com/embed/track/${safeId}?utm_source=generator`} 
                            width="100%" height="152" frameBorder="0" 
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                            loading="lazy"
                          ></iframe>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full space-y-2 text-valentine-soft">
                            <Clock size={40} />
                            <p className="text-sm font-medium">Unlocks in</p>
                            <LiveCountdown day={item.day} />
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
             })}
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
                className="bg-white/50 backdrop-blur-sm border-2 border-valentine-pink/20 rounded-3xl p-6 shadow-sm flex flex-col min-h-[120px]"
              >
                <h3 className="text-valentine-soft text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-left">
                  <Heart size={14} />
                  Note
                </h3>
                <div className="flex-grow">
                  <UnlockableNote 
                    id={note.id} 
                    day={note.day} 
                    hour={note.hour}
                    content={note.content}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <Gallery />
        <SecretCinema />

        <div className="pt-20 pb-10 text-center opacity-30 hover:opacity-100 transition-opacity">
            <Link href="/revoke" className="text-[10px] uppercase tracking-widest font-bold text-valentine-soft hover:text-red-500">
                Revoke Sanctuary Access
            </Link>
        </div>
      </div>

      {config.plan === 'spark' && (
        <div className="fixed bottom-0 left-0 w-full p-4 bg-white/80 backdrop-blur-md border-t border-valentine-pink/20 text-center z-50 text-gray-800">
            <p className="text-[10px] uppercase tracking-[0.2em] text-valentine-soft font-bold flex items-center justify-center gap-2">
                Created with <span className="text-valentine-red">Valentine Wizard</span>
                <Link href="/wizard" className="underline hover:text-valentine-red ml-2">Upgrade yours →</Link>
            </p>
            <div className="flex justify-center gap-4 text-[8px] uppercase tracking-widest font-bold text-valentine-soft mt-1 opacity-50">
              <Link href="/privacy" className="hover:text-valentine-red text-gray-800">Privacy</Link>
              <Link href="/terms" className="hover:text-valentine-red text-gray-800">Terms</Link>
              <Link href="/revoke" className="hover:text-red-500 text-gray-800">Revoke</Link>
            </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
