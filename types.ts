
export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Sunset: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  city?: string;
}

export interface GreetingResponse {
  message: string;
  verse?: string;
  blessing: string;
}

export interface ReflectionResponse {
  thought: string;
  action: string;
  context: string;
}

export interface QuranVerse {
  number: number;
  text: string;
  translation: string;
  surah: string;
}

export interface JuzData {
  number: number;
  verses: QuranVerse[];
}
