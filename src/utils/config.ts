import LZString from 'lz-string';

/**
 * The core configuration for a Valentine Sanctuary.
 * This is what gets encrypted and stored in the URL.
 */
export interface ValentineConfig {
  plan: 'free' | 'plus' | 'infinite';
  names: {
    partner1: string;
    partner2: string;
  };
  anniversaryDate: string; // ISO format
  totalDays: number; // Number of days leading up to and including Feb 14th
  spotifyTracks: Record<string, string>; // "dayX" -> track ID (e.g. "day14")
  notes: {
    id: string;
    day: number; // Day of February (1-14)
    hour?: number;
    content: string;
    isSpotify?: boolean;
    spotifyId?: string;
  }[];
  passcode: string;
  videoUrl?: string;
  backgroundUrl?: string;
  galleryImages?: Record<string, string[]>; // "dayX" -> array of image URLs
  signature?: string; // HMAC proof of payment
}

/**
 * The public-facing payload stored in the query string.
 * All actual sensitive data is in 'd', encrypted.
 */
export interface SanctuaryPayload {
  d: string;  // AES-GCM Ciphertext (Base64URL)
  iv: string; // AES-GCM IV (Base64URL)
  v?: string; // Version or other public metadata
}

/**
 * Legacy encoding/decoding (kept for migration or reference if needed)
 */
export function encodeConfigLegacy(config: ValentineConfig): string {
  const json = JSON.stringify(config);
  return LZString.compressToEncodedURIComponent(json);
}

export function decodeConfigLegacy(encoded: string): ValentineConfig | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    return JSON.parse(json);
  } catch (e) {
    console.error("Failed to decode legacy config", e);
    return null;
  }
}
