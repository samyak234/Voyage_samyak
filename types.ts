export type ActivityType =
  | 'Food & Drink'
  | 'Museum & Art'
  | 'Outdoor & Nature'
  | 'Shopping'
  | 'Entertainment'
  | 'Landmark'
  | 'Other';

export interface Activity {
  name: string;
  description: string;
  time: string;
  // PERF: Removed location, latitude, longitude, and activityType for speed.
  // Fix: Add back location, latitude, and longitude as optional properties to resolve errors in MapView.tsx.
  location?: string;
  latitude?: number;
  longitude?: number;
}

export interface DayPlan {
  day: number;
  title: string;
  summary?: string;
  activities: Activity[];
}

export interface TravelCost {
    mode: 'flight' | 'train' | 'other';
    estimatedCost: string;
    costDisclaimer: string;
}

export interface DestinationQuote {
  quote: string;
  author: string;
  translation?: string;
}

// PERF: Simplified to a string array for faster, streamed generation.
export type PackingListItem = string;


export interface Itinerary {
  destination: string;
  duration: number;
  tripTitle: string;
  tripSummary: string;
  dailyPlans: DayPlan[];
  // PERF: Made complex, slower-to-generate properties optional.
  packingList?: PackingListItem[];
  travelCost?: TravelCost;
  destinationQuote?: DestinationQuote;
  localization?: Localization;
  isComplete?: boolean;
}

export interface UserPreferences {
  origin: string;
  destination: string;
  duration: number;
  interests: string[];
  budget: 'budget' | 'moderate' | 'luxury';
}

export interface TranslatedStrings {
    aboutUs: string;
}

export interface Localization {
    targetLanguage: string;
    translatedStrings: TranslatedStrings;
}