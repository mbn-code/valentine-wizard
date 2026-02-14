"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Music, ImageIcon, MessageSquare, Lock, Save, Copy, Check, ArrowRight, ArrowLeft, X, Sparkles, Star, Zap, Info, Loader2 as LucideLoader, Plus, Trash2, FileText, Upload, Shield } from 'lucide-react';
import { ValentineConfig, SanctuaryPayload } from '@/utils/config';
import { generateMasterKey, exportKey, encryptData, deriveKeyFromPasscode, toBase64URL } from '@/utils/crypto';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { upload } from '@vercel/blob/client';
import { useValentine } from '@/utils/ValentineContext';
import Dashboard from '@/components/Dashboard';
import Invitation from '@/components/Invitation';

function WizardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialPlan = (searchParams.get('plan') as 'spark' | 'plus' | 'infinite') || 'spark';
  const success = searchParams.get('success') === 'true';
  const sessionId = searchParams.get('session_id');
  const paidPlan = searchParams.get('paid_plan') as 'spark' | 'plus' | 'infinite';

  const [step, setStep] = useState(success ? 8 : 1);
  const [isPaying, setIsPaying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(success && !!sessionId);
  const [uploading, setUploading] = useState<string | null>(null);
  const [bulkInput, setBulkInput] = useState<{ [key: string]: string }>({});
  
  const { setPreviewConfig } = useValentine();
  
  const [config, setConfig] = useState<ValentineConfig>({
    plan: initialPlan,
    names: { partner1: '', partner2: '' },
    anniversaryDate: new Date().toISOString().split('T')[0],
    totalDays: initialPlan === 'spark' ? 1 : 3,
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
  const [totalNotesLength, setTotalNotesLength] = useState(0);
  const [previewRefreshKey, setPreviewRefreshKey] = useState(0);

  // Monitor config size for URL limits
  useEffect(() => {
    const encoded = btoa(JSON.stringify(config));
    setConfigLength(encoded.length);
    const notesLen = config.notes.reduce((acc, note) => acc + (note.content?.length || 0), 0);
    setTotalNotesLength(notesLen);
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
              parsed.plan = data.plan || parsed.plan;
              parsed.signature = data.signature; // HMAC proof
              setConfig(parsed);
              
              await finalizeSanctuary(parsed);
            }
          } else {
            alert("Payment verification failed.");
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
  }, [success, sessionId]);

  const PLAN_LIMITS = {
    spark: { days: 1, notes: 5, gallery: 10, video: false, branding: false, background: true },
    plus: { days: 7, notes: 25, gallery: 30, video: false, branding: false, background: true },
    infinite: { days: 14, notes: 500, gallery: 50, video: true, branding: false, background: true }
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

  const deleteAsset = async (url: string) => {
    try {
        const encodedConfig = btoa(JSON.stringify(config));
        await fetch('/api/delete-blobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ urls: [url], config: encodedConfig })
        });
    } catch (e) {
        console.error("Failed to delete asset from cloud", e);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, path: string, isGallery = false, dayKey?: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(path);
    try {
      if (isGallery && dayKey) {
        const totalImages = Object.values(config.galleryImages || {}).reduce((acc, day) => acc + day.length, 0);
        if (totalImages + files.length > currentLimits.gallery) {
            alert(`You've reached the limit of ${currentLimits.gallery} photos for your plan.`);
            setUploading(null);
            return;
        }
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
      alert(`Upload failed: ${msg}.`);
      console.error(err);
    } finally {
      setUploading(null);
    }
  };

  const finalizeSanctuary = async (finalConfig: ValentineConfig) => {
    try {
      const sanitizedConfig = { ...finalConfig };
      
      if (finalConfig.passcode && finalConfig.passcode !== '1402') {
        const salt = crypto.getRandomValues(new Uint8Array(16));
        const saltBase64 = toBase64URL(salt.buffer);
        const passcodeKey = await deriveKeyFromPasscode(finalConfig.passcode, saltBase64);
        
        const encryptedNotes = await encryptData(finalConfig.notes, passcodeKey);
        const encryptedVideo = await encryptData(finalConfig.videoUrl, passcodeKey);
        
        (sanitizedConfig as any).encryptedNotes = encryptedNotes;
        (sanitizedConfig as any).encryptedVideo = encryptedVideo;
        (sanitizedConfig as any).passcodeSalt = saltBase64;
        
        sanitizedConfig.notes = [];
        sanitizedConfig.videoUrl = '';
      }

      const masterKey = await generateMasterKey();
      const exportedMasterKey = await exportKey(masterKey);

      const { ciphertext, iv } = await encryptData(sanitizedConfig, masterKey);

      const payload: SanctuaryPayload = { d: ciphertext, iv };
      const query = new URLSearchParams(payload as any).toString();
      const url = `${window.location.origin}/?${query}#${exportedMasterKey}`;
      
      setGeneratedLink(url);
      setStep(8);
    } catch (e) {
      console.error("Encryption failed", e);
      alert("Failed to secure your sanctuary.");
    }
  };

  const handleGenerate = async () => {
    if (!success) {
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
                alert("Checkout error.");
                setIsPaying(false);
            }
        } catch (e) {
            console.error(e);
            setIsPaying(false);
        }
        return;
    }

    await finalizeSanctuary(config);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("⚠️ WARNING: Irreversible Action\n\nThis will permanently delete all assets. No refunds.");
    if (!confirmed) return;

    setIsDeleting(true);
    try {
        const urls = [];
        if (config.backgroundUrl) urls.push(config.backgroundUrl);
        if (config.videoUrl) urls.push(config.videoUrl);
        if (config.galleryImages) {
            Object.values(config.galleryImages).forEach(dayImages => {
                urls.push(...dayImages);
            });
        }

        if (urls.length > 0) {
            const encodedConfig = btoa(JSON.stringify(config));
            await fetch('/api/delete-blobs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ urls, config: encodedConfig })
            });
        }

        alert("Deleted successfully.");
        window.location.href = '/wizard';
    } catch (e) {
        console.error(e);
        alert("Failed to delete.");
    } finally {
        setIsDeleting(false);
    }
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
                    ? "Get up to 7 days and more photos with 'The Romance' plan."
                    : "Unlock the Secret Cinema (Video) and 14-day countdowns with 'The Sanctuary'."}
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
        <main className="min-h-screen bg-valentine-cream flex flex-col items-center justify-center p-8 text-center text-gray-800">
            <div className="space-y-6">
                <Loader2 className="w-16 h-16 text-valentine-red animate-spin mx-auto" />
                <h2 className="text-2xl font-bold text-valentine-red font-sacramento text-4xl">Verifying your romance...</h2>
                <p className="text-valentine-soft italic">Encrypting and verifying your sanctuary.</p>
            </div>
        </main>
      );
  }

  return (
    <main className="min-h-screen bg-valentine-cream p-4 md:p-8 flex flex-col items-center text-gray-800">
      <div className="max-w-3xl w-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col min-h-[650px]">
        <div className="bg-valentine-red p-6 text-white flex items-center justify-between text-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
                {steps[step-1]?.icon}
            </div>
            <div className="text-white">
                <h1 className="text-xl font-bold">Valentine Wizard</h1>
                <p className="text-valentine-pink/80 text-[10px] uppercase font-bold tracking-widest">{config.plan} Plan • Step {step} of 8</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {step > 1 && step < 8 && (
                <button 
                    onClick={() => {
                        setPreviewConfig(config);
                        setIsPreviewing(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all text-[10px] text-white font-bold uppercase tracking-widest border border-white/20"
                >
                    <Zap size={14} className="fill-current" /> Preview
                </button>
            )}
            <Link href="/" className="hover:bg-white/10 p-2 rounded-full transition-colors text-white">
                <X size={24} />
            </Link>
          </div>
        </div>

        <div className="h-1 bg-valentine-pink/20 w-full flex">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
            <div 
              key={s} 
              className={`h-full transition-all duration-500 ${s <= step ? 'bg-valentine-red' : ''}`} 
              style={{ width: '12.5%' }}
            />
          ))}
        </div>

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
                        <h2 className="text-2xl font-bold text-valentine-red font-sacramento text-4xl">Choose your experience</h2>
                        <p className="text-valentine-soft text-sm mt-1">Pick the tier that fits your story.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                        {[
                            { id: 'spark', name: 'Spark', price: '$2.00', desc: 'The Sweet Teaser' },
                            { id: 'plus', name: 'Romance', price: '$7.00', desc: 'A Week of Love' },
                            { id: 'infinite', name: 'Sanctuary', price: '$12.00', desc: 'The Full Journey' }
                        ].map((p) => (
                            <div 
                                key={p.id}
                                onClick={() => updateConfig('plan', p.id)}
                                className={`p-4 rounded-2xl border-4 cursor-pointer transition-all flex flex-col text-center ${config.plan === p.id ? 'border-valentine-red bg-valentine-red/5 shadow-inner' : 'border-valentine-pink/10 hover:border-valentine-pink/30'}`}
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
                                {config.plan === 'spark' ? '5 Secret Notes' : config.plan === 'plus' ? '25 Secret Notes' : '500 Secret Notes'}
                            </li>
                            <li className="flex items-center gap-2">
                                <Check size={14} className="text-green-500" /> 
                                {config.plan === 'spark' ? '1 Day Countdown' : config.plan === 'plus' ? '7 Day Countdown' : '14 Day Journey'}
                            </li>
                            <li className="flex items-center gap-2">
                                <Check size={14} className="text-green-500" /> 
                                {config.plan === 'spark' ? '10 Photo Uploads' : config.plan === 'plus' ? '30 Photo Uploads' : '50 Photo Uploads'}
                            </li>
                            <li className="flex items-center gap-2">
                                {currentLimits.video ? <Check size={14} className="text-green-500" /> : <X size={14} className="text-valentine-pink" />}
                                Custom Secret Video
                            </li>
                        </ul>
                    </div>
                    <button 
                        onClick={() => {
                            setPreviewConfig(config);
                            setIsPreviewing(true);
                        }}
                        className="w-full py-3 border-2 border-valentine-red text-valentine-red rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-valentine-red/5 transition-all flex items-center justify-center gap-2"
                    >
                        <Zap size={14} className="fill-current" /> Preview Experience
                    </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 text-left">
                      <label className="block text-sm font-bold text-valentine-soft uppercase tracking-wider">Your Name</label>
                      <input 
                        type="text" 
                        value={config.names.partner1}
                        onChange={(e) => updateConfig('names.partner1', e.target.value)}
                        placeholder="e.g. Romeo"
                        className="w-full p-4 rounded-xl border-2 border-valentine-pink/20 focus:border-valentine-red outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-2 text-left">
                      <label className="block text-sm font-bold text-valentine-soft uppercase tracking-wider">Their Name</label>
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
                        <label className="block text-sm font-bold text-valentine-soft uppercase flex items-center gap-2 tracking-wider">
                            Anniversary Date
                            <span className="group relative">
                                <Info size={14} className="text-valentine-pink cursor-help" />
                                <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-gray-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl font-sans normal-case">
                                    Used to calculate your total time together.
                                </span>
                            </span>
                        </label>
                        <input 
                        type="date" 
                        value={config.anniversaryDate.split('T')[0]}
                        onChange={(e) => updateConfig('anniversaryDate', new Date(e.target.value).toISOString())}
                        className="w-full p-4 rounded-xl border-2 border-valentine-pink/20 focus:border-valentine-red outline-none transition-colors text-gray-800"
                        />
                    </div>
                    <div className="space-y-2 relative text-left">
                        <label className="block text-sm font-bold text-valentine-soft uppercase tracking-wider">Duration (Days)</label>
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
                            <UpgradeNudge target={config.plan === 'spark' ? 'plus' : 'infinite'} />
                        )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 pt-4 border-t border-valentine-pink/10 text-left">
                    <div className="space-y-2">
                        <label className="block text-sm font-bold text-valentine-soft uppercase flex justify-between tracking-wider">
                            Custom Background Image
                        </label>
                        
                        <div className={`relative rounded-xl border-2 border-dashed p-6 transition-all border-valentine-pink/30 bg-white hover:border-valentine-red cursor-pointer`}>
                            {config.backgroundUrl ? (
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-valentine-pink/20 shadow-sm bg-gray-50">
                                        <img src={config.backgroundUrl} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-xs font-bold text-valentine-red">Background Set</p>
                                        <button 
                                            onClick={() => {
                                                const url = config.backgroundUrl;
                                                updateConfig('backgroundUrl', '');
                                                if (url) deleteAsset(url);
                                            }}
                                            className="text-[10px] text-valentine-soft underline uppercase font-bold hover:text-valentine-red transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <label className={`flex flex-col items-center justify-center gap-2 cursor-pointer`}>
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
                                        disabled={!!uploading}
                                        onChange={(e) => handleFileUpload(e, 'backgroundUrl')}
                                    />
                                </label>
                            )}
                        </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4 text-left">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-valentine-soft">Provide Spotify Track IDs for each stage.</p>
                    <span className="group relative">
                        <Info size={14} className="text-valentine-pink cursor-help" />
                        <span className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl leading-relaxed font-sans">
                            Open Spotify, click "..." on a song → Share → Copy Link. Then paste it here.
                        </span>
                    </span>
                  </div>
                  <div className="max-h-[350px] overflow-y-auto pr-2 custom-scrollbar space-y-4">
                    {getDaysArray().map((day) => (
                        <div key={day} className="space-y-2 p-4 bg-valentine-cream/30 rounded-xl">
                        <label className="block text-[10px] font-bold text-valentine-soft uppercase tracking-wider">Feb {day} Track</label>
                        <input 
                            type="text" 
                            value={config.spotifyTracks[`day${day}`] || ""}
                            onChange={(e) => updateConfig(`spotifyTracks.day${day}`, e.target.value.split('/').pop()?.split('?')[0])}
                            placeholder="Paste Spotify Link or ID"
                            className="w-full p-3 rounded-lg border-2 border-valentine-pink/20 focus:border-valentine-red outline-none transition-colors text-sm bg-white"
                        />
                        </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4 text-left">
                    <div className="flex items-center gap-2 text-left">
                        <p className="text-sm text-valentine-soft">Upload images for each day.</p>
                        <span className="group relative text-left">
                            <Info size={14} className="text-valentine-pink cursor-help" />
                            <span className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl leading-relaxed font-sans">
                                Upload JPG, PNG, or WebP. These will be shown as scratch-off memories!
                            </span>
                        </span>
                    </div>
                    <div className="max-h-[450px] overflow-y-auto pr-2 custom-scrollbar space-y-8">
                        {getDaysArray().map((day) => {
                          const dayKey = `day${day}`;
                          const images = config.galleryImages?.[dayKey] || [];
                          return (
                            <div key={day} className="p-5 bg-valentine-cream/30 rounded-2xl space-y-4 border border-valentine-pink/10">
                              <div className="flex justify-between items-center text-left">
                                <label className="block text-[10px] font-bold text-valentine-red uppercase tracking-[0.2em]">
                                  Feb {day} Gallery
                                </label>
                                <span className="text-[10px] bg-white px-2 py-1 rounded-full font-bold text-valentine-soft shadow-sm">
                                    {images.length} / {currentLimits.gallery}
                                </span>
                              </div>
                              
                              <div className="space-y-4 text-left">
                                <label className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed border-valentine-pink/30 rounded-xl p-6 transition-all hover:border-valentine-red cursor-pointer bg-white/50 group ${uploading ? 'pointer-events-none' : ''}`}>
                                    {uploading === `gallery_${dayKey}` ? (
                                        <Loader2 className="animate-spin text-valentine-red" size={24} />
                                    ) : (
                                        <Plus className="text-valentine-pink group-hover:scale-110 transition-transform" size={24} />
                                    )}
                                    <span className="text-xs font-bold text-valentine-soft uppercase tracking-wider">
                                        {uploading === `gallery_${dayKey}` ? 'Uploading...' : 'Select Photos'}
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
                                            <div key={idx} className="relative group rounded-lg overflow-hidden border-2 border-valentine-pink/20 aspect-square bg-white shadow-sm text-left">
                                                <img src={url} className="w-full h-full object-cover" alt="" />
                                                <button 
                                                    onClick={() => {
                                                        const newImages = images.filter((_, i) => i !== idx);
                                                        updateConfig(`galleryImages.${dayKey}`, newImages);
                                                        if (url) deleteAsset(url);
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

              {step === 5 && (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar text-left">
                  <div className="flex flex-col gap-1 text-left">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-valentine-soft font-bold uppercase tracking-wider">Secret Notes</p>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded ${totalNotesLength > 7500 ? 'bg-red-100 text-red-600' : 'bg-valentine-cream text-valentine-soft'}`}>
                        {totalNotesLength.toLocaleString()} / 8,000 Characters
                      </span>
                    </div>
                    <p className="text-[10px] text-valentine-soft italic leading-relaxed">
                        Combined limit for all notes.
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between text-left">
                    <p className="text-xs text-valentine-soft">Write messages that unlock over time.</p>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded ${config.notes.length >= currentLimits.notes ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                        {config.notes.length} / {currentLimits.notes} Used
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
                            const newContent = e.target.value;
                            const otherNotesLen = config.notes.reduce((acc, n, i) => i === idx ? acc : acc + (n.content?.length || 0), 0);
                            if (otherNotesLen + newContent.length <= 8000) {
                                const newNotes = [...config.notes];
                                newNotes[idx].content = newContent;
                                updateConfig('notes', newNotes);
                            }
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
                            if (totalNotesLength >= 8000) {
                                alert("Character limit reached.");
                                return;
                            }
                            const newNotes = [...config.notes, { id: `note${Date.now()}`, day: 14, content: '' }];
                            updateConfig('notes', newNotes);
                        }}
                        className="w-full py-3 border-2 border-dashed border-valentine-red text-valentine-red rounded-2xl font-bold hover:bg-valentine-red/5 transition-colors text-sm"
                    >
                        + Add Another Note
                    </button>
                  ) : (
                    <UpgradeNudge target={config.plan === 'spark' ? 'plus' : 'infinite'} />
                  )}
                </div>
              )}

              {step === 6 && (
                <div className="space-y-4">
                  {!currentLimits.video ? (
                    <div className="p-8 text-center bg-valentine-red/5 rounded-3xl border-2 border-dashed border-valentine-pink/30">
                      <ImageIcon size={48} className="mx-auto text-valentine-pink mb-4" />
                      <h3 className="text-xl font-bold text-valentine-red mb-2">Secret Cinema is Premium</h3>
                      <p className="text-sm text-valentine-soft mb-6">Upgrade to <b>The Sanctuary</b> plan to upload your own memory movie.</p>
                      <button onClick={() => setStep(1)} className="px-6 py-2 bg-valentine-red text-white rounded-full font-bold shadow-lg block mx-auto">View Plans</button>
                    </div>
                  ) : (
                    <div className="space-y-4 text-left">
                      <label className="block text-sm font-bold text-valentine-soft uppercase tracking-wider flex items-center gap-2">
                        Secret Cinema Video
                        <span className="group relative">
                            <Info size={14} className="text-valentine-pink cursor-help" />
                            <span className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl leading-relaxed font-sans">
                                Upload an MP4 or MOV file. Under 50MB recommended.
                            </span>
                        </span>
                      </label>
                      
                      <div className={`relative rounded-xl border-2 border-dashed p-8 transition-all ${uploading === 'videoUrl' ? 'bg-valentine-cream/30 border-valentine-red' : 'border-valentine-pink/30 bg-white hover:border-valentine-red'}`}>
                        {config.videoUrl ? (
                            <div className="space-y-4 text-left">
                                <div className="aspect-video w-full rounded-lg overflow-hidden border-2 border-valentine-pink/20 bg-black shadow-inner">
                                    <video src={config.videoUrl} className="w-full h-full object-cover" controls />
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-xs font-bold text-valentine-red uppercase">Video Uploaded</p>
                                    <button 
                                        onClick={() => {
                                            const url = config.videoUrl;
                                            updateConfig('videoUrl', '');
                                            if (url) deleteAsset(url);
                                        }}
                                        className="text-[10px] text-valentine-soft underline uppercase font-bold hover:text-valentine-red"
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
                                        {uploading === 'videoUrl' ? 'Uploading...' : 'Upload Video'}
                                    </p>
                                    <p className="text-[10px] text-valentine-soft mt-1 italic">Best for .mp4 or .mov</p>
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
                    <label className="block text-sm font-bold text-valentine-soft uppercase flex items-center gap-2">
                        Secret Passcode
                        <span className="group relative">
                            <Info size={14} className="text-valentine-pink cursor-help" />
                            <span className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl leading-relaxed font-sans">
                                A 4-digit code to mathematically unlock the memories.
                            </span>
                        </span>
                    </label>
                    <input 
                      type="text" 
                      maxLength={4}
                      value={config.passcode}
                      onChange={(e) => updateConfig('passcode', e.target.value.replace(/\D/g, ''))}
                      className={`w-full p-4 text-center text-4xl tracking-widest font-bold rounded-xl border-2 transition-all outline-none border-valentine-pink/20 focus:border-valentine-red focus:bg-white bg-gray-50`}
                    />
                    <p className="text-xs text-valentine-soft text-center font-bold text-[10px] uppercase tracking-widest">
                        Choose any 4 numbers.
                    </p>
                  </div>
                </div>
              )}

              {step === 8 && (
                <div className="space-y-8 text-center py-10">
                  <div className="space-y-2 text-center text-gray-800">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check size={40} />
                    </div>
                    <h2 className="text-3xl font-bold text-valentine-red font-sacramento text-5xl">Sanctuary Ready</h2>
                    <p className="text-valentine-soft text-sm italic">Encrypted, verified, and ready to share.</p>
                  </div>

                  <div className="space-y-4 text-left">
                    <div className="p-4 bg-valentine-cream rounded-xl border-2 border-valentine-pink/20 break-all text-xs font-mono bg-gray-50 overflow-hidden shadow-inner">
                      {generatedLink}
                    </div>
                    <p className="text-[10px] text-valentine-soft italic leading-relaxed text-center">
                        <Shield size={10} className="inline mr-1" /> 
                        End-to-end privacy. Encryption key generated locally.
                    </p>
                    <div className="flex flex-col gap-3">
                      <button 
                        onClick={copyToClipboard}
                        className="w-full flex items-center justify-center gap-2 py-4 bg-valentine-red text-white rounded-xl font-bold shadow-lg hover:scale-[1.02] transition-all"
                      >
                        {copied ? <Check size={20} /> : <Copy size={20} />}
                        {copied ? 'Link Copied!' : 'Copy Link'}
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
                        className="w-full text-center text-xs text-valentine-soft underline mt-2 font-bold hover:text-valentine-red transition-colors"
                      >
                        Preview Sanctuary
                      </a>

                      <button 
                        onClick={() => setStep(2)}
                        className="w-full text-center text-[10px] text-valentine-soft uppercase tracking-widest font-bold mt-4 hover:text-valentine-red transition-colors"
                      >
                        Edit Details
                      </button>
                      
                      <div className="pt-8 border-t border-valentine-pink/10 mt-4 text-center">
                        <button 
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="w-full flex items-center justify-center gap-2 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all text-xs font-bold uppercase tracking-widest"
                        >
                            {isDeleting ? <Loader2 className="animate-spin" size={14} /> : <Trash2 size={14} />}
                            Destroy Sanctuary
                        </button>
                        <p className="text-[10px] text-valentine-soft mt-2 italic text-center">
                            * Wipes all photos and videos.
                        </p>
                      </div>
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
            <div className="flex gap-2">
                <button 
                onClick={() => setStep(Math.max(1, step - 1))}
                disabled={step === 1 || isPaying || !!uploading}
                className={`flex items-center gap-2 font-bold text-sm transition-colors ${step === 1 || !!uploading ? 'text-valentine-soft/50 cursor-not-allowed' : 'text-valentine-soft hover:text-valentine-red'}`}
                >
                <ArrowLeft size={18} /> Previous
                </button>
                {step > 1 && (
                    <button 
                        onClick={() => {
                            setPreviewConfig(config);
                            setIsPreviewing(true);
                        }}
                        className="hidden md:flex items-center gap-2 text-valentine-soft hover:text-valentine-red font-bold text-sm transition-colors ml-4"
                    >
                        <Zap size={16} /> Preview
                    </button>
                )}
            </div>
            
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
                {isPaying ? <div className="animate-spin"><Sparkles size={18} /></div> : success ? <Save size={18} /> : <Lock size={18} />}
                {isPaying ? 'Redirecting...' : success ? 'Finish Sanctuary' : `Pay & Finalize`}
              </button>
            )}
          </div>
        )}
        {step < 7 && !success && (
            <div className="p-4 bg-valentine-red/5 flex flex-col items-center justify-center gap-2 border-t border-valentine-pink/10 text-gray-800">
                <div className="flex items-center gap-4 text-[10px] text-valentine-soft font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-1 text-gray-800"><Shield size={10} /> Secure Stripe Payment</span>
                    <span className="flex items-center gap-1 text-gray-800"><Check size={10} /> One-time purchase</span>
                </div>
                <p className="text-[9px] text-valentine-soft italic text-center opacity-70">
                    By proceeding, you agree that digital goods are non-refundable.
                </p>
            </div>
        )}
      </div>

      {/* Live Preview Overlay */}
      <AnimatePresence>
        {isPreviewing && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="fixed inset-0 z-[2000] bg-valentine-cream overflow-y-auto"
            >
                <div className="sticky top-0 left-0 w-full p-4 bg-white/80 backdrop-blur-md border-b border-valentine-pink/20 flex justify-between items-center z-[2100]">
                    <div className="flex items-center gap-2">
                        <Sparkles className="text-valentine-red" size={20} />
                        <span className="text-xs font-bold text-valentine-red uppercase tracking-widest">Live Preview Mode</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer group">
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
                                <div className="w-10 h-5 bg-gray-300 rounded-full peer peer-checked:bg-valentine-red transition-all shadow-inner"></div>
                                <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full peer-checked:left-6 transition-all shadow-md"></div>
                            </div>
                            <span className="text-[10px] font-bold text-valentine-soft uppercase tracking-widest group-hover:text-valentine-red transition-colors">Force Unlock All</span>
                        </label>
                        <button 
                            onClick={() => {
                                setIsPreviewing(false);
                                setPreviewConfig(null);
                                localStorage.removeItem('debug_unlock_all');
                            }}
                            className="px-6 py-2 bg-valentine-red text-white rounded-full font-bold shadow-lg text-xs uppercase tracking-widest hover:scale-105 transition-all"
                        >
                            Close Preview
                        </button>
                    </div>
                </div>
                
                <div className="relative">
                    {/* Render the actual app components using the injected preview config */}
                    <PreviewApp forceUpdateKey={previewRefreshKey} />
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}

/**
 * Internal component to handle the preview logic (switching between invitation and dashboard)
 */
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

function Loader2({ className, size }: { className?: string, size?: number }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={size || 24} 
            height={size || 24} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
    );
}

export default function WizardPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-valentine-cream flex items-center justify-center"><Heart className="text-valentine-red animate-pulse" size={48} /></div>}>
            <WizardContent />
        </Suspense>
    );
}
