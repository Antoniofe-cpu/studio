
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
    lastUpdatedString = new Date(0).toISOString();
  }

  let finalImageUrls: string[] = [];
  let finalPrimaryImageUrl: string | null = null;

  // Helper function to robustly clean URLs by repeatedly replacing &amp; with &
  const cleanUrl = (url: string | null | undefined): string | null => {
    if (!url || typeof url !== 'string') return null;
    let cleaned = url.trim();
    // Loop to catch multiple encodings like &amp;amp; -> &amp; -> &
    while (cleaned.includes('&amp;')) {
      cleaned = cleaned.replace(/&amp;/g, '&');
    }
    return cleaned;
  };

  // Prioritize imageUrls array
  if (Array.isArray(data.imageUrls) && data.imageUrls.length > 0) {
    finalImageUrls = data.imageUrls
      .map(cleanUrl) // Clean each URL in the array
      .filter((url: any): url is string => url !== null && url.trim() !== '');
  }

  // If imageUrls is empty or not an array, try the singular imageUrl
  if (finalImageUrls.length === 0) {
    const cleanedSingularUrl = cleanUrl(data.imageUrl);
    if (cleanedSingularUrl) {
      finalImageUrls = [cleanedSingularUrl];
    }
  }

  // Set the primary image URL from the (now cleaned) finalImageUrls
  if (finalImageUrls.length > 0) {
    finalPrimaryImageUrl = finalImageUrls[0];
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

    imageUrl: finalPrimaryImageUrl, // This now uses the robustly cleaned URL
    imageUrls: finalImageUrls,     // This is now an array of robustly cleaned URLs

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

    dealsFromDefault.forEach(deal => {
      allDealsMap.set(deal.id, deal);
    });

    dealsFromMultiSource.forEach(deal => {
      allDealsMap.set(deal.id, deal); // This will overwrite if ID exists in default, giving priority to multi_source
    });

    const combinedDeals = Array.from(allDealsMap.values());

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

    let docRef = doc(db, MULTI_SOURCE_DEALS_COLLECTION_NAME, id);
    let docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log(`Deal ${id} found in '${MULTI_SOURCE_DEALS_COLLECTION_NAME}'.`);
      return mapDocToWatchDeal({ id: docSnap.id, data: () => docSnap.data() });
    }

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

export async function getWatchDealsFromFirestore(): Promise<WatchDeal[]> {
  return fetchDealsFromCollection(DEALS_COLLECTION_NAME);
}
