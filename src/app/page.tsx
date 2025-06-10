
'use client';

import { useState, useEffect } from 'react';
import type { WatchDeal } from '@/lib/types';
import { WatchCard } from '@/components/watch-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, ListRestart, Search, Loader2, AlertTriangle } from 'lucide-react';
import { getWatchDealsFromFirestore } from '@/lib/firebase/firestore-service'; // Import the new service

export default function HomePage() {
  const [allDeals, setAllDeals] = useState<WatchDeal[]>([]);
  const [filteredDeals, setFilteredDeals] = useState<WatchDeal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('aiScore');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeals = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const deals = await getWatchDealsFromFirestore();
        setAllDeals(deals);
        setFilteredDeals(deals); // Initially, filtered deals are all deals
      } catch (err) {
        console.error("Failed to fetch deals:", err);
        setError("Impossibile caricare gli affari. Riprova più tardi.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDeals();
  }, []);

  useEffect(() => {
    let currentDeals = [...allDeals];

    // Filtering
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      currentDeals = currentDeals.filter(deal =>
        deal.brand.toLowerCase().includes(term) ||
        deal.model.toLowerCase().includes(term) ||
        deal.referenceNumber.toLowerCase().includes(term)
      );
    }

    // Sorting
    switch (sortBy) {
      case 'aiScore':
        currentDeals.sort((a, b) => b.aiScore - a.aiScore);
        break;
      case 'margin':
        currentDeals.sort((a, b) => b.estimatedMarginPercent - a.estimatedMarginPercent);
        break;
      case 'date':
        currentDeals.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
        break;
      case 'priceAsc':
        currentDeals.sort((a, b) => a.listingPrice - b.listingPrice);
        break;
      case 'priceDesc':
        currentDeals.sort((a, b) => b.listingPrice - a.listingPrice);
        break;
      default:
        break;
    }
    setFilteredDeals(currentDeals);
  }, [searchTerm, sortBy, allDeals]);

  const resetFilters = () => {
    setSearchTerm('');
    setSortBy('aiScore');
    setFilteredDeals(allDeals);
  };

  return (
    <div className="space-y-8">
      <section className="text-center py-8 bg-card rounded-lg shadow-md">
        <h1 className="text-4xl font-bold font-headline text-primary mb-2">WatchFinder AI</h1>
        <p className="text-xl text-muted-foreground">
          Trova il vero affare. Ogni giorno. Analisi di mercato e suggerimenti intelligenti.
        </p>
      </section>

      <section className="p-4 sm:p-6 bg-card rounded-lg shadow-md">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
          <div className="relative w-full sm:max-w-xs">
            <Input 
              type="search" 
              placeholder="Search by brand, model, ref..." 
              className="pl-10" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aiScore">Sort by AI Score</SelectItem>
                <SelectItem value="margin">Sort by Margin</SelectItem>
                <SelectItem value="date">Sort by Date</SelectItem>
                <SelectItem value="priceAsc">Price: Low to High</SelectItem>
                <SelectItem value="priceDesc">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" disabled> {/* Filter button can be enabled later */}
              <Filter className="mr-2 h-4 w-4" /> Filters 
            </Button>
             <Button variant="ghost" size="icon" onClick={resetFilters}>
              <ListRestart className="h-5 w-5" />
              <span className="sr-only">Reset Filters</span>
            </Button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p>Caricamento degli affari...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-10 text-destructive">
            <AlertTriangle className="h-12 w-12 mb-4" />
            <p className="text-lg font-semibold">Errore nel caricamento</p>
            <p>{error}</p>
          </div>
        ) : filteredDeals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDeals.map((deal) => (
              <WatchCard key={deal.id} deal={deal} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            {searchTerm ? (
              <p className="text-xl text-muted-foreground">
                Nessun risultato per &quot;{searchTerm}&quot;. Prova con un termine diverso.
              </p>
            ) : (
               <p className="text-xl text-muted-foreground">
                Nessun affare trovato per oggi. Torna più tardi o prova a cercare!
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
