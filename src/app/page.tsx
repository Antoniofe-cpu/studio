import { getWatchDealsFromFirestore } from "@/lib/firebase/firestore-service";
import { DealList } from "@/components/deal-list"; // Importa il nostro nuovo componente
import type { WatchDeal } from '@/lib/types';

// La pagina rimane un Server Component asincrono e veloce
export default async function HomePage() {
  // 1. Recupera TUTTI gli affari sul server
  const allDeals: WatchDeal[] = await getWatchDealsFromFirestore();

  return (
    <div className="space-y-8">
      <section className="text-center py-8 bg-card rounded-lg shadow-md">
        <h1 className="text-4xl font-bold font-headline text-primary mb-2">WatchFinder AI</h1>
        <p className="text-xl text-muted-foreground">
          Trova il vero affare. Ogni giorno. Analisi di mercato e suggerimenti intelligenti.
        </p>
      </section>
      
      {/* 2. Passa i dati al componente client che gestirà l'interattività */}
      <DealList initialDeals={allDeals} />

    </div>
  );
}
