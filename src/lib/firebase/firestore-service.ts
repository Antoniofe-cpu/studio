
import { collection, getDocs, query, Timestamp, type QueryConstraint, orderBy, doc, getDoc } from 'firebase/firestore'; 
import { db } from './config';
import type { WatchDeal, DealLabel } from '@/lib/types';

const DEALS_COLLECTION_NAME = 'deals'; 
const MULTI_SOURCE_DEALS_COLLECTION_NAME = 'deals_multi_source';

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
    // Fallback if lastUpdated is missing or in an unexpected format
    lastUpdatedString = new Date(0).toISOString(); // Use epoch as a fallback
    // console.warn(`Document ${docSnap.id} has missing or invalid lastUpdated. Using epoch as fallback.`);
  }

  const primaryImageUrl = data.imageUrl || null;
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
    tags: Array.isArray(data.tags) ? data.tags.filter((tag: any) => typeof tag === 'string') : [],
  };

  return deal;
}

async function fetchDealsFromCollection(collectionName: string): Promise<WatchDeal[]> {
  try {
    const dealsCollectionRef = collection(db, collectionName);
    // Add orderBy lastUpdated, desc by default for individual collection fetches
    const q = query(dealsCollectionRef, orderBy("lastUpdated", "desc"));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log(`No documents found in the '${collectionName}' collection.`);
      return [];
    }

    const deals = querySnapshot.docs.map((doc) => mapDocToWatchDeal({ id: doc.id, data: () => doc.data() }));
    console.log(`Successfully fetched and mapped ${deals.length} deals from '${collectionName}'.`);
    return deals;
  } catch (error) {
    console.error(`Error fetching watch deals from Firestore collection '${collectionName}':`, error);
    return [];
  }
}

export async function getWatchDealsFromAllSources(): Promise<WatchDeal[]> {
  try {
    console.log("Fetching deals from all configured sources...");
    const dealsFromDefault = await fetchDealsFromCollection(DEALS_COLLECTION_NAME);
    const dealsFromMultiSource = await fetchDealsFromCollection(MULTI_SOURCE_DEALS_COLLECTION_NAME);

    const allDealsMap = new Map<string, WatchDeal>();

    // Add deals from the default collection first
    dealsFromDefault.forEach(deal => {
      allDealsMap.set(deal.id, deal);
    });

    // Add or overwrite with deals from the multi-source collection
    // This gives precedence to deals_multi_source if IDs are the same
    dealsFromMultiSource.forEach(deal => {
      allDealsMap.set(deal.id, deal);
    });

    const combinedDeals = Array.from(allDealsMap.values());

    // Sort the combined list by lastUpdated in descending order
    combinedDeals.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    
    console.log(`Successfully fetched and combined ${combinedDeals.length} deals from all sources.`);
    return combinedDeals;
  } catch (error) {
    console.error("Error fetching watch deals from all sources:", error);
    return [];
  }
}


export async function getWatchDealById(id: string): Promise<WatchDeal | null> {
  try {
    console.log(`Fetching single deal with ID: ${id} from all sources.`);
    
    // Try fetching from multi-source collection first
    let docRef = doc(db, MULTI_SOURCE_DEALS_COLLECTION_NAME, id);
    let docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log(`Deal ${id} found in '${MULTI_SOURCE_DEALS_COLLECTION_NAME}'.`);
      return mapDocToWatchDeal({ id: docSnap.id, data: () => docSnap.data() });
    }

    // If not found, try fetching from the default deals collection
    console.log(`Deal ${id} not in '${MULTI_SOURCE_DEALS_COLLECTION_NAME}', checking '${DEALS_COLLECTION_NAME}'.`);
    docRef = doc(db, DEALS_COLLECTION_NAME, id);
    docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log(`Deal ${id} found in '${DEALS_COLLECTION_NAME}'.`);
      return mapDocToWatchDeal({ id: docSnap.id, data: () => docSnap.data() });
    }
    
    console.log(`No such document with ID: ${id} in any configured collection.`);
    return null;
  } catch (error) {
    console.error(`Error fetching single watch deal with ID ${id} from all sources:`, error);
    return null;
  }
}

// Kept the original function for fetching from a single source if needed elsewhere,
// though the main page will use getWatchDealsFromAllSources.
export async function getWatchDealsFromFirestore(): Promise<WatchDeal[]> {
  return fetchDealsFromCollection(DEALS_COLLECTION_NAME);
}
