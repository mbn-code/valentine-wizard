"use client";

import React, { useState, useEffect } from 'react';
import { getCurrentPhase } from '@/utils/date';
import Invitation from '@/components/Invitation';
import Dashboard from '@/components/Dashboard';
import { useValentine } from '@/utils/ValentineContext';
import Link from 'next/link';
import { Heart } from 'lucide-react';

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
      <main className="min-h-screen bg-valentine-cream flex flex-col items-center justify-center p-8 text-center">
        <div className="space-y-6 max-w-2xl">
          <Heart className="text-valentine-red w-20 h-20 mx-auto fill-valentine-red animate-pulse" />
          <h1 className="text-5xl md:text-7xl font-bold text-valentine-red font-sacramento">Valentine Wizard</h1>
          <p className="text-xl text-valentine-soft leading-relaxed">
            Create a beautiful, personalized sanctuary for your significant other. 
            Fill it with your memories, favorite songs, and secret notes.
          </p>
          <div className="pt-8">
            <Link 
              href="/wizard"
              className="px-12 py-5 bg-valentine-red text-white rounded-full text-2xl font-bold shadow-xl hover:scale-105 transition-all inline-block"
            >
              Start Creating
            </Link>
          </div>
        </div>
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
