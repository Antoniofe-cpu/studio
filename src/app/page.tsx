// Contenuto per: src/app/page.tsx

import { db } from '@/lib/firebase'; // Importiamo la nostra connessione a Firebase
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import Link from 'next/link';

// Definiamo un tipo per i nostri dati, per avere autocompletamento e sicurezza
interface Deal {
  id: string;
  title: string;
  brand: string;
  model: string;
  listingPrice: number;
  marketPrice?: number;
  retailPrice?: number;
  estimatedMargin?: number;
  imageUrl?: string;
  sourceUrl: string;
}

// Funzione asincrona per caricare i dati da Firebase
async function getDeals(): Promise<Deal[]> {
  try {
    const dealsRef = collection(db, "deals_final"); // <-- USA IL NOME DELLA TUA COLLEZIONE FINALE
    // Ordiniamo per data di aggiornamento (i più recenti prima) e ne prendiamo 50
    const q = query(dealsRef, orderBy("lastUpdated", "desc"), limit(50));
    const querySnapshot = await getDocs(q);

    const deals: Deal[] = [];
    querySnapshot.forEach((doc) => {
      // Usiamo un cast di tipo per dire a TypeScript come sono fatti i dati
      deals.push(doc.data() as Deal);
    });

    console.log(`Caricati ${deals.length} annunci da Firebase.`);
    return deals;
  } catch (error) {
    console.error("Errore nel caricare i dati da Firebase:", error);
    return []; // Restituisci un array vuoto in caso di errore
  }
}


// Questa è la nostra pagina principale
export default async function HomePage() {
  // Next.js eseguirà questa funzione sul server per caricare i dati
  const deals = await getDeals();

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8 text-center">WatchFinder AI - Ultime Offerte</h1>
      
      {/* Mostra un messaggio se non ci sono annunci */}
      {deals.length === 0 && (
        <p className="text-center text-gray-500">
          Nessuna offerta trovata. Esegui lo script Python (`python orchestrator.py`) per popolare il database.
        </p>
      )}

      {/* Creiamo una griglia per mostrare le card degli annunci */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {deals.map((deal) => (
          // Usiamo il 'Link' di Next.js per rendere ogni card cliccabile
          <Link href={deal.sourceUrl} key={deal.id} target="_blank" rel="noopener noreferrer" className="block border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gray-800 text-white">
            <div className="relative">
              {/* Immagine dell'orologio */}
              <img 
                src={deal.imageUrl || 'https://placehold.co/600x400/2d3748/e2e8f0?text=No+Image'} 
                alt={deal.title}
                className="w-full h-48 object-cover"
              />
            </div>
            <div className="p-4">
              {/* Marca */}
              <p className="text-sm text-gray-400">{deal.brand || 'N/A'}</p>
              {/* Titolo */}
              <h2 className="text-lg font-semibold truncate" title={deal.title}>
                {deal.title}
              </h2>
              {/* Prezzo */}
              <div className="mt-4">
                <p className="text-2xl font-bold text-teal-400">
                  €{deal.listingPrice.toLocaleString('it-IT')}
                </p>
                {/* Mostriamo il prezzo di mercato solo se esiste */}
                {deal.marketPrice && (
                  <p className="text-sm text-gray-500">
                    Valore di mercato stimato: €{deal.marketPrice.toLocaleString('it-IT')}
                  </p>
                )}
              </div>
              {/* Margine stimato */}
              {deal.estimatedMargin && (
                 <p className={`mt-2 font-semibold ${deal.estimatedMargin > 0 ? 'text-green-400' : 'text-red-400'}`}>
                   Margine stimato: {deal.estimatedMargin > 0 ? '+' : ''}{deal.estimatedMargin}%
                 </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}