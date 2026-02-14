"use client";

import React, { useState, useEffect } from 'react';
import { getCurrentPhase } from '@/utils/date';
import Invitation from '@/components/Invitation';
import Dashboard from '@/components/Dashboard';
import { useValentine } from '@/utils/ValentineContext';
import Link from 'next/link';
import { Heart, Check, Sparkles, Star, Zap, Music, ImageIcon, MessageSquare, Infinity as InfinityIcon } from 'lucide-react';
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
    
    // Always show invitation first if not completed, 
    // unless it's the free tier and we're past the date (original logic)
    // Actually, let's just always show it if not completed for a better experience.
    if (isCompleted) {
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
              Build a digital sanctuary for your partner.
            </p>
            <div className="pt-8 flex flex-col md:flex-row gap-4 justify-center">
              <Link 
                href="/wizard"
                className="px-12 py-5 bg-valentine-red text-white rounded-full text-2xl font-bold shadow-xl hover:scale-105 transition-all flex items-center gap-2 justify-center"
              >
                <Zap size={24} className="fill-current" /> Create Your Story
              </Link>
              <button 
                onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-12 py-5 border-2 border-valentine-red text-valentine-red rounded-full text-2xl font-bold hover:bg-valentine-red/5 transition-all"
              >
                Compare Plans
              </button>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 px-8 bg-white text-gray-800">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-valentine-red mb-16 font-sacramento text-center">Compare the Tiers</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
              {/* Free Plan */}
              <div className="p-8 rounded-3xl border-2 border-valentine-pink/20 flex flex-col text-left hover:border-valentine-pink transition-all">
                <h3 className="text-xl font-bold text-valentine-red mb-2">The Spark</h3>
                <div className="text-3xl font-bold text-valentine-red mb-6">$0</div>
                <ul className="space-y-3 mb-8 flex-grow text-sm">
                  <li className="flex items-center gap-3 text-valentine-soft"><Check className="text-green-500" size={16} /> 1 Day Countdown</li>
                  <li className="flex items-center gap-3 text-valentine-soft"><Check className="text-green-500" size={16} /> 3 Secret Notes</li>
                  <li className="flex items-center gap-3 text-valentine-soft"><Check className="text-green-500" size={16} /> Invitation Game</li>
                  <li className="flex items-center gap-3 text-valentine-soft/40"><X size={16} /> No Photo Gallery</li>
                  <li className="flex items-center gap-3 text-valentine-soft/40"><X size={16} /> Default Cinema Video</li>
                  <li className="flex items-center gap-3 text-valentine-soft/40"><X size={16} /> No Custom Background</li>
                  <li className="flex items-center gap-3 text-valentine-soft/40"><X size={16} /> "Valentine Wizard" Branding</li>
                </ul>
                <Link href="/wizard?plan=free" className="w-full py-3 text-center border-2 border-valentine-red text-valentine-red rounded-xl font-bold text-sm">Get Started</Link>
              </div>

              {/* Plus Plan */}
              <div className="p-8 rounded-3xl border-2 border-valentine-red relative flex flex-col text-left bg-white shadow-xl scale-105 z-10 border-t-8">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-valentine-red text-white px-4 py-1 rounded-full font-bold text-xs uppercase tracking-widest">Great Value</div>
                <h3 className="text-xl font-bold text-valentine-red mb-2 mt-2">The Romance</h3>
                <div className="text-3xl font-bold text-valentine-red mb-6">$4.99</div>
                <ul className="space-y-3 mb-8 flex-grow text-sm">
                  <li className="flex items-center gap-3 text-valentine-soft font-medium"><Check className="text-green-500" size={16} /> <b>7 Day</b> Countdown</li>
                  <li className="flex items-center gap-3 text-valentine-soft font-medium"><Check className="text-green-500" size={16} /> <b>10</b> Secret Notes</li>
                  <li className="flex items-center gap-3 text-valentine-soft font-medium"><Check className="text-green-500" size={16} /> <b>Full Gallery Upload</b></li>
                  <li className="flex items-center gap-3 text-valentine-soft font-medium"><Check className="text-green-500" size={16} /> <b>Custom Background</b></li>
                  <li className="flex items-center gap-3 text-valentine-soft font-medium"><Check className="text-green-500" size={16} /> Music for every day</li>
                  <li className="flex items-center gap-3 text-valentine-soft font-medium"><Check className="text-green-500" size={16} /> <b>No Watermark</b></li>
                  <li className="flex items-center gap-3 text-valentine-soft/40"><X size={16} /> Default Cinema Video</li>
                </ul>
                <Link href="/wizard?plan=plus" className="w-full py-4 text-center bg-valentine-red text-white rounded-xl font-bold shadow-lg">Upgrade Now</Link>
              </div>

              {/* Infinite Plan */}
              <div className="p-8 rounded-3xl border-2 border-valentine-pink/20 flex flex-col text-left hover:border-valentine-pink transition-all">
                <h3 className="text-xl font-bold text-valentine-red mb-2">The Sanctuary</h3>
                <div className="text-3xl font-bold text-valentine-red mb-6">$9.99</div>
                <ul className="space-y-3 mb-8 flex-grow text-sm">
                  <li className="flex items-center gap-3 text-valentine-soft"><Check className="text-green-500" size={16} /> <b>14 Day</b> Journey</li>
                  <li className="flex items-center gap-3 text-valentine-soft"><Check className="text-green-500" size={16} /> <b>Unlimited</b> Notes</li>
                  <li className="flex items-center gap-3 text-valentine-soft"><Check className="text-green-500" size={16} /> <b>Bulk Photo Gallery</b></li>
                  <li className="flex items-center gap-3 text-valentine-soft"><Check className="text-green-500" size={16} /> <b>Custom Cinema (Video)</b></li>
                  <li className="flex items-center gap-3 text-valentine-soft"><Check className="text-green-500" size={16} /> <b>Custom Passcodes</b></li>
                  <li className="flex items-center gap-3 text-valentine-soft"><Check className="text-green-500" size={16} /> <b>Custom Background</b></li>
                  <li className="flex items-center gap-3 text-valentine-soft"><Check className="text-green-500" size={16} /> Priority Processing</li>
                </ul>
                <Link href="/wizard?plan=infinite" className="w-full py-3 text-center border-2 border-valentine-pink text-valentine-soft rounded-xl font-bold text-sm">Go Infinite</Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-24 px-8 bg-valentine-cream/30 text-gray-800">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-valentine-red mb-12 font-sacramento text-center">Frequently Asked Questions</h2>
            <div className="space-y-6 text-left">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-valentine-pink/10">
                <h3 className="font-bold text-valentine-red mb-2 italic">How do I send it to my partner?</h3>
                <p className="text-sm text-valentine-soft">Once you finish the wizard, you'll get a unique link. Just copy and send it via text, DM, or email!</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-valentine-pink/10">
                <h3 className="font-bold text-valentine-red mb-2 italic">Does the link expire?</h3>
                <p className="text-sm text-valentine-soft">No. Since all the data is in the link itself, it will work as long as this website exists.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-valentine-pink/10">
                <h3 className="font-bold text-valentine-red mb-2 italic">Can I get a refund?</h3>
                <p className="text-sm text-valentine-soft">Due to the immediate processing and hosting of your media assets, all sales are final. Please use the free tier to test the experience first!</p>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-valentine-pink/10">
                <h3 className="font-bold text-valentine-red mb-2 italic">What happens to my photos?</h3>
                <p className="text-sm text-valentine-soft">Your photos are stored securely. You can permanently delete them at any time using the delete button in the Wizard.</p>
              </div>
            </div>
          </div>
        </section>

        <footer className="py-12 border-t bg-valentine-cream/50 text-gray-800">
          <div className="max-w-2xl mx-auto space-y-4 px-4 text-center">
            <p className="text-valentine-soft text-sm italic">"I originally built this as a private gift for my girlfriend. After friends asked to use it, I decided to turn it into a wizard for everyone."</p>
            <div className="h-[1px] w-12 bg-valentine-red/20 mx-auto" />
            <div className="flex justify-center gap-6 text-[10px] uppercase tracking-widest font-bold text-valentine-soft">
              <Link href="/privacy" className="hover:text-valentine-red transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-valentine-red transition-colors">Terms of Service</Link>
            </div>
            <p className="text-valentine-soft text-[10px] uppercase tracking-tighter">© 2026 Valentine Wizard • Built with ❤️ in Denmark</p>
          </div>
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
