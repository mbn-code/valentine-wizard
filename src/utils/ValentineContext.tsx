"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { ValentineConfig, decodeConfig } from '@/utils/config';
import { setAnniversaryDate } from '@/utils/date';

interface ValentineContextType {
  config: ValentineConfig | null;
  isWizardMode: boolean;
}

const ValentineContext = createContext<ValentineContextType | undefined>(undefined);

const DEFAULT_CONFIG: ValentineConfig = {
  plan: 'infinite',
  names: {
    partner1: "You",
    partner2: "Me"
  },
  anniversaryDate: "2022-07-28T00:00:00",
  totalDays: 3,
  spotifyTracks: {
    "day12": "4riDfclV7kPDT9D58FpmHd",
    "day13": "0TZOdKFWNYfnwewAP8R4D8",
    "day14": "657CttNzh41EseXiePl3qC",
  },
  notes: [
    { id: "note1", day: 12, content: "Min lille abe <3" },
    { id: "note2", day: 12, content: "Biblioteket :)" },
    { id: "note7", day: 12, hour: 13, content: "Ekstra sang slap af :)", isSpotify: true, spotifyId: "4S4QJfBGGrC8jRIjJHf1Ka" },
    { id: "note3", day: 13, content: "Ekstra sang :)", isSpotify: true, spotifyId: "1fRLjwhspxZPVdV5MOpFeg" },
    { id: "note4", day: 13, content: "Tegne på ipad på maccen :)" },
    { id: "note5", day: 14, content: "https://www.instagram.com/p/DRcVHc8kwUe/" },
    { id: "note6", day: 14, content: "Bakken :)" },
    { id: "note8", day: 14, content: "En sidste sang :)", isSpotify: true, spotifyId: "7EAMXbLcL0qXmciM5SwMh2" },
  ],
  passcode: "1402",
  videoUrl: "/assets/videos/joyful_moments.mov",
  backgroundUrl: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1200&q=80",
  galleryImages: {
      "day12": [
          "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=800&q=80",
          "https://images.unsplash.com/photo-1516589174184-c685266d430c?w=800&q=80"
      ],
      "day13": [
          "https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=800&q=80"
      ],
      "day14": [
          "https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800&q=80"
      ]
  }
};

export function ValentineProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ValentineConfig | null>(null);
  const [isWizardMode, setIsWizardMode] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#config=')) {
      const encoded = hash.replace('#config=', '');
      const decoded = decodeConfig(encoded);
      if (decoded) {
        setConfig(decoded);
        setAnniversaryDate(decoded.anniversaryDate);
        return;
      }
    }
    
    if (window.location.pathname === '/wizard') {
      setIsWizardMode(true);
    } else if (window.location.pathname === '/' && !hash) {
      // Keep null to show landing
    } else {
        setConfig(DEFAULT_CONFIG);
        setAnniversaryDate(DEFAULT_CONFIG.anniversaryDate);
    }
  }, []);

  return (
    <ValentineContext.Provider value={{ config, isWizardMode }}>
      {children}
    </ValentineContext.Provider>
  );
}

export function useValentine() {
  const context = useContext(ValentineContext);
  if (context === undefined) {
    throw new Error('useValentine must be used within a ValentineProvider');
  }
  return context;
}
