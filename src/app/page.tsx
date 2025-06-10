
// Remove 'use client' - this is now a Server Component
// import { useState, useEffect } from 'react'; // No longer needed for fetching
import type { WatchDeal } from '@/lib/types';
import { WatchCard } from '@/components/watch-card';
// import { Button } from '@/components/ui/button'; // Removed for now
// import { Input } from '@/components/ui/input'; // Removed for now
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; // Removed for now
// import { Filter, ListRestart, Search, Loader2, AlertTriangle } from 'lucide-react'; // Removed for now
import { getWatchDealsFromFirestore } from '@/lib/firebase/firestore-service';

// The page becomes an async Server Component
export default async function HomePage() {
  // Data is fetched on the server before the page is sent to the client.
  const deals: WatchDeal[] = await getWatchDealsFromFirestore();

  return (
    <div className="space-y-8">
      <section className="text-center py-8 bg-card rounded-lg shadow-md">
        <h1 className="text-4xl font-bold font-headline text-primary mb-2">WatchFinder AI</h1>
        <p className="text-xl text-muted-foreground">
          Trova il vero affare. Ogni giorno. Analisi di mercato e suggerimenti intelligenti.
        </p>
      </section>

      <section className="p-4 sm:p-6 bg-card rounded-lg shadow-md">
        {/* 
          The client-side search, sort, and filter controls have been removed for this SSR implementation.
          We can discuss re-adding them using Server Actions or client components that interact with the server-rendered list.
        */}
        <h2 className="text-2xl font-semibold mb-6 text-center">Live Deals from Firestore</h2>
        
        {deals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {deals.map((deal) => (
              <WatchCard key={deal.id} deal={deal} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-xl text-muted-foreground">
              No deals found in the database at the moment.
            </p>
            <p className="text-sm text-muted-foreground">
              Try running the Python scraper to populate Firestore, or check back later.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
