
import { getWatchDealsFromAllSources } from "@/lib/firebase/firestore-service"; // Updated import
import { DealList } from "@/components/deal-list";
import type { WatchDeal } from '@/lib/types';

export default async function HomePage() {
  // 1. Recupera TUTTI gli affari da tutte le fonti configurate sul server
  const allDeals: WatchDeal[] = await getWatchDealsFromAllSources(); // Updated function call

  return (
    <div className="space-y-8">
      <section className="text-center py-8 bg-card rounded-lg shadow-md">
        <h1 className="text-4xl font-bold font-headline text-primary mb-2">WatchFinder AI</h1>
        <p className="text-xl text-muted-foreground">
          Trova il vero affare. Ogni giorno. Analisi di mercato e suggerimenti intelligenti.
        </p>
      </section>
      
      <DealList initialDeals={allDeals} />

    </div>
  );
}
