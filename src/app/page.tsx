"use client";

import React, { useState, useEffect } from 'react';
import { getCurrentPhase } from '@/utils/date';
import Invitation from '@/components/Invitation';
import Dashboard from '@/components/Dashboard';
import { useValentine } from '@/utils/ValentineContext';
import Link from 'next/link';
import { Heart, Check, Sparkles, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const [phase, setPhase] = useState<'invitation' | 'dashboard' | 'loading'>('loading');
  const { config } = useValentine();

  useEffect(() => {
    if (config === null) return; 

    const isCompleted = localStorage.getItem(`valentine_completed_${JSON.stringify(config.names)}`) === 'true';
    const currentPhase = getCurrentPhase();

    if (isCompleted || currentPhase === 'dashboard') {
      setPhase('dashboard');
    } else {
      setPhase('invitation');
    }
  }, [config]);

  if (config === null) {
    return (
      <main className="min-h-screen bg-valentine-cream text-center overflow-x-hidden">
        {/* Hero Section */}
        <section className="min-h-screen flex flex-col items-center justify-center p-8 relative">
          <div className="absolute inset-0 pointer-events-none">
             {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], y: [0, -100] }}
                  transition={{ duration: 5, repeat: Infinity, delay: i * 0.5 }}
                  className="absolute"
                  style={{ 
                    left: `${Math.random() * 100}%`, 
                    top: `${Math.random() * 100}%` 
                  }}
                >
                  <Heart size={24} className="text-valentine-red/20 fill-current" />
                </motion.div>
             ))}
          </div>

          <div className="space-y-6 max-w-2xl relative z-10">
            <Heart className="text-valentine-red w-20 h-20 mx-auto fill-valentine-red animate-pulse" />
            <h1 className="text-6xl md:text-8xl font-bold text-valentine-red font-sacramento">Valentine Wizard</h1>
            <p className="text-xl md:text-2xl text-valentine-soft leading-relaxed">
              Create a personalized interactive sanctuary for your partner.
              Shared memories, favorite songs, and secret notes.
            </p>
            <div className="pt-8 flex flex-col md:flex-row gap-4 justify-center">
              <Link 
                href="/wizard"
                className="px-12 py-5 bg-valentine-red text-white rounded-full text-2xl font-bold shadow-xl hover:scale-105 transition-all flex items-center gap-2 justify-center"
              >
                <Zap className="fill-current" /> Start Creating
              </Link>
              <button 
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-12 py-5 border-2 border-valentine-red text-valentine-red rounded-full text-2xl font-bold hover:bg-valentine-red/5 transition-all"
              >
                View Plans
              </button>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 px-8 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-valentine-red mb-4 font-sacramento">Simple Pricing</h2>
            <p className="text-valentine-soft mb-16 max-w-lg mx-auto">Choose the perfect plan to celebrate your love story. No recurring subscriptions.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Free Plan */}
              <div className="p-8 rounded-3xl border-2 border-valentine-pink/20 hover:border-valentine-pink transition-all flex flex-col text-left">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-valentine-red mb-2">Basic Sanctuary</h3>
                  <p className="text-valentine-soft text-sm">Perfect for a sweet surprise.</p>
                </div>
                <div className="text-4xl font-bold text-valentine-red mb-8">$0</div>
                <ul className="space-y-4 mb-12 flex-grow">
                  <li className="flex items-center gap-3 text-valentine-soft"><Check className="text-green-500" size={20} /> Invitation Game</li>
                  <li className="flex items-center gap-3 text-valentine-soft"><Check className="text-green-500" size={20} /> Essential Dashboard</li>
                  <li className="flex items-center gap-3 text-valentine-soft"><Check className="text-green-500" size={20} /> 3 Secret Notes</li>
                  <li className="flex items-center gap-3 text-valentine-soft"><Check className="text-green-500" size={20} /> 1 Spotify Track</li>
                  <li className="flex items-center gap-3 text-valentine-soft/40"><X size={20} /> Custom Video Player</li>
                  <li className="flex items-center gap-3 text-valentine-soft/40"><X size={20} /> Personal Photo Gallery</li>
                </ul>
                <Link href="/wizard" className="w-full py-4 text-center border-2 border-valentine-red text-valentine-red rounded-xl font-bold hover:bg-valentine-red/5 transition-colors">Choose Free</Link>
              </div>

              {/* Pro Plan */}
              <div className="p-8 rounded-3xl border-4 border-valentine-red relative flex flex-col text-left shadow-2xl scale-105 md:scale-110 bg-valentine-red/5">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-valentine-red text-white px-6 py-2 rounded-full font-bold text-sm uppercase tracking-widest flex items-center gap-2 shadow-lg">
                  <Star size={16} className="fill-current" /> Most Popular
                </div>
                <div className="mb-8 pt-4">
                  <h3 className="text-2xl font-bold text-valentine-red mb-2">Pro Sanctuary</h3>
                  <p className="text-valentine-soft text-sm">Everything you need for the ultimate experience.</p>
                </div>
                <div className="text-4xl font-bold text-valentine-red mb-8">$9.99 <span className="text-sm font-normal text-valentine-soft">One-time payment</span></div>
                <ul className="space-y-4 mb-12 flex-grow">
                  <li className="flex items-center gap-3 text-valentine-soft font-bold"><Check className="text-green-500" size={20} /> Everything in Free</li>
                  <li className="flex items-center gap-3 text-valentine-soft"><Check className="text-green-500" size={20} /> Custom Secret Cinema Video</li>
                  <li className="flex items-center gap-3 text-valentine-soft"><Check className="text-green-500" size={20} /> Unlimited Secret Notes</li>
                  <li className="flex items-center gap-3 text-valentine-soft"><Check className="text-green-500" size={20} /> Full Spotify Soundtrack (3+ tracks)</li>
                  <li className="flex items-center gap-3 text-valentine-soft"><Check className="text-green-500" size={20} /> Custom Passcode</li>
                  <li className="flex items-center gap-3 text-valentine-soft"><Check className="text-green-500" size={20} /> Personal Gallery (URL integration)</li>
                  <li className="flex items-center gap-3 text-valentine-soft"><Check className="text-green-500" size={20} /> No "Valentine Wizard" Watermark</li>
                </ul>
                <Link href="/wizard" className="w-full py-4 text-center bg-valentine-red text-white rounded-xl font-bold shadow-lg hover:scale-[1.02] transition-all flex items-center gap-2 justify-center">
                  <Sparkles size={20} className="fill-current" /> Get Pro Now
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t bg-valentine-cream/50">
          <p className="text-valentine-soft text-sm">© 2026 Valentine Wizard. Made with ❤️ for lovers everywhere.</p>
        </footer>
      </main>
    );
  }

  if (phase === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-valentine-cream">
        <div className="w-8 h-8 border-4 border-valentine-red border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main>
      {phase === 'invitation' ? (
        <Invitation onComplete={() => {
          localStorage.setItem(`valentine_completed_${JSON.stringify(config.names)}`, 'true');
          setPhase('dashboard');
        }} />
      ) : (
        <Dashboard />
      )}
    </main>
  );
}

function X({ size }: { size: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
