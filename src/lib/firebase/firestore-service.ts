
import { collection, getDocs, query, Timestamp, type QueryConstraint, orderBy, doc, getDoc } from 'firebase/firestore'; // Aggiungi 'doc' e 'getDoc'
import { db } from './config';
import type { WatchDeal, DealLabel } from '@/lib/types';

const COLLECTION_NAME = 'deals'; 

export async function getWatchDealsFromFirestore(): Promise<WatchDeal[]> {
  try {
    const queryConstraints: QueryConstraint[] = [];
    
    console.log(`Fetching all data from '${COLLECTION_NAME}' collection.`);
    const dealsCollectionRef = collection(db, COLLECTION_NAME);
    const q = query(dealsCollectionRef, ...queryConstraints); 
    
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
        demand: data.demand || undefined,
        rarity: data.rarity || undefined,
        risk: data.risk || undefined,
        location: data.location || undefined,
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

// NUOVA FUNZIONE
export async function getWatchDealById(id: string): Promise<WatchDeal | null> {
  try {
    console.log(`Fetching single deal with ID: ${id}`);
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.log(`No such document with ID: ${id}`);
      return null;
    }

    const data = docSnap.data();
    
    let lastUpdatedString: string;
    if (data.lastUpdated instanceof Timestamp) {
      lastUpdatedString = data.lastUpdated.toDate().toISOString();
    } else if (typeof data.lastUpdated === 'string') {
      lastUpdatedString = data.lastUpdated;
    } else if (typeof data.lastUpdated === 'object' && data.lastUpdated?.seconds) {
      // Handling Firestore timestamp object structure if it's not an instance of Timestamp (e.g., after JSON serialization/deserialization)
      lastUpdatedString = new Date(data.lastUpdated.seconds * 1000 + (data.lastUpdated.nanoseconds || 0) / 1000000).toISOString();
    } else {
      lastUpdatedString = new Date().toISOString(); // Fallback
    }

    const deal: WatchDeal = {
      id: docSnap.id,
      imageUrl: data.imageUrl || 'https://placehold.co/600x450.png', // Fallback image
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
      description: data.description || 'No description provided.',
      condition: data.condition || undefined,
      demand: data.demand || undefined,
      rarity: data.rarity || undefined,
      risk: data.risk || undefined,
      location: data.location || undefined,
      lastUpdated: lastUpdatedString,
    };

    const validDealLabels: DealLabel[] = ['🔥 Affare', '👍 OK', '❌ Fuori Prezzo'];
    if (!validDealLabels.includes(deal.dealLabel)) {
      deal.dealLabel = '👍 OK'; // Default if invalid
    }
    
    console.log(`Successfully fetched and mapped deal: ${deal.id}`);
    return deal;
  } catch (error) {
    console.error(`Error fetching single watch deal with ID ${id}:`, error);
    return null;
  }
}
