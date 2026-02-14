"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Play, Film, X, Music } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useValentine } from '@/utils/ValentineContext';

const DEFAULT_VIDEO = "https://assets.mixkit.io/videos/preview/mixkit-heart-shaped-balloons-floating-in-the-sky-4288-large.mp4";

const SecretCinema = () => {
  const { config } = useValentine();
  const [passcode, setPasscode] = useState(['', '', '', '']);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [error, setError] = useState(false);
  const [showCinema, setShowCinema] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState('');

  useEffect(() => {
    if (config) {
        setSelectedTrack(config.spotifyTracks.day12);
    }
  }, [config]);

  useEffect(() => {
    const saved = localStorage.getItem(`secret_cinema_unlocked_${config?.passcode}`);
    if (saved === 'true') {
      setIsUnlocked(true);
    }
  }, [config]);

  const handleInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newPasscode = [...passcode];
    newPasscode[index] = value.slice(-1);
    setPasscode(newPasscode);
    setError(false);

    if (value && index < 3) {
      const nextInput = document.getElementById(`digit-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !passcode[index] && index > 0) {
      const prevInput = document.getElementById(`digit-${index - 1}`);
      prevInput?.focus();
    }
  };

  const checkPasscode = () => {
    if (!config) return;
    const enteredCode = passcode.join('');
    if (enteredCode === config.passcode) {
      setIsUnlocked(true);
      localStorage.setItem(`secret_cinema_unlocked_${config.passcode}`, 'true');
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.8 },
        colors: ['#D63447', '#F7CAC9', '#D4AF37']
      });
    } else {
      setError(true);
      setPasscode(['', '', '', '']);
      document.getElementById('digit-0')?.focus();
    }
  };

  useEffect(() => {
    if (passcode.every(digit => digit !== '')) {
      checkPasscode();
    }
  }, [passcode]);

  if (!config) return null;

  const tracks = [
    { id: config.spotifyTracks.day12, title: "Our Beginning" },
    { id: config.spotifyTracks.day13, title: "Our Journey" },
    { id: config.spotifyTracks.day14, title: "Today & Always" },
    ...(config.spotifyTracks.extra || []).map((id, i) => ({ id, title: `Extra Song ${i + 1}` }))
  ];

  if (showCinema) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[500] bg-black flex flex-col md:flex-row overflow-hidden"
      >
        <div className="w-full md:w-[400px] h-1/3 md:h-full bg-zinc-950/20 backdrop-blur-3xl border-r border-white/5 flex flex-col p-6 md:p-12 shrink-0 overflow-y-auto custom-scrollbar z-10">
          <div className="flex items-center gap-3 text-valentine-red mb-8 px-2 shrink-0">
            <Music size={28} className="animate-pulse" />
            <h3 className="font-bold text-sm tracking-widest uppercase opacity-60 text-white/80">Soundtrack</h3>
          </div>
          
          <div className="space-y-6">
            {tracks.filter(t => !!t.id).map((track) => (
              <div 
                key={track.id} 
                className={`relative transition-all duration-700 cursor-pointer ${selectedTrack === track.id ? 'scale-105 opacity-100' : 'opacity-40 hover:opacity-60'}`}
                onClick={() => setSelectedTrack(track.id)}
              >
                <iframe
                  style={{ borderRadius: '12px' }}
                  src={`https://open.spotify.com/embed/track/${track.id}?utm_source=generator&theme=0`}
                  width="100%"
                  height="80"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                ></iframe>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-grow flex flex-col items-center justify-center p-4 relative bg-black">
          <button 
            onClick={() => setShowCinema(false)}
            className="absolute top-8 right-8 text-white/20 hover:text-white transition-all z-50 p-3"
          >
            <X size={32} />
          </button>

          <div className="h-[70vh] aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-zinc-800 relative">
            <video 
              src={(config.plan === 'pro' && config.videoUrl) ? config.videoUrl : DEFAULT_VIDEO} 
              controls 
              autoPlay 
              muted
              loop
              className="w-full h-full object-cover"
            />
          </div>
          
          <h2 className="mt-8 text-4xl font-bold text-valentine-red font-sacramento text-center">
            {config.plan === 'pro' ? 'Our Joyful Moments' : 'A Special Delivery'}
          </h2>
        </div>
      </motion.div>
    );
  }

  return (
    <section className="mt-20 mb-12 py-12 px-6 rounded-3xl bg-white/30 backdrop-blur-md border-2 border-valentine-pink/20 text-center relative overflow-hidden">
      {!isUnlocked ? (
        <div className="max-w-xs mx-auto space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-valentine-pink/20 text-valentine-red mb-2">
            <Lock size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-valentine-red mb-1">Secret Cinema</h2>
            <p className="text-valentine-soft text-sm">Enter the passcode to unlock.</p>
          </div>
          <div className="flex justify-center gap-3">
            {passcode.map((digit, idx) => (
              <input
                key={idx}
                id={`digit-${idx}`}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleInput(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`w-12 h-16 text-center text-2xl font-bold rounded-xl border-2 transition-all outline-none ${error ? 'border-red-500 bg-red-50' : 'border-valentine-pink/30 focus:border-valentine-red bg-white/50'}`}
                autoComplete="off"
              />
            ))}
          </div>
          {error && <p className="text-red-500 text-xs font-bold">Try again!</p>}
        </div>
      ) : (
        <div className="max-w-md mx-auto space-y-6">
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-full bg-valentine-red text-white shadow-xl">
            <Film size={40} />
          </div>
          <h2 className="text-3xl font-bold text-valentine-red font-sacramento text-5xl mb-2">Unlocked!</h2>
          <button 
            onClick={() => setShowCinema(true)}
            className="px-10 py-4 bg-valentine-red text-white rounded-full text-xl font-bold shadow-xl hover:scale-105 transition-all flex items-center gap-3 mx-auto"
          >
            <Play size={24} className="fill-current" />
            Start Movie
          </button>
        </div>
      )}
    </section>
  );
};

export default SecretCinema;
