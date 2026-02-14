"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Music, ImageIcon, MessageSquare, Lock, Save, Copy, Check, ArrowRight, ArrowLeft, X, Sparkles, Star, Zap, Info, Loader2, Plus, Trash2, FileText, Upload } from 'lucide-react';
import { ValentineConfig, encodeConfig } from '@/utils/config';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { upload } from '@vercel/blob/client';

function WizardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialPlan = (searchParams.get('plan') as 'free' | 'plus' | 'infinite') || 'free';
  const success = searchParams.get('success') === 'true';
  const sessionId = searchParams.get('session_id');
  const paidPlan = searchParams.get('paid_plan') as 'plus' | 'infinite';

  const [step, setStep] = useState(success ? 8 : 1);
  const [isPaying, setIsPaying] = useState(false);
  const [isVerifying, setIsVerifying] = useState(success && !!sessionId);
  const [uploading, setUploading] = useState<string | null>(null); // tracks which field is uploading
  
  const [config, setConfig] = useState<ValentineConfig>({
    plan: success ? (paidPlan || initialPlan) : initialPlan,
    names: { partner1: '', partner2: '' },
    anniversaryDate: new Date().toISOString().split('T')[0],
    totalDays: (success ? paidPlan : initialPlan) === 'free' ? 1 : 3,
    spotifyTracks: { "day14": "" },
    notes: [
      { id: 'note1', day: 14, content: 'Happy Valentine\'s Day!' }
    ],
    passcode: '1402',
    videoUrl: '',
    galleryImages: {}
  });

  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [configLength, setConfigLength] = useState(0);

  // Monitor config size for URL limits
  useEffect(() => {
    const encoded = encodeConfig(config);
    setConfigLength(encoded.length);
  }, [config]);

  // Secure Session Verification
  useEffect(() => {
    if (success && sessionId) {
      const verify = async () => {
        try {
          const res = await fetch(`/api/verify-session?session_id=${sessionId}`);
          const data = await res.json();
          
          if (data.success) {
            const saved = localStorage.getItem('pending_valentine_config');
            if (saved) {
              const parsed = JSON.parse(saved);
              parsed.plan = paidPlan || parsed.plan;
              setConfig(parsed);
              
              const encoded = encodeConfig(parsed);
              const url = `${window.location.origin}/#config=${encoded}`;
              setGeneratedLink(url);
              localStorage.removeItem('pending_valentine_config');
            }
          } else {
            alert("Payment verification failed. Please contact support.");
            setStep(1);
          }
        } catch (e) {
          console.error("Verification error", e);
        } finally {
          setIsVerifying(false);
        }
      };
      verify();
    }
  }, [success, sessionId, paidPlan]);

  const PLAN_LIMITS = {
    free: { days: 1, notes: 3, gallery: false, video: false, branding: true, background: false },
    plus: { days: 7, notes: 10, gallery: true, video: false, branding: false, background: true },
    infinite: { days: 14, notes: 100, gallery: true, video: true, branding: false, background: true }
  };

  const currentLimits = PLAN_LIMITS[config.plan];

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

  const uploadFile = async (file: File) => {
    const newBlob = await upload(file.name, file, {
      access: 'public',
      handleUploadUrl: '/api/upload',
    });
    return newBlob.url;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, path: string, isGallery = false, dayKey?: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(path);
    try {
      if (isGallery && dayKey) {
        const uploadedUrls = [];
        for (let i = 0; i < files.length; i++) {
          const url = await uploadFile(files[i]);
          uploadedUrls.push(url);
        }
        const existing = config.galleryImages?.[dayKey] || [];
        updateConfig(`galleryImages.${dayKey}`, [...existing, ...uploadedUrls]);
      } else {
        const url = await uploadFile(files[0]);
        updateConfig(path, url);
      }
    } catch (err: any) {
      const msg = err.message || 'Unknown error';
      alert(`Upload failed: ${msg}. If testing locally, check your BLOB_READ_WRITE_TOKEN in .env.local.`);
      console.error(err);
    } finally {
      setUploading(null);
    }
  };

  const handleGenerate = async () => {
    if (config.plan !== 'free' && !success) {
        setIsPaying(true);
        localStorage.setItem('pending_valentine_config', JSON.stringify(config));
        
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: config.plan, config })
            });
            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                alert("Checkout error. Try again.");
                setIsPaying(false);
            }
        } catch (e) {
            console.error(e);
            setIsPaying(false);
        }
        return;
    }

    const encoded = encodeConfig(config);
    const url = `${window.location.origin}/#config=${encoded}`;
    setGeneratedLink(url);
    setStep(8);
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
    { title: "The Gallery", icon: <ImageIcon /> },
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

  const UpgradeNudge = ({ target }: { target: 'plus' | 'infinite' }) => (
    <div className="p-4 bg-valentine-red/5 rounded-2xl border border-valentine-red/20 flex items-start gap-3 mt-4 animate-in fade-in slide-in-from-top-2">
        <Sparkles className="text-valentine-red shrink-0" size={20} />
        <div>
            <p className="text-xs font-bold text-valentine-red uppercase tracking-wider mb-1">Upgrade Available</p>
            <p className="text-[11px] text-valentine-soft mb-2">
                {target === 'plus' 
                    ? "Get up to 7 days, 10 notes, and a personal photo gallery with 'The Romance' plan."
                    : "Unlock the Secret Cinema (Video), custom passcodes, and 14-day countdowns with 'The Sanctuary'."}
            </p>
            <button 
                onClick={() => setStep(1)}
                className="text-[10px] bg-valentine-red text-white px-3 py-1 rounded-full font-bold uppercase"
            >
                View Plans
            </button>
        </div>
    </div>
  );

  if (isVerifying) {
      return (
        <main className="min-h-screen bg-valentine-cream flex flex-col items-center justify-center p-8 text-center">
            <div className="space-y-6">
                <Loader2 className="w-16 h-16 text-valentine-red animate-spin mx-auto" />
                <h2 className="text-2xl font-bold text-valentine-red font-sacramento text-4xl">Verifying your romance...</h2>
                <p className="text-valentine-soft italic">Securing your sanctuary, just a moment.</p>
            </div>
        </main>
      );
  }

  return (
    <main className="min-h-screen bg-valentine-cream p-4 md:p-8 flex flex-col items-center text-gray-800">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col min-h-[650px]">
        {/* Header */}
        <div className="bg-valentine-red p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
                {steps[step-1]?.icon}
            </div>
            <div>
                <h1 className="text-xl font-bold">Valentine Wizard</h1>
                <p className="text-valentine-pink/80 text-[10px] uppercase font-bold tracking-widest">{config.plan} Plan • Step {step} of 8</p>
            </div>
          </div>
          <Link href="/" className="hover:bg-white/10 p-2 rounded-full transition-colors">
            <X size={24} />
          </Link>
        </div>

        {/* Progress Bar */}
        <div className="h-1 bg-valentine-pink/20 w-full flex">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
            <div 
              key={s} 
              className={`h-full transition-all duration-500 ${s <= step ? 'bg-valentine-red' : ''}`} 
              style={{ width: '12.5%' }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-grow p-8 overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {step === 1 && (
                <div className="space-y-6 text-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-valentine-red">Choose your experience</h2>
                        <p className="text-valentine-soft text-sm mt-1">Pick the tier that fits your story.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        {[
                            { id: 'free', name: 'Spark', price: '$0', desc: '1 Day Surprise' },
                            { id: 'plus', name: 'Romance', price: '$4.99', desc: '7 Day Story' },
                            { id: 'infinite', name: 'Sanctuary', price: '$9.99', desc: '14 Day Journey' }
                        ].map((p) => (
                            <div 
                                key={p.id}
                                onClick={() => updateConfig('plan', p.id)}
                                className={`p-4 rounded-2xl border-4 cursor-pointer transition-all flex flex-col text-center ${config.plan === p.id ? 'border-valentine-red bg-valentine-red/5' : 'border-valentine-pink/10 hover:border-valentine-pink/30'}`}
                            >
                                <p className="text-[10px] font-bold text-valentine-soft uppercase tracking-tighter mb-1">{p.name}</p>
                                <p className="text-xl font-bold text-valentine-red">{p.price}</p>
                                <p className="text-[10px] text-valentine-soft mt-2">{p.desc}</p>
                            </div>
                        ))}
                    </div>
                    <div className="bg-valentine-cream/50 p-4 rounded-2xl text-left">
                        <ul className="text-xs text-valentine-soft space-y-2">
                            <li className="flex items-center gap-2">
                                <Check size={14} className="text-green-500" /> 
                                {config.plan === 'free' ? '3 Notes' : config.plan === 'plus' ? '10 Notes' : 'Unlimited Notes'}
                            </li>
                            <li className="flex items-center gap-2">
                                <Check size={14} className="text-green-500" /> 
                                {config.plan === 'free' ? '1 Day' : config.plan === 'plus' ? '7 Days' : '14 Days'}
                            </li>
                            <li className="flex items-center gap-2">
                                {currentLimits.gallery ? <Check size={14} className="text-green-500" /> : <X size={14} className="text-valentine-pink" />}
                                Photo Gallery (Local Upload)
                            </li>
                            <li className="flex items-center gap-2">
                                {currentLimits.video ? <Check size={14} className="text-green-500" /> : <X size={14} className="text-valentine-pink" />}
                                Custom Video Player
                            </li>
                            <li className="flex items-center gap-2">
                                {currentLimits.background ? <Check size={14} className="text-green-500" /> : <X size={14} className="text-valentine-pink" />}
                                Custom Background Image
                            </li>
                            <li className="flex items-center gap-2">
                                {!currentLimits.branding ? <Check size={14} className="text-green-500" /> : <X size={14} className="text-valentine-pink" />}
                                Remove "Valentine Wizard" Branding
                            </li>
                        </ul>
                    </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 text-left">
                      <label className="block text-sm font-bold text-valentine-soft uppercase">Your Name</label>
                      <input 
                        type="text" 
                        value={config.names.partner1}
                        onChange={(e) => updateConfig('names.partner1', e.target.value)}
                        placeholder="e.g. Romeo"
                        className="w-full p-4 rounded-xl border-2 border-valentine-pink/20 focus:border-valentine-red outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-2 text-left">
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
                    <div className="space-y-2 text-left">
                        <label className="block text-sm font-bold text-valentine-soft uppercase">Anniversary Date</label>
                        <input 
                        type="date" 
                        value={config.anniversaryDate.split('T')[0]}
                        onChange={(e) => updateConfig('anniversaryDate', new Date(e.target.value).toISOString())}
                        className="w-full p-4 rounded-xl border-2 border-valentine-pink/20 focus:border-valentine-red outline-none transition-colors"
                        />
                    </div>
                    <div className="space-y-2 relative text-left">
                        <label className="block text-sm font-bold text-valentine-soft uppercase">Duration (Days)</label>
                        <input 
                        type="number" 
                        min={1}
                        max={currentLimits.days}
                        value={config.totalDays}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            if (val <= currentLimits.days) {
                                updateConfig('totalDays', val);
                            }
                        }}
                        className="w-full p-4 rounded-xl border-2 border-valentine-pink/20 focus:border-valentine-red outline-none transition-colors"
                        />
                        <p className="text-[10px] text-valentine-soft italic">Plan max: {currentLimits.days} days.</p>
                        {config.totalDays >= currentLimits.days && config.plan !== 'infinite' && (
                            <UpgradeNudge target={config.plan === 'free' ? 'plus' : 'infinite'} />
                        )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 pt-4 border-t border-valentine-pink/10 text-left">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-valentine-soft uppercase flex justify-between">
                            Custom Background Image
                            {!currentLimits.background && <span className="text-[10px] text-valentine-red font-bold uppercase">Plus/Infinite Only</span>}
                        </label>
                        
                        <div className={`relative rounded-xl border-2 border-dashed p-6 transition-all ${!currentLimits.background ? 'bg-valentine-cream/50 cursor-not-allowed border-valentine-pink/10' : 'border-valentine-pink/30 bg-white hover:border-valentine-red'}`}>
                            {config.backgroundUrl ? (
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-valentine-pink/20 shadow-sm bg-gray-50">
                                        <img src={config.backgroundUrl} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-xs font-bold text-valentine-red">Background Set</p>
                                        <button 
                                            onClick={() => updateConfig('backgroundUrl', '')}
                                            className="text-[10px] text-valentine-soft underline uppercase font-bold"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <label className={`flex flex-col items-center justify-center gap-2 ${!currentLimits.background ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                                    {uploading === 'backgroundUrl' ? (
                                        <Loader2 className="animate-spin text-valentine-red" size={24} />
                                    ) : (
                                        <Upload className="text-valentine-pink" size={24} />
                                    )}
                                    <span className="text-xs font-bold text-valentine-soft uppercase tracking-wider">
                                        {uploading === 'backgroundUrl' ? 'Uploading...' : 'Upload Image from PC'}
                                    </span>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        className="hidden" 
                                        disabled={!currentLimits.background || !!uploading}
                                        onChange={(e) => handleFileUpload(e, 'backgroundUrl')}
                                    />
                                </label>
                            )}
                        </div>
                        {!currentLimits.background && <UpgradeNudge target="plus" />}
                    </div>
                  </div>
                </div>
              )}


              {step === 3 && (
                <div className="space-y-4 text-left">
                  <p className="text-sm text-valentine-soft">Provide Spotify Track IDs for each stage of the countdown.</p>
                  <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar space-y-4 text-left">
                    {getDaysArray().map((day) => (
                        <div key={day} className="space-y-2 p-4 bg-valentine-cream/30 rounded-xl text-left">
                        <label className="block text-[10px] font-bold text-valentine-soft uppercase tracking-wider">Feb {day} Track</label>
                        <input 
                            type="text" 
                            value={config.spotifyTracks[`day${day}`] || ""}
                            onChange={(e) => updateConfig(`spotifyTracks.day${day}`, e.target.value.split('/').pop()?.split('?')[0])}
                            placeholder="Paste Spotify Link or ID"
                            className="w-full p-3 rounded-lg border-2 border-valentine-pink/20 focus:border-valentine-red outline-none transition-colors text-sm"
                        />
                        </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  {!currentLimits.gallery ? (
                    <div className="p-8 text-center bg-valentine-red/5 rounded-3xl border-2 border-dashed border-valentine-pink/30 text-left">
                      <ImageIcon size={48} className="mx-auto text-valentine-pink mb-4" />
                      <h3 className="text-xl font-bold text-valentine-red mb-2">Photo Gallery is Premium</h3>
                      <p className="text-sm text-valentine-soft mb-6">Upgrade to <b>The Romance</b> plan to upload your favorite memories!</p>
                      <button onClick={() => setStep(1)} className="px-6 py-2 bg-valentine-red text-white rounded-full font-bold shadow-lg">View Plans</button>
                    </div>
                  ) : (
                    <div className="space-y-4 text-left">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-valentine-soft">Upload images from your computer for each day.</p>
                      </div>
                      <div className="max-h-[450px] overflow-y-auto pr-2 custom-scrollbar space-y-8">
                        {getDaysArray().map((day) => {
                          const dayKey = `day${day}`;
                          const images = config.galleryImages?.[dayKey] || [];
                          return (
                            <div key={day} className="p-5 bg-valentine-cream/30 rounded-2xl space-y-4 border border-valentine-pink/10">
                              <div className="flex justify-between items-center">
                                <label className="block text-[10px] font-bold text-valentine-red uppercase tracking-[0.2em]">
                                  Feb {day} Gallery
                                </label>
                                <span className="text-[10px] bg-white px-2 py-1 rounded-full font-bold text-valentine-soft shadow-sm">
                                    {images.length} Images
                                </span>
                              </div>
                              
                              <div className="space-y-4 text-left">
                                <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed border-valentine-pink/30 rounded-xl p-6 transition-all hover:border-valentine-red cursor-pointer bg-white/50 group ${uploading === `gallery_${dayKey}` ? 'pointer-events-none' : ''}`}>
                                    {uploading === `gallery_${dayKey}` ? (
                                        <Loader2 className="animate-spin text-valentine-red" size={24} />
                                    ) : (
                                        <Plus className="text-valentine-pink group-hover:scale-110 transition-transform" size={24} />
                                    )}
                                    <span className="text-xs font-bold text-valentine-soft uppercase tracking-wider">
                                        {uploading === `gallery_${dayKey}` ? 'Uploading...' : 'Select Photos to Upload'}
                                    </span>
                                    <input 
                                        type="file" 
                                        multiple 
                                        accept="image/*"
                                        className="hidden" 
                                        onChange={(e) => handleFileUpload(e, `gallery_${dayKey}`, true, dayKey)}
                                    />
                                </label>
                                
                                {images.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2 mt-4 text-left">
                                        {images.map((url, idx) => (
                                            <div key={idx} className="relative group rounded-lg overflow-hidden border-2 border-valentine-pink/20 aspect-square bg-white shadow-sm">
                                                <img src={url} className="w-full h-full object-cover" alt="" />
                                                <button 
                                                    onClick={() => {
                                                        const newImages = images.filter((_, i) => i !== idx);
                                                        updateConfig(`galleryImages.${dayKey}`, newImages);
                                                    }}
                                                    className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={10} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 5 && (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar text-left">
                  <div className="flex items-center justify-between text-left">
                    <p className="text-sm text-valentine-soft">Write messages that unlock at specific times.</p>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${config.notes.length >= currentLimits.notes ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {config.notes.length} / {currentLimits.notes === 100 ? '∞' : currentLimits.notes} Used
                    </span>
                  </div>
                  
                  {config.notes.map((note, idx) => (
                    <div key={note.id} className="p-4 bg-valentine-cream/50 rounded-2xl space-y-3 relative group border border-valentine-pink/10 shadow-sm text-left">
                      <div className="flex gap-4 text-left">
                        <select 
                          value={note.day}
                          onChange={(e) => {
                            const newNotes = [...config.notes];
                            newNotes[idx].day = parseInt(e.target.value);
                            updateConfig('notes', newNotes);
                          }}
                          className="p-2 rounded-lg border-2 border-valentine-pink/20 outline-none text-xs bg-white focus:border-valentine-red"
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
                          placeholder="My message..."
                          className="flex-grow p-2 rounded-lg border-2 border-valentine-pink/20 outline-none text-sm bg-white focus:border-valentine-red"
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
                  
                  {config.notes.length < currentLimits.notes ? (
                    <button 
                        onClick={() => {
                            const newNotes = [...config.notes, { id: `note${Date.now()}`, day: 14, content: '' }];
                            updateConfig('notes', newNotes);
                        }}
                        className="w-full py-3 border-2 border-dashed border-valentine-red text-valentine-red rounded-2xl font-bold hover:bg-valentine-red/5 transition-colors text-sm"
                    >
                        + Add Another Note
                    </button>
                  ) : (
                    <UpgradeNudge target={config.plan === 'free' ? 'plus' : 'infinite'} />
                  )}
                </div>
              )}

              {step === 6 && (
                <div className="space-y-4">
                  {!currentLimits.video ? (
                    <div className="p-8 text-center bg-valentine-red/5 rounded-3xl border-2 border-dashed border-valentine-pink/30 text-left">
                      <ImageIcon size={48} className="mx-auto text-valentine-pink mb-4" />
                      <h3 className="text-xl font-bold text-valentine-red mb-2">Secret Cinema is Premium</h3>
                      <p className="text-sm text-valentine-soft mb-6">Upgrade to <b>The Sanctuary</b> plan to upload your own memory movie.</p>
                      <button onClick={() => setStep(1)} className="px-6 py-2 bg-valentine-red text-white rounded-full font-bold shadow-lg">View Plans</button>
                    </div>
                  ) : (
                    <div className="space-y-4 text-left">
                      <label className="block text-sm font-bold text-valentine-soft uppercase tracking-wider">Secret Cinema Video</label>
                      
                      <div className={`relative rounded-xl border-2 border-dashed p-8 transition-all ${uploading === 'videoUrl' ? 'bg-valentine-cream/30 border-valentine-red' : 'border-valentine-pink/30 bg-white hover:border-valentine-red'}`}>
                        {config.videoUrl ? (
                            <div className="space-y-4 text-left">
                                <div className="aspect-video w-full rounded-lg overflow-hidden border-2 border-valentine-pink/20 bg-black">
                                    <video src={config.videoUrl} className="w-full h-full object-cover" controls />
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-xs font-bold text-valentine-red uppercase">Video Uploaded Successfully</p>
                                    <button 
                                        onClick={() => updateConfig('videoUrl', '')}
                                        className="text-[10px] text-valentine-soft underline uppercase font-bold"
                                    >
                                        Delete and Change
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center gap-4 cursor-pointer">
                                {uploading === 'videoUrl' ? (
                                    <Loader2 className="animate-spin text-valentine-red" size={32} />
                                ) : (
                                    <div className="p-4 bg-valentine-red/5 rounded-full">
                                        <Upload className="text-valentine-red" size={32} />
                                    </div>
                                )}
                                <div className="text-center">
                                    <p className="text-sm font-bold text-valentine-red uppercase tracking-wider">
                                        {uploading === 'videoUrl' ? 'Uploading Memory...' : 'Upload Video from PC'}
                                    </p>
                                    <p className="text-[10px] text-valentine-soft mt-1 italic">Best for .mp4 or .mov files</p>
                                </div>
                                <input 
                                    type="file" 
                                    accept="video/*"
                                    className="hidden" 
                                    disabled={!!uploading}
                                    onChange={(e) => handleFileUpload(e, 'videoUrl')}
                                />
                            </label>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {step === 7 && (
                <div className="space-y-4 text-center">
                   <div className="space-y-2 text-left">
                    <label className="block text-sm font-bold text-valentine-soft uppercase flex justify-between">
                        Secret Passcode
                    </label>
                    <input 
                      type="text" 
                      maxLength={4}
                      value={config.passcode}
                      onChange={(e) => {
                          if (config.plan === 'infinite') {
                            updateConfig('passcode', e.target.value.replace(/\D/g, ''));
                          }
                      }}
                      className={`w-full p-4 text-center text-4xl tracking-widest font-bold rounded-xl border-2 transition-all outline-none ${config.plan !== 'infinite' ? 'bg-valentine-cream/50 text-valentine-soft/50 cursor-not-allowed border-valentine-pink/10' : 'border-valentine-pink/20 focus:border-valentine-red'}`}
                    />
                    <p className="text-xs text-valentine-soft text-center">
                        {config.plan === 'infinite' ? 'Enter a 4-digit code.' : 'Default code is 1402 for your plan.'}
                    </p>
                    {config.plan !== 'infinite' && <UpgradeNudge target="infinite" />}
                  </div>
                </div>
              )}

              {step === 8 && (
                <div className="space-y-8 text-center py-10">
                  <div className="space-y-2 text-center">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-valentine-red">Your Sanctuary is Ready</h2>
                    <p className="text-valentine-soft text-sm">Everything is packaged and ready to send.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-valentine-cream rounded-xl border-2 border-valentine-pink/20 break-all text-xs font-mono text-left bg-gray-50 overflow-hidden text-ellipsis whitespace-nowrap">
                      {generatedLink}
                    </div>
                    {configLength > 4000 && (
                        <p className="text-[10px] text-orange-600 bg-orange-50 p-2 rounded-lg flex items-center gap-2">
                            <Info size={12} /> This sanctuary is quite large! If it doesn't open on some apps, try removing a few photos.
                        </p>
                    )}
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={copyToClipboard}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-valentine-red text-white rounded-xl font-bold shadow-lg hover:scale-[1.02] transition-all"
                      >
                        {copied ? <Check size={20} /> : <Copy size={20} />}
                        {copied ? 'Link Copied!' : 'Copy Sanctuary Link'}
                      </button>
                      <button 
                        onClick={() => {
                            const text = `I just created a digital Valentine sanctuary for you! Check it out: ${generatedLink}`;
                            if (navigator.share) {
                                navigator.share({ title: 'Valentine Sanctuary', text, url: generatedLink });
                            } else {
                                copyToClipboard();
                            }
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 border-2 border-valentine-red text-valentine-red rounded-xl font-bold hover:bg-valentine-red/5 transition-all text-sm"
                      >
                        <Zap size={16} className="fill-current" /> Share via Socials
                      </button>
                      <a 
                        href={generatedLink}
                        target="_blank"
                        className="w-full text-center text-xs text-valentine-soft underline mt-2 font-bold"
                      >
                        Preview Sanctuary
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        {step < 8 && (
          <div className="p-6 bg-valentine-cream/30 border-t flex justify-between items-center">
            <button 
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1 || isPaying || !!uploading}
              className={`flex items-center gap-2 font-bold text-sm transition-colors ${step === 1 || !!uploading ? 'text-valentine-soft/50 cursor-not-allowed' : 'text-valentine-soft hover:text-valentine-red'}`}
            >
              <ArrowLeft size={18} /> Previous
            </button>
            
            {step < 7 ? (
              <button 
                onClick={() => setStep(step + 1)}
                disabled={!!uploading}
                className="flex items-center gap-2 bg-valentine-red text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-all text-sm disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Next Step'} <ArrowRight size={18} />
              </button>
            ) : (
              <button 
                onClick={handleGenerate}
                disabled={isPaying || !!uploading}
                className="flex items-center gap-2 bg-valentine-red text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-all text-sm disabled:opacity-50"
              >
                {isPaying ? <Loader2 className="animate-spin" size={18} /> : (config.plan === 'free' || success ? <Save size={18} /> : <Star size={18} />)}
                {isPaying ? 'Processing...' : (config.plan === 'free' || success ? 'Finish Sanctuary' : `Upgrade & Finish`)}
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

export default function WizardPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-valentine-cream flex items-center justify-center"><Heart className="text-valentine-red animate-pulse" size={48} /></div>}>
            <WizardContent />
        </Suspense>
    );
}
