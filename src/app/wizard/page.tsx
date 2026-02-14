"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Music, ImageIcon, MessageSquare, Lock, Save, Copy, Check, ArrowRight, ArrowLeft, X, Sparkles, Star } from 'lucide-react';
import { ValentineConfig, encodeConfig } from '@/utils/config';
import Link from 'next/link';

export default function WizardPage() {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<ValentineConfig>({
    plan: 'free',
    names: { partner1: '', partner2: '' },
    anniversaryDate: new Date().toISOString().split('T')[0],
    totalDays: 3,
    spotifyTracks: { "day14": "" },
    notes: [
      { id: 'note1', day: 14, content: 'Happy Valentine\'s Day!' }
    ],
    passcode: '1402',
    videoUrl: ''
  });

  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  const updateConfig = (path: string, value: any) => {
    const newConfig = { ...config };
    const parts = path.split('.');
    let current: any = newConfig;
    for (let i = 0; i < parts.length - 1; i++) {
      if (current[parts[i]] === undefined) current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
    setConfig(newConfig);
  };

  const handleGenerate = () => {
    const encoded = encodeConfig(config);
    const url = `${window.location.origin}/#config=${encoded}`;
    setGeneratedLink(url);
    setStep(7);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    { title: "Select Plan", icon: <Star /> },
    { title: "The Couple", icon: <Heart /> },
    { title: "The Music", icon: <Music /> },
    { title: "The Notes", icon: <MessageSquare /> },
    { title: "The Video", icon: <ImageIcon /> },
    { title: "The Secret", icon: <Lock /> },
    { title: "Share", icon: <Check /> }
  ];

  const getDaysArray = () => {
    const days = [];
    for (let i = 0; i < config.totalDays; i++) {
      days.push(14 - i);
    }
    return days.sort((a, b) => a - b);
  };

  return (
    <main className="min-h-screen bg-valentine-cream p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col min-h-[600px]">
        {/* Header */}
        <div className="bg-valentine-red p-6 text-white flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Valentine Wizard</h1>
            <p className="text-valentine-pink/80 text-sm">Step {step} of 7: {steps[step-1].title}</p>
          </div>
          <Link href="/" className="hover:bg-white/10 p-2 rounded-full transition-colors">
            <X size={24} />
          </Link>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-valentine-pink/20 w-full flex">
          {[1, 2, 3, 4, 5, 6, 7].map((s) => (
            <div 
              key={s} 
              className={`h-full transition-all duration-500 ${s <= step ? 'bg-valentine-red' : ''}`} 
              style={{ width: '14.28%' }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-grow p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {step === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div 
                    onClick={() => updateConfig('plan', 'free')}
                    className={`p-6 rounded-2xl border-4 cursor-pointer transition-all ${config.plan === 'free' ? 'border-valentine-red bg-valentine-red/5 shadow-inner' : 'border-valentine-pink/20 hover:border-valentine-pink'}`}
                  >
                    <h3 className="text-xl font-bold text-valentine-red mb-2">Free Plan</h3>
                    <ul className="text-sm text-valentine-soft space-y-2 mb-4">
                      <li className="flex items-center gap-2"><Check size={14} /> Full Dashboard</li>
                      <li className="flex items-center gap-2"><Check size={14} /> Custom Duration (1-14 days)</li>
                      <li className="flex items-center gap-2"><Check size={14} /> All Spotify Tracks</li>
                      <li className="flex items-center gap-2"><Check size={14} /> 10 Secret Notes</li>
                      <li className="flex items-center gap-2 text-valentine-soft/50"><X size={14} /> Custom Secret Cinema</li>
                    </ul>
                    <div className="text-2xl font-bold text-valentine-red">$0</div>
                  </div>

                  <div 
                    onClick={() => updateConfig('plan', 'pro')}
                    className={`p-6 rounded-2xl border-4 cursor-pointer transition-all relative overflow-hidden ${config.plan === 'pro' ? 'border-valentine-red bg-valentine-red/5 shadow-inner' : 'border-valentine-pink/20 hover:border-valentine-pink'}`}
                  >
                    <div className="absolute top-0 right-0 bg-valentine-red text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest">Premium</div>
                    <h3 className="text-xl font-bold text-valentine-red mb-2 flex items-center gap-2">Pro Plan <Sparkles size={18} className="text-yellow-500 fill-yellow-500" /></h3>
                    <ul className="text-sm text-valentine-soft space-y-2 mb-4">
                      <li className="flex items-center gap-3"><Check size={14} /> Everything in Free</li>
                      <li className="flex items-center gap-3"><Check size={14} /> <b>Custom Memory Video</b></li>
                      <li className="flex items-center gap-3"><Check size={14} /> Unlimited Secret Notes</li>
                      <li className="flex items-center gap-3"><Check size={14} /> No Branding</li>
                    </ul>
                    <div className="text-2xl font-bold text-valentine-red">$9.99 <span className="text-xs font-normal text-valentine-soft">One-time</span></div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-valentine-soft uppercase">Your Name</label>
                      <input 
                        type="text" 
                        value={config.names.partner1}
                        onChange={(e) => updateConfig('names.partner1', e.target.value)}
                        placeholder="e.g. Romeo"
                        className="w-full p-4 rounded-xl border-2 border-valentine-pink/20 focus:border-valentine-red outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-valentine-soft uppercase">Their Name</label>
                      <input 
                        type="text" 
                        value={config.names.partner2}
                        onChange={(e) => updateConfig('names.partner2', e.target.value)}
                        placeholder="e.g. Juliet"
                        className="w-full p-4 rounded-xl border-2 border-valentine-pink/20 focus:border-valentine-red outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-valentine-soft uppercase">Anniversary Date</label>
                        <input 
                        type="date" 
                        value={config.anniversaryDate.split('T')[0]}
                        onChange={(e) => updateConfig('anniversaryDate', new Date(e.target.value).toISOString())}
                        className="w-full p-4 rounded-xl border-2 border-valentine-pink/20 focus:border-valentine-red outline-none transition-colors"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-valentine-soft uppercase">Duration (Days)</label>
                        <input 
                        type="number" 
                        min={1}
                        max={14}
                        value={config.totalDays}
                        onChange={(e) => updateConfig('totalDays', parseInt(e.target.value))}
                        className="w-full p-4 rounded-xl border-2 border-valentine-pink/20 focus:border-valentine-red outline-none transition-colors"
                        />
                        <p className="text-[10px] text-valentine-soft italic">How many days lead up to Feb 14th? (1-14)</p>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  <p className="text-sm text-valentine-soft">Provide Spotify Track IDs for the unlockable stages.</p>
                  {getDaysArray().map((day) => (
                    <div key={day} className="space-y-2">
                      <label className="block text-sm font-bold text-valentine-soft uppercase">Feb {day} Track ID</label>
                      <input 
                        type="text" 
                        value={config.spotifyTracks[`day${day}`] || ""}
                        onChange={(e) => updateConfig(`spotifyTracks.day${day}`, e.target.value.split('/').pop()?.split('?')[0])}
                        placeholder="Paste Spotify Link or ID"
                        className="w-full p-4 rounded-xl border-2 border-valentine-pink/20 focus:border-valentine-red outline-none transition-colors"
                      />
                    </div>
                  ))}
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {config.notes.map((note, idx) => (
                    <div key={note.id} className="p-4 bg-valentine-cream/50 rounded-2xl space-y-3 relative group">
                      <div className="flex gap-4">
                        <select 
                          value={note.day}
                          onChange={(e) => {
                            const newNotes = [...config.notes];
                            newNotes[idx].day = parseInt(e.target.value);
                            updateConfig('notes', newNotes);
                          }}
                          className="p-2 rounded-lg border-2 border-valentine-pink/20 outline-none"
                        >
                          {getDaysArray().map(d => (
                              <option key={d} value={d}>Feb {d}</option>
                          ))}
                        </select>
                        <input 
                          type="text" 
                          value={note.content}
                          onChange={(e) => {
                            const newNotes = [...config.notes];
                            newNotes[idx].content = e.target.value;
                            updateConfig('notes', newNotes);
                          }}
                          placeholder="Note content..."
                          className="flex-grow p-2 rounded-lg border-2 border-valentine-pink/20 outline-none"
                        />
                      </div>
                      {config.notes.length > 1 && (
                        <button 
                          onClick={() => {
                              const newNotes = config.notes.filter((_, i) => i !== idx);
                              updateConfig('notes', newNotes);
                          }}
                          className="absolute -top-2 -right-2 bg-valentine-red text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                        if (config.plan === 'free' && config.notes.length >= 10) {
                            alert("Free plan is limited to 10 notes. Upgrade to Pro for unlimited!");
                            return;
                        }
                        const newNotes = [...config.notes, { id: `note${Date.now()}`, day: 14, content: '' }];
                        updateConfig('notes', newNotes);
                    }}
                    className="w-full py-3 border-2 border-dashed border-valentine-red text-valentine-red rounded-2xl font-bold hover:bg-valentine-red/5 transition-colors"
                  >
                    + Add Another Note {config.plan === 'free' && `(${config.notes.length}/10)`}
                  </button>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-4">
                  {config.plan === 'free' ? (
                    <div className="p-8 text-center bg-valentine-red/5 rounded-3xl border-2 border-dashed border-valentine-pink/30">
                      <ImageIcon size={48} className="mx-auto text-valentine-pink mb-4" />
                      <h3 className="text-xl font-bold text-valentine-red mb-2">Custom Video is Pro Only</h3>
                      <p className="text-sm text-valentine-soft mb-6">Upgrade to Pro to include your own personal memory video. Free users get a beautiful default movie!</p>
                      <button onClick={() => setStep(1)} className="px-6 py-2 bg-valentine-red text-white rounded-full font-bold shadow-lg">Upgrade to Pro</button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-valentine-soft uppercase">Memory Video URL</label>
                      <input 
                        type="text" 
                        value={config.videoUrl}
                        onChange={(e) => updateConfig('videoUrl', e.target.value)}
                        placeholder="Direct link to .mp4 or .mov"
                        className="w-full p-4 rounded-xl border-2 border-valentine-pink/20 focus:border-valentine-red outline-none transition-colors"
                      />
                      <p className="text-xs text-valentine-soft">Direct link to a hosted video file (e.g. Dropbox, Cloudinary, etc).</p>
                    </div>
                  )}
                </div>
              )}

              {step === 6 && (
                <div className="space-y-4 text-center">
                   <div className="space-y-2 text-left">
                    <label className="block text-sm font-bold text-valentine-soft uppercase flex justify-between">
                        Secret Passcode
                    </label>
                    <input 
                      type="text" 
                      maxLength={4}
                      value={config.passcode}
                      onChange={(e) => updateConfig('passcode', e.target.value.replace(/\D/g, ''))}
                      className="w-full p-4 text-center text-4xl tracking-widest font-bold rounded-xl border-2 border-valentine-pink/20 focus:border-valentine-red outline-none transition-colors"
                    />
                    <p className="text-xs text-valentine-soft text-center">Enter a 4-digit code they'll need to unlock the Secret Cinema.</p>
                  </div>
                </div>
              )}

              {step === 7 && (
                <div className="space-y-8 text-center py-10">
                  <div className="space-y-2">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-valentine-red">It's Ready!</h2>
                    <p className="text-valentine-soft">Your personalized Valentine sanctuary is generated.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-valentine-cream rounded-xl border-2 border-valentine-pink/20 break-all text-sm font-mono text-left">
                      {generatedLink}
                    </div>
                    <div className="flex gap-4">
                      <button 
                        onClick={copyToClipboard}
                        className="flex-grow flex items-center justify-center gap-2 py-4 bg-valentine-red text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-all"
                      >
                        {copied ? <Check size={20} /> : <Copy size={20} />}
                        {copied ? 'Copied!' : 'Copy Shareable Link'}
                      </button>
                      <a 
                        href={generatedLink}
                        target="_blank"
                        className="flex items-center justify-center gap-2 px-6 py-4 border-2 border-valentine-red text-valentine-red rounded-xl font-bold hover:bg-valentine-red/5 transition-all"
                      >
                        Preview
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        {step < 7 && (
          <div className="p-6 bg-valentine-cream/30 border-t flex justify-between">
            <button 
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className={`flex items-center gap-2 font-bold transition-colors ${step === 1 ? 'text-valentine-soft/50 cursor-not-allowed' : 'text-valentine-soft hover:text-valentine-red'}`}
            >
              <ArrowLeft size={20} /> Previous
            </button>
            
            {step < 6 ? (
              <button 
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-2 bg-valentine-red text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-all"
              >
                Next Step <ArrowRight size={20} />
              </button>
            ) : (
              <button 
                onClick={handleGenerate}
                className="flex items-center gap-2 bg-valentine-red text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-all"
              >
                <Save size={20} /> Generate Sanctuary
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
