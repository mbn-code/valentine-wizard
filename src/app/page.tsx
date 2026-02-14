"use client";

import React, { useState, useEffect } from 'react';
import { getCurrentPhase } from '@/utils/date';
import Invitation from '@/components/Invitation';
import Dashboard from '@/components/Dashboard';
import { useValentine } from '@/utils/ValentineContext';
import Link from 'next/link';
import { Heart, Check, Sparkles, Star, Zap, Music, ImageIcon, MessageSquare, Infinity as InfinityIcon, X, Shield, Lock, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [phase, setPhase] = useState<'invitation' | 'dashboard' | 'loading'>('loading');
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);
  const { config, setPreviewConfig } = useValentine();

  useEffect(() => {
    // We only care about the URL-based config here
    const searchParams = new URLSearchParams(window.location.search);
    const hasUrlConfig = searchParams.get('d') && window.location.hash;

    if (!hasUrlConfig && !config) {
        setPhase('loading');
        return;
    }

    const isCompleted = localStorage.getItem(`valentine_completed_${JSON.stringify(config?.names)}`) === 'true';
    
    if (isCompleted) {
      setPhase('dashboard');
    } else {
      setPhase('invitation');
    }
  }, [config]);

  // Determine if we should show the landing page
  // We show landing page if there's no URL config OR if we explicitly started a preview
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const isRealSanctuary = searchParams?.get('d') && (typeof window !== 'undefined' && window.location.hash);

  if (!isRealSanctuary || isPreviewing) {
    if (isPreviewing || !isRealSanctuary) {
        return (
          <main className="min-h-screen bg-valentine-cream text-center overflow-x-hidden flex flex-col">
            {/* Live Preview Overlay */}
            <AnimatePresence>
                {isPreviewing && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[2000] bg-valentine-cream overflow-y-auto"
                    >
                        {/* Fixed Header */}
                        <div className="fixed top-4 left-4 right-4 p-2 bg-white/95 backdrop-blur-md border-2 border-valentine-red rounded-2xl flex justify-between items-center z-[3000] shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500 text-gray-800">
                            <div className="flex items-center gap-2 pl-2">
                                <Sparkles className="text-valentine-red" size={18} />
                                <span className="text-[10px] md:text-xs font-bold text-valentine-red uppercase tracking-widest">Sanctuary Demo</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <label className="hidden sm:flex items-center gap-2 cursor-pointer group">
                                    <div className="relative">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer" 
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    localStorage.setItem('debug_unlock_all', 'true');
                                                } else {
                                                    localStorage.removeItem('debug_unlock_all');
                                                }
                                                setPreviewRefreshKey(prev => prev + 1);
                                            }}
                                        />
                                        <div className="w-8 h-4 bg-gray-300 rounded-full peer peer-checked:bg-valentine-red transition-all shadow-inner"></div>
                                        <div className="absolute left-1 top-1 w-2 h-2 bg-white rounded-full peer-checked:left-5 transition-all shadow-md"></div>
                                    </div>
                                <span className="text-[8px] font-bold text-valentine-soft uppercase tracking-widest group-hover:text-valentine-red transition-colors">Unlock All</span>
                            </label>
                            <button 
                                onClick={() => {
                                    setIsPreviewing(false);
                                    setPreviewConfig(null);
                                    localStorage.removeItem('debug_unlock_all');
                                }}
                                className="px-6 py-2 bg-valentine-red text-white rounded-xl font-bold shadow-lg text-xs uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2"
                            >
                                <ArrowLeft size={14} /> Back to Homepage
                            </button>
                        </div>
                    </div>

                        
                        <div className="relative">
                            <PreviewApp forceUpdateKey={previewRefreshKey} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
    
            {/* Hero Section */}
            <section className="flex-grow flex flex-col items-center justify-center p-8 relative">
              <div className="space-y-6 max-w-2xl relative z-10 text-gray-800">
                <Heart size={80} className="text-valentine-red mx-auto fill-valentine-red animate-pulse" />
                <h1 className="text-6xl md:text-8xl font-bold text-valentine-red font-sacramento text-center">Valentine Wizard</h1>
                <p className="text-xl md:text-2xl text-valentine-soft leading-relaxed text-gray-800">
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
                    onClick={() => {
                        const DEMO_CONFIG: any = {
                            plan: 'infinite',
                            names: { partner1: "Alex", partner2: "My Love" },
                            anniversaryDate: "2022-07-28T00:00:00",
                            totalDays: 3,
                            spotifyTracks: {
                              "day12": "4riDfclV7kPDT9D58FpmHd",
                              "day13": "0TZOdKFWNYfnwewAP8R4D8",
                              "day14": "657CttNzh41EseXiePl3qC",
                            },
                            notes: [
                              { id: "note1", day: 12, content: "My little monkey <3" },
                              { id: "note2", day: 12, content: "The library :)" },
                              { id: "note7", day: 12, hour: 13, content: "Extra song relax :)", isSpotify: true, spotifyId: "4S4QJfBGGrC8jRIjJHf1Ka" },
                              { id: "note3", day: 13, content: "Extra song :)", isSpotify: true, spotifyId: "1fRLjwhspxZPVdV5MOpFeg" },
                              { id: "note4", day: 13, content: "Drawing on ipad on the mac :)" },
                              { id: "note5", day: 14, content: "Happy Valentine's Day!" },
                              { id: "note6", day: 14, content: "The park :)" },
                              { id: "note8", day: 14, content: "One last song :)", isSpotify: true, spotifyId: "7EAMXbLcL0qXmciM5SwMh2" },
                            ],
                            passcode: "1402",
                            videoUrl: "https://assets.mixkit.io/videos/preview/mixkit-heart-shaped-balloons-floating-in-the-sky-4288-large.mp4",
                            backgroundUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=1200&q=80",
                            galleryImages: {
                                "day12": [
                                    "https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&w=800&q=80"
                                ],
                                "day13": [
                                    "https://images.unsplash.com/photo-1474552226712-ac0f0961a954?auto=format&fit=crop&w=800&q=80"
                                ],
                                "day14": [
                                    "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80"
                                ]
                            }
                        };
                        setPreviewConfig(DEMO_CONFIG);
                        setIsPreviewing(true);
                    }}
                    className="px-12 py-5 border-2 border-valentine-red text-valentine-red rounded-full text-2xl font-bold hover:bg-valentine-red/5 transition-all flex items-center gap-2 justify-center"
                  >
                    <ImageIcon size={24} /> Demo Preview
                  </button>
                </div>
              </div>
            </section>
    
            {/* Visual Preview / Features Section */}
            <section id="preview" className="py-24 px-8 bg-white/50 text-gray-800">
              <div className="max-w-5xl mx-auto space-y-24">
                <div className="text-center space-y-4 text-gray-800">
                  <h2 className="text-4xl md:text-5xl font-bold text-valentine-red font-sacramento">The Perfect Digital Gift</h2>
                  <p className="text-valentine-soft max-w-2xl mx-auto italic">More than just a link—it's a journey of your love story.</p>
                </div>
    
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center text-gray-800">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="space-y-6 text-left"
                  >
                    <div className="w-12 h-12 bg-valentine-red/10 rounded-2xl flex items-center justify-center text-valentine-red">
                      <Heart size={24} className="fill-current" />
                    </div>
                    <h3 className="text-3xl font-bold text-valentine-red font-sacramento text-4xl">1. The Big Ask</h3>
                    <p className="text-valentine-soft leading-relaxed text-gray-800">
                      Your partner begins with an interactive heart-tapping game. 
                      They have to "unlock" your message by tapping the heart, leading to the ultimate question: 
                      <span className="italic font-bold text-valentine-red text-gray-800"> "Will you be my Valentine?"</span>
                    </p>
                  </motion.div>
                  <div className="bg-valentine-cream rounded-3xl p-8 shadow-inner border-2 border-valentine-pink/10 relative overflow-hidden aspect-video flex items-center justify-center text-gray-800">
                     <div className="text-center space-y-4">
                        <Heart size={64} className="text-valentine-red mx-auto animate-bounce fill-valentine-red" />
                        <p className="font-bold text-valentine-soft uppercase tracking-widest text-xs">Interactive Invitation</p>
                     </div>
                  </div>
                </div>
    
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center text-left text-gray-800">
                  <div className="order-2 md:order-1 bg-valentine-cream rounded-3xl p-8 shadow-inner border-2 border-valentine-pink/10 aspect-video flex items-center justify-center">
                    <div className="text-center space-y-4 w-full">
                        <div className="flex justify-center gap-2">
                            {[12, 13, 14].map(d => (
                                <div key={d} className="w-12 h-12 rounded-lg bg-white shadow-sm flex items-center justify-center text-valentine-red font-bold border-2 border-valentine-pink/20">
                                    {d}
                                </div>
                            ))}
                        </div>
                        <p className="font-bold text-valentine-soft uppercase tracking-widest text-xs">Timed Daily Unlocks</p>
                     </div>
                  </div>
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="space-y-6 order-1 md:order-2 text-left"
                  >
                    <div className="w-12 h-12 bg-valentine-red/10 rounded-2xl flex items-center justify-center text-valentine-red">
                      <Music size={24} />
                    </div>
                    <h3 className="text-3xl font-bold text-valentine-red font-sacramento text-4xl">2. The Daily Countdown</h3>
                    <p className="text-valentine-soft leading-relaxed">
                      Build anticipation. Add secret notes, songs, and photos that only unlock on specific days leading up to Valentine's Day. 
                      Every morning, they'll have something new to discover.
                    </p>
                  </motion.div>
                </div>
    
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center text-left text-gray-800">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="space-y-6 text-left"
                  >
                    <div className="w-12 h-12 bg-valentine-red/10 rounded-2xl flex items-center justify-center text-valentine-red">
                      <ImageIcon size={24} />
                    </div>
                    <h3 className="text-3xl font-bold text-valentine-red font-sacramento text-4xl">3. Scratch-off Memories</h3>
                    <p className="text-valentine-soft leading-relaxed">
                      Photos are hidden behind a romantic "scratch-off" layer. 
                      Your partner has to manually reveal each memory, making the walk down memory lane tactile and fun.
                    </p>
                  </motion.div>
                  <div className="bg-valentine-cream rounded-3xl p-8 shadow-inner border-2 border-valentine-pink/10 aspect-video flex items-center justify-center text-gray-800">
                    <div className="w-32 h-32 bg-valentine-pink rounded-xl flex items-center justify-center shadow-lg border-4 border-white rotate-3">
                        <Sparkles className="text-white" size={40} />
                    </div>
                  </div>
                </div>
    
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center text-left">
                  <div className="order-2 md:order-1 bg-valentine-cream rounded-3xl p-8 shadow-inner border-2 border-valentine-pink/10 aspect-video flex items-center justify-center relative text-left">
                    <div className="w-full h-full bg-zinc-900 rounded-xl flex items-center justify-center shadow-2xl relative overflow-hidden text-left">
                        <div className="absolute inset-0 bg-gradient-to-t from-valentine-red/20 to-transparent text-left" />
                        <Zap className="text-valentine-red animate-pulse" size={48} />
                    </div>
                    <div className="absolute -bottom-4 -right-4 bg-white px-4 py-2 rounded-xl shadow-lg border border-valentine-pink/20">
                        <p className="text-[10px] font-bold text-valentine-red uppercase tracking-widest text-left">Premium Feature</p>
                    </div>
                  </div>
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="space-y-6 order-1 md:order-2 text-left"
                  >
                    <div className="w-12 h-12 bg-valentine-red/10 rounded-2xl flex items-center justify-center text-valentine-red">
                      <Zap size={24} className="fill-current" />
                    </div>
                    <h3 className="text-3xl font-bold text-valentine-red font-sacramento text-4xl">4. Secret Cinema</h3>
                    <p className="text-valentine-soft leading-relaxed text-gray-800">
                      The ultimate surprise. Upload a personal video message or a montage of your favorite clips. 
                      Locked behind a 4-digit passcode only the two of you know.
                    </p>
                  </motion.div>
                </div>
    
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center text-left">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="space-y-6 text-left"
                  >
                    <div className="w-12 h-12 bg-valentine-red/10 rounded-2xl flex items-center justify-center text-valentine-red">
                      <Music size={24} />
                    </div>
                    <h3 className="text-3xl font-bold text-valentine-red font-sacramento text-4xl">5. Curated Soundtrack</h3>
                    <p className="text-valentine-soft leading-relaxed text-gray-800">
                      Music defines moments. Attach specific Spotify songs to each day of the countdown to set the mood perfectly as they explore their sanctuary.
                    </p>
                  </motion.div>
                  <div className="bg-valentine-cream rounded-3xl p-8 shadow-inner border-2 border-valentine-pink/10 aspect-video flex items-center justify-center text-left">
                    <div className="w-full space-y-3">
                        <div className="h-4 w-3/4 bg-valentine-pink/20 rounded-full animate-pulse" />
                        <div className="h-12 w-full bg-white rounded-xl shadow-sm flex items-center px-4 gap-3 text-left">
                            <Music size={16} className="text-valentine-red" />
                            <div className="h-2 w-1/2 bg-valentine-cream rounded-full" />
                        </div>
                    </div>
                  </div>
                </div>
    
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center text-left">
                  <div className="order-2 md:order-1 bg-valentine-cream rounded-3xl p-8 shadow-inner border-2 border-valentine-pink/10 aspect-video flex items-center justify-center relative text-left">
                    <div className="w-full h-full bg-white rounded-xl shadow-lg border-2 border-valentine-pink/20 relative overflow-hidden text-left">
                        <div className="absolute inset-0 bg-valentine-pink/10" />
                        <Heart className="absolute top-4 right-4 text-valentine-red/20" size={32} />
                        <Heart className="absolute bottom-8 left-6 text-valentine-red/10" size={48} />
                    </div>
                  </div>
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="space-y-6 order-1 md:order-2 text-left"
                  >
                    <div className="w-12 h-12 bg-valentine-red/10 rounded-2xl flex items-center justify-center text-valentine-red">
                      <Star size={24} />
                    </div>
                    <h3 className="text-3xl font-bold text-valentine-red font-sacramento text-4xl">6. Custom Ambiance</h3>
                    <p className="text-valentine-soft leading-relaxed text-gray-800">
                      Make it feel like home. Upload a custom background image that subtly sets the theme for your entire sanctuary. 
                      A photo of your favorite place, or just an aesthetic pattern—you decide.
                    </p>
                  </motion.div>
                </div>
    
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center text-left text-gray-800">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="space-y-6 text-left text-gray-800"
                  >
                    <div className="w-12 h-12 bg-valentine-red/10 rounded-2xl flex items-center justify-center text-valentine-red">
                      <Shield size={24} />
                    </div>
                    <h3 className="text-3xl font-bold text-valentine-red font-sacramento text-4xl">7. Private & Secure</h3>
                    <p className="text-valentine-soft leading-relaxed text-gray-800">
                      Your memories are yours alone. We use high-end AES-GCM encryption and a zero-database architecture. 
                      All your data lives strictly within your unique URL link. Even we can't see it.
                    </p>
                  </motion.div>
                  <div className="bg-valentine-cream rounded-3xl p-8 shadow-inner border-2 border-valentine-pink/10 aspect-video flex items-center justify-center text-left text-gray-800">
                    <Lock size={64} className="text-valentine-soft" />
                  </div>
                </div>
              </div>
            </section>
    
            {/* Pricing Section */}
            <section id="pricing" className="py-24 px-8 bg-white text-gray-800">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-bold text-valentine-red mb-16 font-sacramento text-center text-gray-800 text-left">Pricing</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end text-left text-gray-800">
                  {/* Spark Plan */}
                  <div className="p-8 rounded-3xl border-2 border-valentine-pink/20 flex flex-col text-left hover:border-valentine-pink transition-all">
                    <h3 className="text-xl font-bold text-valentine-red mb-2 text-left text-gray-800">The Spark</h3>
                    <div className="text-3xl font-bold text-valentine-red mb-6">$2.00</div>
                    <ul className="space-y-3 mb-8 flex-grow text-sm text-gray-800 text-left">
                      <li className="flex items-center gap-3 text-valentine-soft text-left text-gray-800"><Check className="text-green-500" size={16} /> 1 Day Countdown</li>
                      <li className="flex items-center gap-3 text-valentine-soft text-left text-gray-800"><Check className="text-green-500" size={16} /> 5 Secret Notes</li>
                      <li className="flex items-center gap-3 text-valentine-soft text-left text-gray-800"><Check className="text-green-500" size={16} /> Invitation Game</li>
                      <li className="flex items-center gap-3 text-valentine-soft text-left text-gray-800"><Check className="text-green-500" size={16} /> 10 Memory Photos</li>
                      <li className="flex items-center gap-3 text-valentine-soft text-left text-gray-800"><Check className="text-green-500" size={16} /> Custom Background</li>
                      <li className="flex items-center gap-3 text-valentine-soft/40 text-left text-gray-800"><X size={16} /> No Cinema Video</li>
                    </ul>
                    <Link href="/wizard?plan=spark" className="w-full py-3 text-center border-2 border-valentine-red text-valentine-red rounded-xl font-bold text-sm text-left">Start Small</Link>
                  </div>
    
                  {/* Plus Plan */}
                  <div className="p-8 rounded-3xl border-2 border-valentine-red relative flex flex-col text-left bg-white shadow-xl scale-105 z-10 border-t-8 text-gray-800 text-left">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-valentine-red text-white px-4 py-1 rounded-full font-bold text-xs uppercase tracking-widest shadow-md">Popular</div>
                    <h3 className="text-xl font-bold text-valentine-red mb-2 mt-2 text-left text-gray-800">The Romance</h3>
                    <div className="text-3xl font-bold text-valentine-red mb-6">$7.00</div>
                    <ul className="space-y-3 mb-8 flex-grow text-sm text-gray-800 text-left">
                      <li className="flex items-center gap-3 text-valentine-soft font-medium text-left text-gray-800"><Check className="text-green-500" size={16} /> <b>7 Day</b> Countdown</li>
                      <li className="flex items-center gap-3 text-valentine-soft font-medium text-left text-gray-800"><Check className="text-green-500" size={16} /> <b>25</b> Secret Notes</li>
                      <li className="flex items-center gap-3 text-valentine-soft font-medium text-left text-gray-800"><Check className="text-green-500" size={16} /> <b>30</b> Memory Photos</li>
                      <li className="flex items-center gap-3 text-valentine-soft font-medium text-left text-gray-800"><Check className="text-green-500" size={16} /> All Premium Features</li>
                      <li className="flex items-center gap-3 text-valentine-soft font-medium text-left text-gray-800"><Check className="text-green-500" size={16} /> Music for every day</li>
                      <li className="flex items-center gap-3 text-valentine-soft/40 text-left text-gray-800"><X size={16} /> No Cinema Video</li>
                    </ul>
                    <Link href="/wizard?plan=plus" className="w-full py-4 text-center bg-valentine-red text-white rounded-xl font-bold shadow-lg text-gray-800 text-left">Go Romance</Link>
                  </div>
    
                  {/* Infinite Plan */}
                  <div className="p-8 rounded-3xl border-2 border-valentine-pink/20 flex flex-col text-left hover:border-valentine-pink transition-all text-gray-800 text-left">
                    <h3 className="text-xl font-bold text-valentine-red mb-2 text-gray-800 text-left">The Sanctuary</h3>
                    <div className="text-3xl font-bold text-valentine-red mb-6">$12.00</div>
                    <ul className="space-y-3 mb-8 flex-grow text-sm text-gray-800 text-left">
                      <li className="flex items-center gap-3 text-valentine-soft text-left text-gray-800"><Check className="text-green-500" size={16} /> <b>14 Day</b> Journey</li>
                      <li className="flex items-center gap-3 text-valentine-soft text-left text-gray-800"><Check className="text-green-500" size={16} /> <b>500</b> Secret Notes</li>
                      <li className="flex items-center gap-3 text-valentine-soft text-left text-gray-800"><Check className="text-green-500" size={16} /> <b>50</b> Memory Photos</li>
                      <li className="flex items-center gap-3 text-valentine-soft text-left text-gray-800"><Check className="text-green-500" size={16} /> <b>Secret Cinema (Video)</b></li>
                      <li className="flex items-center gap-3 text-valentine-soft text-left text-gray-800"><Check className="text-green-500" size={16} /> Custom Passcodes</li>
                      <li className="flex items-center gap-3 text-valentine-soft text-left text-gray-800"><Check className="text-green-500" size={16} /> Custom Background</li>
                    </ul>
                    <Link href="/wizard?plan=infinite" className="w-full py-3 text-center border-2 border-valentine-pink text-valentine-soft rounded-xl font-bold text-sm text-gray-800 text-left">Full Sanctuary</Link>
                  </div>
                </div>
              </div>
            </section>
    
            {/* FAQ Section */}
            <section id="faq" className="py-24 px-8 bg-valentine-cream/30 text-gray-800 text-left">
              <div className="max-w-3xl mx-auto text-left text-gray-800">
                <h2 className="text-4xl md:text-5xl font-bold text-valentine-red mb-12 font-sacramento text-center text-gray-800 text-left">Frequently Asked Questions</h2>
                <div className="space-y-6 text-left text-gray-800">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-valentine-pink/10 text-left text-gray-800">
                    <h3 className="font-bold text-valentine-red mb-2 italic text-left text-gray-800">How do I send it to my partner?</h3>
                    <p className="text-sm text-valentine-soft text-left text-gray-800">Once you finish the wizard, you'll get a unique link. Just copy and send it via text, DM, or email!</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-valentine-pink/10 text-left text-gray-800 text-gray-800">
                    <h3 className="font-bold text-valentine-red mb-2 italic text-left text-gray-800">Does the link expire?</h3>
                    <p className="text-sm text-valentine-soft text-left text-gray-800">No. Since all the data is in the link itself, it will work as long as this website exists.</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-valentine-pink/10 text-left text-gray-800 text-gray-800">
                    <h3 className="font-bold text-valentine-red mb-2 italic text-left text-gray-800">Can I get a refund?</h3>
                    <p className="text-sm text-valentine-soft text-left text-gray-800">Due to the immediate processing and hosting of your media assets, all sales are final.</p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-valentine-pink/10 text-left text-gray-800 text-gray-800">
                    <h3 className="font-bold text-valentine-red mb-2 italic text-left text-gray-800">What happens to my photos?</h3>
                    <p className="text-sm text-valentine-soft text-left text-gray-800">Your photos are stored securely. You can permanently delete them at any time using the revoke page.</p>
                  </div>
                </div>
              </div>
            </section>
    
            <footer className="py-12 border-t bg-valentine-cream/50 text-gray-800 text-left">
              <div className="max-w-2xl mx-auto space-y-4 px-4 text-center text-left text-gray-800">
                <p className="text-valentine-soft text-sm italic text-gray-800 text-left">"I originally built this as a private gift for my girlfriend. After friends asked to use it, I decided to turn it into a wizard for everyone."</p>
                <div className="h-[1px] w-12 bg-valentine-red/20 mx-auto text-left text-gray-800" />
                <div className="flex justify-center gap-6 text-[10px] uppercase tracking-widest font-bold text-valentine-soft text-gray-800 text-left">
                  <Link href="/privacy" className="hover:text-valentine-red transition-colors text-gray-800 text-left">Privacy Policy</Link>
                  <Link href="/terms" className="hover:text-valentine-red transition-colors text-gray-800 text-left">Terms of Service</Link>
                  <Link href="/revoke" className="hover:text-red-500 transition-colors text-gray-800 text-left">Revoke Sanctuary</Link>
                  <a href="mailto:malthe@mbn-code.dk?subject=Report%20Content" className="hover:text-valentine-red transition-colors text-gray-800 text-left">Report Content</a>
                </div>
                <p className="text-valentine-soft text-[10px] uppercase tracking-tighter text-gray-800 text-left text-center">© 2026 Valentine Wizard • <a href="mailto:malthe@mbn-code.dk" className="hover:underline text-gray-800">malthe@mbn-code.dk</a> • Denmark</p>
              </div>
            </footer>
          </main>
        );
    }
  }

  if (phase === 'loading') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-valentine-cream text-gray-800">
        <div className="w-8 h-8 border-4 border-valentine-red border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main>
      {phase === 'invitation' ? (
        <Invitation onComplete={() => {
          localStorage.setItem(`valentine_completed_${JSON.stringify(config?.names)}`, 'true');
          setPhase('dashboard');
        }} />
      ) : (
        <Dashboard />
      )}
    </main>
  );
}

function PreviewApp({ forceUpdateKey }: { forceUpdateKey: number }) {
    const [phase, setPhase] = useState<'invitation' | 'dashboard'>('invitation');
    
    return (
        <div className="min-h-screen text-gray-800" key={forceUpdateKey}>
            {phase === 'invitation' ? (
                <Invitation onComplete={() => setPhase('dashboard')} />
            ) : (
                <Dashboard />
            )}
        </div>
    );
}
