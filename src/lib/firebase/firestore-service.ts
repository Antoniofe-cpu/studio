
import { collection, getDocs, query, orderBy, where, Timestamp, type QueryConstraint } from 'firebase/firestore';
import { db } from './config';
import type { WatchDeal, DealLabel } from '@/lib/types';

const COLLECTION_NAME = 'deals'; 

interface GetWatchDealsParams {
  sortBy?: 'aiScore' | 'listingPrice';
  order?: 'asc' | 'desc';
  brand?: string;
  // Add more filter/sort parameters here as needed
}

export async function getWatchDealsFromFirestore(params?: GetWatchDealsParams): Promise<WatchDeal[]> {
  try {
    const queryConstraints: QueryConstraint[] = [];

    // Filtering
    if (params?.brand) {
      queryConstraints.push(where('brand', '==', params.brand));
    }

    // Sorting
    const sortBy = params?.sortBy || 'aiScore'; // Default sort by aiScore
    const order = params?.order || 'desc';     // Default order desc

    // Firestore requires the first orderBy field to match the field in an inequality filter if one exists.
    // For simple equality filters like 'brand', and a different orderBy field, it's generally fine.
    // If we add range filters (e.g., price range) later, we might need to adjust or add composite indexes.
    queryConstraints.push(orderBy(sortBy, order));
    
    // If sorting by something other than aiScore, and aiScore is not the primary sort,
    // you might want a secondary sort to ensure consistent ordering for items with the same primary sort value.
    // For example, if sorting by price, then by aiScore:
    if (sortBy !== 'aiScore') {
      queryConstraints.push(orderBy('aiScore', 'desc')); // Secondary sort
    }


    console.log(`Fetching data from '${COLLECTION_NAME}' collection with params:`, params);
    const dealsCollectionRef = collection(db, COLLECTION_NAME);
    const q = query(dealsCollectionRef, ...queryConstraints);
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log("No documents found in the collection with the given criteria.");
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
