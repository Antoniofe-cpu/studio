
import type { WatchDeal } from '@/lib/types';
import { WatchCard } from '@/components/watch-card';
import { getWatchDealsFromFirestore } from '@/lib/firebase/firestore-service';
import { DealFilters } from '@/components/filters/deal-filters'; 

// The page becomes an async Server Component
export default async function HomePage({
  searchParams,
}: {
  searchParams?: {
    sortBy?: 'aiScore' | 'listingPrice';
    order?: 'asc' | 'desc';
    brand?: string;
    // Add other expected searchParams types here
  };
}) {
  // Extract filter/sort parameters from searchParams
  const sortBy = searchParams?.sortBy;
  const order = searchParams?.order;
  const brand = searchParams?.brand;

  // Data is fetched on the server with the applied filters/sorting
  const deals: WatchDeal[] = await getWatchDealsFromFirestore({
    sortBy,
    order,
    brand,
  });

  return (
    <div className="space-y-8">
      <section className="text-center py-8 bg-card rounded-lg shadow-md">
        <h1 className="text-4xl font-bold font-headline text-primary mb-2">WatchFinder AI</h1>
        <p className="text-xl text-muted-foreground">
          Trova il vero affare. Ogni giorno. Analisi di mercato e suggerimenti intelligenti.
        </p>
      </section>

      {/* Filter and Sort UI Component */}
      <DealFilters 
        initialSortBy={sortBy}
        initialOrder={order}
        initialBrand={brand}
      />

      <section className="p-4 sm:p-6 bg-card rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          {brand ? `Live Deals for ${brand}` : 'Live Deals from Firestore'}
          {sortBy && order && ` (Sorted by ${sortBy} ${order})`}
        </h2>
        
        {deals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {deals.map((deal) => (
              <WatchCard key={deal.id} deal={deal} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-xl text-muted-foreground">
              No deals found matching your criteria.
            </p>
            <p className="text-sm text-muted-foreground">
              Please check if data exists in the 'deals' collection in Firestore
              and that your Firestore security rules allow read access.
              Also, check the server console logs for more details.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
