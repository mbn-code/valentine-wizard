"use client";

import React, { useState, useEffect } from 'react';
import { getCurrentPhase } from '@/utils/date';
import Invitation from '@/components/Invitation';
import Dashboard from '@/components/Dashboard';
import { useValentine } from '@/utils/ValentineContext';
import Link from 'next/link';
import { Heart, Check, Sparkles, Star, Zap, Music, ImageIcon, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const [phase, setPhase] = useState<'invitation' | 'dashboard' | 'loading'>('loading');
  const { config } = useValentine();

  useEffect(() => {
    if (config === undefined) return; 
    if (config === null) {
        setPhase('loading');
        return;
    }

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
      <main className="min-h-screen bg-valentine-cream text-center overflow-x-hidden flex flex-col">
        {/* Hero Section */}
        <section className="flex-grow flex flex-col items-center justify-center p-8 relative">
          <div className="space-y-6 max-w-2xl relative z-10">
            <Heart size={80} className="text-valentine-red mx-auto fill-valentine-red animate-pulse" />
            <h1 className="text-6xl md:text-8xl font-bold text-valentine-red font-sacramento">Valentine Wizard</h1>
            <p className="text-xl md:text-2xl text-valentine-soft leading-relaxed">
              Create a personalized interactive sanctuary for your partner.
            </p>
            <div className="pt-8 flex flex-col md:flex-row gap-4 justify-center">
              <Link 
                href="/wizard"
                className="px-12 py-5 bg-valentine-red text-white rounded-full text-2xl font-bold shadow-xl hover:scale-105 transition-all flex items-center gap-2 justify-center"
              >
                <Zap size={24} className="fill-current" /> Start Creating
              </Link>
              <button 
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-12 py-5 border-2 border-valentine-red text-valentine-red rounded-full text-2xl font-bold hover:bg-valentine-red/5 transition-all"
              >
                Learn More
              </button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-8 bg-white/50">
            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="p-6 text-center space-y-4">
                    <Music className="mx-auto text-valentine-red" size={40} />
                    <h3 className="text-xl font-bold text-valentine-red">Your Soundtrack</h3>
                    <p className="text-sm text-valentine-soft">Personalized Spotify tracks that unlock over 3 days.</p>
                </div>
                <div className="p-6 text-center space-y-4">
                    <ImageIcon className="mx-auto text-valentine-red" size={40} />
                    <h3 className="text-xl font-bold text-valentine-red">Memory Gallery</h3>
                    <p className="text-sm text-valentine-soft">A beautiful scratch-off photo gallery for your special moments.</p>
                </div>
                <div className="p-6 text-center space-y-4">
                    <MessageSquare className="mx-auto text-valentine-red" size={40} />
                    <h3 className="text-xl font-bold text-valentine-red">Secret Notes</h3>
                    <p className="text-sm text-valentine-soft">Hidden messages that reveal themselves at specific times.</p>
                </div>
            </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 px-8 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-valentine-red mb-16 font-sacramento text-center">Simple Plans</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="p-8 rounded-3xl border-2 border-valentine-pink/20 flex flex-col text-left">
                <h3 className="text-2xl font-bold text-valentine-red mb-2">Free Sanctuary</h3>
                <div className="text-4xl font-bold text-valentine-red mb-8">$0</div>
                <ul className="space-y-4 mb-12 flex-grow">
                  <li className="flex items-center gap-3 text-valentine-soft"><Check className="text-green-500" size={20} /> Full Dashboard & Gallery</li>
                  <li className="flex items-center gap-3 text-valentine-soft"><Check className="text-green-500" size={20} /> All Spotify Stages (Feb 12-14)</li>
                  <li className="flex items-center gap-3 text-valentine-soft"><Check className="text-green-500" size={20} /> 10 Secret Notes</li>
                  <li className="flex items-center gap-3 text-valentine-soft"><Check className="text-green-500" size={20} /> Secret Cinema (Default Movie)</li>
                  <li className="flex items-center gap-3 text-valentine-soft"><Check className="text-green-500" size={20} /> Custom Passcode</li>
                </ul>
                <Link href="/wizard" className="w-full py-4 text-center border-2 border-valentine-red text-valentine-red rounded-xl font-bold">Choose Free</Link>
              </div>

              <div className="p-8 rounded-3xl border-4 border-valentine-red relative flex flex-col text-left bg-valentine-red/5">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-valentine-red text-white px-6 py-2 rounded-full font-bold text-sm uppercase flex items-center gap-2 shadow-lg">
                  <Star size={16} className="fill-current" /> Premium
                </div>
                <h3 className="text-2xl font-bold text-valentine-red mb-2 mt-4">Pro Sanctuary</h3>
                <div className="text-4xl font-bold text-valentine-red mb-8">$9.99</div>
                <ul className="space-y-4 mb-12 flex-grow">
                  <li className="flex items-center gap-3 text-valentine-soft font-bold"><Check className="text-green-500" size={20} /> Everything in Free</li>
                  <li className="flex items-center gap-3 text-valentine-soft"><Check className="text-green-500" size={20} /> <b>Custom Secret Cinema Video</b></li>
                  <li className="flex items-center gap-3 text-valentine-soft"><Check className="text-green-500" size={20} /> Unlimited Secret Notes</li>
                  <li className="flex items-center gap-3 text-valentine-soft"><Check className="text-green-500" size={20} /> Remove Branding</li>
                  <li className="flex items-center gap-3 text-valentine-soft"><Check className="text-green-500" size={20} /> Premium Themes (Coming Soon)</li>
                </ul>
                <Link href="/wizard" className="w-full py-4 text-center bg-valentine-red text-white rounded-xl font-bold shadow-lg">Get Pro Now</Link>
              </div>
            </div>
          </div>
        </section>

        <footer className="py-12 border-t bg-valentine-cream/50">
          <p className="text-valentine-soft text-sm">© 2026 Valentine Wizard</p>
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
