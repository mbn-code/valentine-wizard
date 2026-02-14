"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Heart, Music } from 'lucide-react';
import { useValentine } from '@/utils/ValentineContext';

interface InvitationProps {
  onComplete: () => void;
}

const Invitation = ({ onComplete }: InvitationProps) => {
  const { config } = useValentine();
  const [taps, setTaps] = useState(0);
  const [phase, setPhase] = useState<'tapping' | 'question' | 'teaser'>('tapping');
  const [noButtonPos, setNoButtonPos] = useState({ x: 0, y: 0 });

  const resetNoButton = () => {
    setNoButtonPos({ x: 0, y: 0 });
  };

  useEffect(() => {
    window.addEventListener('resize', resetNoButton);
    return () => window.removeEventListener('resize', resetNoButton);
  }, []);

  const handleTap = () => {
    const nextTaps = taps + 1;
    setTaps(nextTaps);

    if (nextTaps >= 10) {
      setPhase('question');
    }
  };

  const moveNoButton = () => {
    const btnWidth = 100;
    const btnHeight = 50;
    const padding = 20;
    
    // Calculate available space
    const maxWidth = window.innerWidth - btnWidth - padding;
    const maxHeight = window.innerHeight - btnHeight - padding;
    
    // Random position within screen bounds
    const x = Math.random() * (maxWidth - padding) + padding - (window.innerWidth / 2 - btnWidth / 2);
    const y = Math.random() * (maxHeight - padding) + padding - (window.innerHeight / 2 - btnHeight / 2);
    
    setNoButtonPos({ x, y });
  };

  const handleYes = () => {
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D63447', '#F7CAC9', '#FFF5E1']
    });

    setPhase('teaser');
    
    setTimeout(() => {
      onComplete();
    }, 4000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-valentine-cream overflow-hidden">
      <AnimatePresence mode="wait">
        {phase === 'tapping' && (
          <motion.div 
            key="tapping"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="text-center"
          >
            <motion.h1 
              className="text-3xl md:text-4xl font-bold text-valentine-red mb-8"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              Tap the heart
            </motion.h1>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleTap}
              className="relative group"
            >
              <div className="absolute -inset-4 bg-valentine-pink/30 rounded-full blur-xl group-hover:bg-valentine-pink/50 transition duration-500" />
              <Heart 
                aria-hidden="true"
                className={`relative transition-colors duration-300 w-24 h-24 md:w-32 md:h-32 ${taps > 0 ? 'fill-valentine-red text-valentine-red' : 'text-valentine-pink hover:text-valentine-red'}`}
              />
              {taps > 0 && (
                <motion.span 
                  initial={{ opacity: 0, y: 0 }}
                  animate={{ opacity: 1, y: -40 }}
                  key={taps}
                  className="absolute top-0 left-1/2 -translate-x-1/2 text-2xl font-bold text-valentine-red"
                >
                  {taps}
                </motion.span>
              )}
            </motion.button>
          </motion.div>
        )}

        {phase === 'question' && (
          <motion.div 
            key="question"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-valentine-red leading-tight">
              {config?.names.partner2}, will you be my Valentine?
            </h2>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleYes}
                className="px-12 py-4 bg-valentine-red text-white rounded-full text-2xl font-bold shadow-lg hover:bg-valentine-red/90 transition-colors"
              >
                Yes
              </motion.button>

              <motion.button
                animate={{ x: noButtonPos.x, y: noButtonPos.y }}
                onMouseEnter={moveNoButton}
                tabIndex={-1}
                className="px-12 py-4 bg-valentine-pink text-valentine-red rounded-full text-2xl font-bold shadow-md cursor-default"
              >
                No
              </motion.button>
            </div>
          </motion.div>
        )}

        {phase === 'teaser' && (
          <motion.div 
            key="teaser"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <h2 className="text-5xl font-bold text-valentine-red">YES! ❤️</h2>
            <p className="text-xl text-valentine-soft">I knew you'd say yes, {config?.names.partner2}.</p>
            <div className="py-10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <Music size={60} aria-hidden="true" className="mx-auto text-valentine-pink" />
              </motion.div>
            </div>
            <p className="text-lg font-medium text-valentine-red animate-pulse">
              Come back on Feb 14th for your full experience...
            </p>
            
            {config?.plan === 'free' && (
              <div className="pt-12">
                <p className="text-[10px] text-valentine-soft uppercase tracking-[0.2em] font-bold">Powered by Valentine Wizard</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Invitation;
