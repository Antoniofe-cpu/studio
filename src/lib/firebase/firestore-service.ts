
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from './config';
import type { WatchDeal, DealLabel } from '@/lib/types';

const COLLECTION_NAME = 'deals'; 

export async function getWatchDealsFromFirestore(): Promise<WatchDeal[]> {
  try {
    console.log(`Fetching data from '${COLLECTION_NAME}' collection, ordering by aiScore desc...`);
    const dealsCollectionRef = collection(db, COLLECTION_NAME);
    const q = query(dealsCollectionRef, orderBy('aiScore', 'desc'));
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log("No documents found in the collection.");
      return [];
    }

    const deals: WatchDeal[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      
      let lastUpdatedString: string;
      if (data.lastUpdated instanceof Timestamp) {
        lastUpdatedString = data.lastUpdated.toDate().toISOString();
      } else if (typeof data.lastUpdated === 'string') {
        lastUpdatedString = data.lastUpdated;
      } else if (typeof data.lastUpdated === 'object' && data.lastUpdated?.seconds) {
        lastUpdatedString = new Date(data.lastUpdated.seconds * 1000).toISOString();
      } else {
        lastUpdatedString = new Date().toISOString();
      }

      const deal: WatchDeal = {
        id: doc.id,
        imageUrl: data.imageUrl || 'https://placehold.co/600x450.png', // Default placeholder
        brand: data.brand || 'Unknown Brand',
        model: data.model || 'Unknown Model',
        referenceNumber: data.referenceNumber || 'N/A',
        listingPrice: typeof data.listingPrice === 'number' ? data.listingPrice : 0,
        marketPrice: typeof data.marketPrice === 'number' ? data.marketPrice : 0,
        retailPrice: typeof data.retailPrice === 'number' ? data.retailPrice : undefined,
        estimatedMarginPercent: typeof data.estimatedMarginPercent === 'number' ? data.estimatedMarginPercent : 0,
        aiScore: typeof data.aiScore === 'number' ? data.aiScore : 0,
        dealLabel: (data.dealLabel as DealLabel) || '👍 OK', // Ensure it's a valid DealLabel
        tags: Array.isArray(data.tags) ? data.tags : [],
        sourceUrl: data.sourceUrl || '#',
        description: data.description || '',
        condition: data.condition || undefined,
        demand: data.demand,
        rarity: data.rarity,
        risk: data.risk,
        location: data.location,
        lastUpdated: lastUpdatedString,
      };
      // Validate dealLabel
      const validDealLabels: DealLabel[] = ['🔥 Affare', '👍 OK', '❌ Fuori Prezzo'];
      if (!validDealLabels.includes(deal.dealLabel)) {
        deal.dealLabel = '👍 OK'; // Default to a valid label if fetched one is invalid
      }
      return deal;
    });

    console.log(`Successfully fetched and mapped ${deals.length} deals.`);
    return deals;
  } catch (error) {
    console.error("Error fetching watch deals from Firestore:", error);
    // In a production app, you might want to throw the error or handle it more gracefully
    return []; // Return an empty array or throw error
  }
}
