
import { collection, getDocs, query, Timestamp, type QueryConstraint, orderBy, doc, getDoc } from 'firebase/firestore'; 
import { db } from './config';
import type { WatchDeal, DealLabel } from '@/lib/types';

const COLLECTION_NAME = 'deals'; 

function mapDocToWatchDeal(docSnap: { id: string; data: () => any }): WatchDeal {
  const data = docSnap.data();
  
  let lastUpdatedString: string;
  if (data.lastUpdated instanceof Timestamp) {
    lastUpdatedString = data.lastUpdated.toDate().toISOString();
  } else if (typeof data.lastUpdated === 'string') {
    lastUpdatedString = data.lastUpdated;
  } else if (typeof data.lastUpdated === 'object' && data.lastUpdated?.seconds) {
    lastUpdatedString = new Date(data.lastUpdated.seconds * 1000 + (data.lastUpdated.nanoseconds || 0) / 1000000).toISOString();
  } else {
    lastUpdatedString = new Date().toISOString();
  }

  const primaryImageUrl = data.imageUrl || null; // Allow null if not present
  let galleryImageUrls: string[] = [];
  if (Array.isArray(data.imageUrls) && data.imageUrls.length > 0) {
    galleryImageUrls = data.imageUrls.filter((url: any) => typeof url === 'string');
  } else if (primaryImageUrl) {
    galleryImageUrls = [primaryImageUrl];
  }
  
  if (primaryImageUrl && galleryImageUrls[0] !== primaryImageUrl) {
     if (galleryImageUrls.includes(primaryImageUrl)) {
        galleryImageUrls = [primaryImageUrl, ...galleryImageUrls.filter(url => url !== primaryImageUrl)];
     } else {
        galleryImageUrls = [primaryImageUrl, ...galleryImageUrls];
     }
  }
  
  const validDealLabels: DealLabel[] = ['🔥 Affare', '👍 OK', '❌ Fuori Prezzo'];
  let currentDealLabel: WatchDeal['dealLabel'] = data.dealLabel || null;
  if (currentDealLabel && !validDealLabels.includes(currentDealLabel as DealLabel)) {
    currentDealLabel = '👍 OK'; 
  }


  const deal: WatchDeal = {
    id: docSnap.id,
    title: data.title || `${data.brand || 'Watch'} ${data.model || ''}`.trim(),
    brand: data.brand || null,
    model: data.model || null,
    referenceNumber: data.referenceNumber || null,
    
    listingPriceEUR: typeof data.listingPriceEUR === 'number' ? data.listingPriceEUR : (typeof data.listingPrice === 'number' ? data.listingPrice : null),
    marketPriceEUR: typeof data.marketPriceEUR === 'number' ? data.marketPriceEUR : (typeof data.marketPrice === 'number' ? data.marketPrice : null),
    retailPriceEUR: typeof data.retailPriceEUR === 'number' ? data.retailPriceEUR : (typeof data.retailPrice === 'number' ? data.retailPrice : null),

    originalListingPrice: typeof data.originalListingPrice === 'number' ? data.originalListingPrice : null,
    originalCurrency: data.originalCurrency || null,

    estimatedMarginPercent: typeof data.estimatedMarginPercent === 'number' ? data.estimatedMarginPercent : null,
    aiScore: typeof data.aiScore === 'number' ? data.aiScore : null,
    dealLabel: currentDealLabel,
    
    imageUrl: primaryImageUrl,
    imageUrls: galleryImageUrls,
    
    sourceUrl: data.sourceUrl || '#',
    description: data.description || undefined,
    condition: data.condition || undefined,
    demand: data.demand || undefined,
    rarity: data.rarity || undefined,
    risk: data.risk || undefined,
    location: data.location || undefined,
    lastUpdated: lastUpdatedString,
  };

  return deal;
}


export async function getWatchDealsFromFirestore(): Promise<WatchDeal[]> {
  try {
    const queryConstraints: QueryConstraint[] = [];
    
    console.log(`Fetching all data from '${COLLECTION_NAME}' collection.`);
    const dealsCollectionRef = collection(db, COLLECTION_NAME);
    const q = query(dealsCollectionRef, ...queryConstraints, orderBy("lastUpdated", "desc")); 
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log("No documents found in the 'deals' collection.");
      return [];
    }

    const deals: WatchDeal[] = querySnapshot.docs.map((doc) => mapDocToWatchDeal({ id: doc.id, data: () => doc.data() }));

    console.log(`Successfully fetched and mapped ${deals.length} deals.`);
    return deals;
  } catch (error) {
    console.error("Error fetching watch deals from Firestore:", error);
    return [];
  }
}

export async function getWatchDealById(id: string): Promise<WatchDeal | null> {
  try {
    console.log(`Fetching single deal with ID: ${id}`);
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.log(`No such document with ID: ${id}`);
      return null;
    }
    
    const deal = mapDocToWatchDeal({ id: docSnap.id, data: () => docSnap.data() });
    
    console.log(`Successfully fetched and mapped deal: ${deal.id}`);
    return deal;
  } catch (error) {
    console.error(`Error fetching single watch deal with ID ${id}:`, error);
    return null;
  }
}

