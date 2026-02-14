"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { ValentineConfig, SanctuaryPayload } from '@/utils/config';
import { setAnniversaryDate } from '@/utils/date';
import { importKey, decryptData } from '@/utils/crypto';

interface ValentineContextType {
  config: ValentineConfig | null;
  isWizardMode: boolean;
  decryptWithPasscode: (passcode: string) => Promise<boolean>;
  isLocked: boolean;
  setPreviewConfig: (config: ValentineConfig | null) => void;
}

const ValentineContext = createContext<ValentineContextType | undefined>(undefined);

export function ValentineProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ValentineConfig | null>(null);
  const [isWizardMode, setIsWizardMode] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const setPreviewConfig = (newConfig: ValentineConfig | null) => {
    setConfig(newConfig);
    if (newConfig) {
      setAnniversaryDate(newConfig.anniversaryDate);
    }
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const d = searchParams.get('d');
    const iv = searchParams.get('iv');
    const masterKeyBase64 = window.location.hash.slice(1);

    if (d && iv && masterKeyBase64) {
      const decrypt = async () => {
        try {
          const masterKey = await importKey(masterKeyBase64);
          const decryptedConfig = await decryptData(d, iv, masterKey);
          
          if (decryptedConfig) {
            setConfig(decryptedConfig);
            setAnniversaryDate(decryptedConfig.anniversaryDate);
            
            // Check if high-value fields are encrypted (locked)
            if (decryptedConfig.passcodeSalt) {
              setIsLocked(true);
            }
          }
        } catch (e) {
          console.error("Master decryption failed", e);
        }
      };
      decrypt();
      return;
    }
    
    if (window.location.pathname === '/wizard') {
      setIsWizardMode(true);
    }
  }, []);

  const decryptWithPasscode = async (passcode: string): Promise<boolean> => {
    if (!config || !(config as any).passcodeSalt) return false;

    try {
      const { deriveKeyFromPasscode, decryptData } = await import('@/utils/crypto');
      const passcodeKey = await deriveKeyFromPasscode(passcode, (config as any).passcodeSalt);
      
      const decryptedNotes = await decryptData(
        (config as any).encryptedNotes.ciphertext,
        (config as any).encryptedNotes.iv,
        passcodeKey
      );
      
      const decryptedVideo = await decryptData(
        (config as any).encryptedVideo.ciphertext,
        (config as any).encryptedVideo.iv,
        passcodeKey
      );

      setConfig({
        ...config,
        notes: decryptedNotes,
        videoUrl: decryptedVideo
      });
      setIsLocked(false);
      return true;
    } catch (e) {
      console.error("Passcode decryption failed", e);
      return false;
    }
  };

  return (
    <ValentineContext.Provider value={{ config, isWizardMode, decryptWithPasscode, isLocked, setPreviewConfig }}>
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
