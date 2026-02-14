import LZString from 'lz-string';

export interface ValentineConfig {
  plan: 'free' | 'pro';
  names: {
    partner1: string;
    partner2: string;
  };
  anniversaryDate: string; // ISO format
  spotifyTracks: {
    day12: string; // track ID
    day13: string;
    day14: string;
    extra?: string[];
  };
  notes: {
    id: string;
    day: number;
    hour?: number;
    content: string;
    isSpotify?: boolean;
    spotifyId?: string;
  }[];
  passcode: string;
  videoUrl?: string;
  galleryImages?: {
    day12: string[];
    day13: string[];
    day14: string[];
  };
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
