"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Music, Image as ImageIcon, MessageSquare, Lock, Save, Copy, Check, ArrowRight, ArrowLeft, X } from 'lucide-react';
import { ValentineConfig, encodeConfig } from '@/utils/config';
import Link from 'next/link';

export default function WizardPage() {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<ValentineConfig>({
    names: { partner1: '', partner2: '' },
    anniversaryDate: new Date().toISOString().split('T')[0],
    spotifyTracks: { day12: '', day13: '', day14: '' },
    notes: [
      { id: 'note1', day: 12, content: 'Our first note' },
      { id: 'note2', day: 14, content: 'Happy Valentine\'s Day!' }
    ],
    passcode: '1234',
    videoUrl: ''
  });

  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  const updateConfig = (path: string, value: any) => {
    const newConfig = { ...config };
    const parts = path.split('.');
    let current: any = newConfig;
    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
    setConfig(newConfig);
  };

  const handleGenerate = () => {
    const encoded = encodeConfig(config);
    const url = `${window.location.origin}/#config=${encoded}`;
    setGeneratedLink(url);
    setStep(6);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    { title: "The Couple", icon: <Heart /> },
    { title: "The Music", icon: <Music /> },
    { title: "The Video", icon: <ImageIcon /> },
    { title: "The Notes", icon: <MessageSquare /> },
    { title: "The Secret", icon: <Lock /> },
    { title: "Share", icon: <Check /> }
  ];

  return (
    <main className="min-h-screen bg-valentine-cream p-4 md:p-8 flex flex-col items-center">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col min-h-[600px]">
        <div className="bg-valentine-red p-6 text-white flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Valentine Wizard</h1>
            <p className="text-valentine-pink/80 text-sm">Step {step} of 6: {steps[step-1].title}</p>
          </div>
          <Link href="/" className="hover:bg-white/10 p-2 rounded-full transition-colors">
            <X size={24} />
          </Link>
        </div>

        <div className="h-1 bg-valentine-pink/20 w-full flex">
          {[1, 2, 3, 4, 5, 6].map((s) => (
            <div 
              key={s} 
              className={`h-full transition-all duration-500 ${s <= step ? 'bg-valentine-red' : ''}`} 
              style={{ width: '16.66%' }}
            />
          ))}
        </div>

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
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-valentine-soft uppercase">Anniversary Date</label>
                    <input 
                      type="date" 
                      value={config.anniversaryDate.split('T')[0]}
                      onChange={(e) => updateConfig('anniversaryDate', new Date(e.target.value).toISOString())}
                      className="w-full p-4 rounded-xl border-2 border-valentine-pink/20 focus:border-valentine-red outline-none transition-colors"
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-sm text-valentine-soft">Provide Spotify Track IDs for the three unlockable stages.</p>
                  {[12, 13, 14].map((day) => (
                    <div key={day} className="space-y-2">
                      <label className="block text-sm font-bold text-valentine-soft uppercase">Feb {day} Track ID</label>
                      <input 
                        type="text" 
                        value={(config.spotifyTracks as any)[`day${day}`]}
                        onChange={(e) => updateConfig(`spotifyTracks.day${day}`, e.target.value.split('/').pop()?.split('?')[0])}
                        placeholder="Paste Spotify Link or ID"
                        className="w-full p-4 rounded-xl border-2 border-valentine-pink/20 focus:border-valentine-red outline-none transition-colors"
                      />
                    </div>
                  ))}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-valentine-soft uppercase">Memory Video URL</label>
                    <input 
                      type="text" 
                      value={config.videoUrl}
                      onChange={(e) => updateConfig('videoUrl', e.target.value)}
                      placeholder="Direct link to .mp4 or .mov"
                      className="w-full p-4 rounded-xl border-2 border-valentine-pink/20 focus:border-valentine-red outline-none transition-colors"
                    />
                    <p className="text-xs text-valentine-soft">Direct link to a hosted video file.</p>
                  </div>
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
                          <option value={12}>Feb 12</option>
                          <option value={13}>Feb 13</option>
                          <option value={14}>Feb 14</option>
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
                      <button 
                        onClick={() => {
                            const newNotes = config.notes.filter((_, i) => i !== idx);
                            updateConfig('notes', newNotes);
                        }}
                        className="absolute -top-2 -right-2 bg-valentine-red text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                        const newNotes = [...config.notes, { id: `note${Date.now()}`, day: 14, content: '' }];
                        updateConfig('notes', newNotes);
                    }}
                    className="w-full py-3 border-2 border-dashed border-valentine-red text-valentine-red rounded-2xl font-bold hover:bg-valentine-red/5 transition-colors"
                  >
                    + Add Another Note
                  </button>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-4 text-center">
                   <div className="space-y-2 text-left">
                    <label className="block text-sm font-bold text-valentine-soft uppercase">Secret Passcode</label>
                    <input 
                      type="text" 
                      maxLength={4}
                      value={config.passcode}
                      onChange={(e) => updateConfig('passcode', e.target.value.replace(/\D/g, ''))}
                      className="w-full p-4 text-center text-4xl tracking-widest font-bold rounded-xl border-2 border-valentine-pink/20 focus:border-valentine-red outline-none transition-colors"
                    />
                    <p className="text-xs text-valentine-soft text-center">A 4-digit code for the Secret Cinema.</p>
                  </div>
                </div>
              )}

              {step === 6 && (
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

        {step < 6 && (
          <div className="p-6 bg-valentine-cream/30 border-t flex justify-between">
            <button 
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
              className={`flex items-center gap-2 font-bold transition-colors ${step === 1 ? 'text-valentine-soft/50 cursor-not-allowed' : 'text-valentine-soft hover:text-valentine-red'}`}
            >
              <ArrowLeft size={20} /> Previous
            </button>
            
            {step < 5 ? (
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
