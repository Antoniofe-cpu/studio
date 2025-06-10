
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './config';
import type { WatchDeal } from '@/lib/types';

const WATCH_DEALS_COLLECTION = 'watchDeals';

export async function getWatchDealsFromFirestore(): Promise<WatchDeal[]> {
  try {
    const dealsCollectionRef = collection(db, WATCH_DEALS_COLLECTION);
    // You can add query constraints here, e.g., orderBy, where
    // For example, ordering by lastUpdated in descending order:
    const q = query(dealsCollectionRef, orderBy('lastUpdated', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const deals: WatchDeal[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // Ensure all required fields are present and correctly typed
      // Handle Firestore Timestamp for lastUpdated
      let lastUpdatedString = data.lastUpdated;
      if (data.lastUpdated instanceof Timestamp) {
        lastUpdatedString = data.lastUpdated.toDate().toISOString();
      } else if (typeof data.lastUpdated === 'object' && data.lastUpdated.seconds) {
        // Handle cases where Timestamp might be a plain object (e.g., after JSON serialization/deserialization)
        lastUpdatedString = new Date(data.lastUpdated.seconds * 1000).toISOString();
      }


      deals.push({
        id: doc.id,
        imageUrl: data.imageUrl || 'https://placehold.co/600x450.png', // Default placeholder
        brand: data.brand || 'N/A',
        model: data.model || 'N/A',
        referenceNumber: data.referenceNumber || 'N/A',
        listingPrice: typeof data.listingPrice === 'number' ? data.listingPrice : 0,
        marketPrice: typeof data.marketPrice === 'number' ? data.marketPrice : 0,
        retailPrice: typeof data.retailPrice === 'number' ? data.retailPrice : undefined,
        estimatedMarginPercent: typeof data.estimatedMarginPercent === 'number' ? data.estimatedMarginPercent : 0,
        aiScore: typeof data.aiScore === 'number' ? data.aiScore : 0,
        dealLabel: data.dealLabel || '👍 OK',
        tags: Array.isArray(data.tags) ? data.tags : [],
        sourceUrl: data.sourceUrl || '#',
        description: data.description || '',
        condition: data.condition,
        demand: data.demand,
        rarity: data.rarity,
        risk: data.risk,
        location: data.location,
        lastUpdated: lastUpdatedString || new Date().toISOString(),
      } as WatchDeal); // Type assertion might be needed depending on strictness
    });
    return deals;
  } catch (error) {
    console.error("Error fetching watch deals from Firestore:", error);
    throw error; // Re-throw the error to be handled by the caller
  }
}
