
import { collection, getDocs, query, Timestamp, type QueryConstraint, orderBy } from 'firebase/firestore';
import { db } from './config';
import type { WatchDeal, DealLabel } from '@/lib/types';

const COLLECTION_NAME = 'deals'; 

// Interface for parameters is no longer needed as we fetch all deals
// interface GetWatchDealsParams {
//   sortBy?: 'aiScore' | 'listingPrice';
//   order?: 'asc' | 'desc';
//   brand?: string;
// }

export async function getWatchDealsFromFirestore(): Promise<WatchDeal[]> {
  try {
    const queryConstraints: QueryConstraint[] = [];

    // Optionally, you can still apply a default sort on the server if desired,
    // for example, to ensure a consistent initial order before client-side interaction.
    // queryConstraints.push(orderBy('aiScore', 'desc')); 
    // For now, let's fetch without specific server-side order if client handles all.

    console.log(`Fetching all data from '${COLLECTION_NAME}' collection.`);
    const dealsCollectionRef = collection(db, COLLECTION_NAME);
    const q = query(dealsCollectionRef, ...queryConstraints); // Pass constraints if any default sort is kept
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log("No documents found in the 'deals' collection.");
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
        imageUrl: data.imageUrl || 'https://placehold.co/600x450.png',
        brand: data.brand || 'Unknown Brand',
        model: data.model || 'Unknown Model',
        referenceNumber: data.referenceNumber || 'N/A',
        listingPrice: typeof data.listingPrice === 'number' ? data.listingPrice : 0,
        marketPrice: typeof data.marketPrice === 'number' ? data.marketPrice : 0,
        retailPrice: typeof data.retailPrice === 'number' ? data.retailPrice : undefined,
        estimatedMarginPercent: typeof data.estimatedMarginPercent === 'number' ? data.estimatedMarginPercent : 0,
        aiScore: typeof data.aiScore === 'number' ? data.aiScore : 0,
        dealLabel: (data.dealLabel as DealLabel) || '👍 OK',
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
      const validDealLabels: DealLabel[] = ['🔥 Affare', '👍 OK', '❌ Fuori Prezzo'];
      if (!validDealLabels.includes(deal.dealLabel)) {
        deal.dealLabel = '👍 OK';
      }
      return deal;
    });

    console.log(`Successfully fetched and mapped ${deals.length} deals.`);
    return deals;
  } catch (error) {
    console.error("Error fetching watch deals from Firestore:", error);
    return [];
  }
}

