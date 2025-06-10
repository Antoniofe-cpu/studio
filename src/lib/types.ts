export type DealLabel = '🔥 Affare' | '👍 OK' | '❌ Fuori Prezzo';

export interface WatchDeal {
  id: string;
  imageUrl: string;
  brand: string;
  model: string;
  referenceNumber: string;
  listingPrice: number;
  marketPrice: number;
  retailPrice?: number;
  estimatedMarginPercent: number;
  aiScore: number; // 0-100
  dealLabel: DealLabel;
  tags: string[]; // e.g., #Discontinued, #LimitedEdition
  sourceUrl: string;
  description?: string;
  condition?: string;
  demand?: 'High' | 'Medium' | 'Low';
  rarity?: 'Common' | 'Uncommon' | 'Rare' | 'Very Rare';
  risk?: 'Low' | 'Medium' | 'High';
  location?: string;
  lastUpdated: string;
}

export interface UserPreferences {
  preferredBrands: string[];
  priceRange: [number, number];
  stylePreferences: string[];
}

export interface UserHistory {
  viewedWatches: string[]; // Array of watch IDs or reference numbers
  purchases: string[]; // Array of watch IDs or reference numbers
  roiReports: Array<{ watchId: string; roi: number }>;
}
