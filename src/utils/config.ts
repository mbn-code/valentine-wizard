import LZString from 'lz-string';

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
  galleryImages?: Record<string, string[]>; // "dayX" -> array of image URLs
}

export function encodeConfig(config: ValentineConfig): string {
  const json = JSON.stringify(config);
  return LZString.compressToEncodedURIComponent(json);
}

export function decodeConfig(encoded: string): ValentineConfig | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    return JSON.parse(json);
  } catch (e) {
    console.error("Failed to decode config", e);
    return null;
  }
}
