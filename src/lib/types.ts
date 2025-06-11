export type DealLabel = '🔥 Affare' | '👍 OK' | '❌ Fuori Prezzo';

export interface WatchDeal {
  id: string;
  title: string; // Added title
  brand: string | null; // Now nullable
  model: string | null; // Now nullable
  referenceNumber: string | null; // Now nullable
  
  listingPriceEUR: number | null; // Updated name
  marketPriceEUR: number | null;  // Updated name
  retailPriceEUR?: number | null; // Updated name and optional

  originalListingPrice?: number | null; // New optional field
  originalCurrency?: string | null;     // New optional field

  estimatedMarginPercent: number | null;
  aiScore: number | null;
  dealLabel: DealLabel | string | null; // Allow string for flexibility, or specific DealLabel union, or null

  imageUrl: string | null; // Can be null if no image
  imageUrls: string[]; // Array of all image URLs, primary first if available
  sourceUrl: string;
  lastUpdated: string; 
  description?: string;
  condition?: string;
  demand?: 'High' | 'Medium' | 'Low';
  rarity?: 'Common' | 'Uncommon' | 'Rare' | 'Very Rare';
  risk?: 'Low' | 'Medium' | 'High';
  location?: string;
}

export interface UserPreferences {
  preferredBrands: string[];
  priceRange: [number, number];
  stylePreferences: string[];
}

export interface UserHistory {
  viewedWatches: string[];
  purchases: string[]; 
  roiReports: Array<{ watchId: string; roi: number }>;
}
