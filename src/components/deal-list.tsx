
// src/components/deal-list.tsx
'use client'; // <-- FONDAMENTALE: Trasforma questo in un Client Component

import { useState, useMemo } from 'react';
import type { WatchDeal } from '@/lib/types';
import { WatchCard } from '@/components/watch-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { FilterIcon } from 'lucide-react';

// Definiamo i tipi per i nostri filtri
interface Filters {
  brand: string;
  minPrice: number | null;
  maxPrice: number | null;
  sortBy: 'aiScore' | 'listingPrice';
  // Consider adding sortOrder: 'asc' | 'desc' if needed later
}

interface DealListProps {
  initialDeals: WatchDeal[]; // Riceviamo la lista completa di orologi dal server
}

export function DealList({ initialDeals }: DealListProps) {
  const [filters, setFilters] = useState<Filters>({
    brand: 'All', // Default to 'All'
    minPrice: null,
    maxPrice: null,
    sortBy: 'aiScore',
  });

  // Estraiamo la lista di tutti i brand unici per popolare il filtro
  const availableBrands = useMemo(() => {
    const brands = new Set(initialDeals.map(deal => deal.brand).filter(Boolean)); // filter(Boolean) to remove undefined/null brands
    return ['All', ...Array.from(brands).sort()];
  }, [initialDeals]);
  
  // Questa è la logica di filtraggio e ordinamento
  const filteredAndSortedDeals = useMemo(() => {
    let deals = [...initialDeals];

    // 1. Applica i filtri
    deals = deals.filter(deal => {
      const brandMatch = filters.brand === 'All' || deal.brand === filters.brand;
      const minPriceMatch = filters.minPrice === null || (deal.listingPrice >= filters.minPrice);
      const maxPriceMatch = filters.maxPrice === null || (deal.listingPrice <= filters.maxPrice);
      return brandMatch && minPriceMatch && maxPriceMatch;
    });

    // 2. Applica l'ordinamento
    deals.sort((a, b) => {
      if (filters.sortBy === 'aiScore') {
        return (b.aiScore || 0) - (a.aiScore || 0); // Decrescente (High to Low)
      }
      if (filters.sortBy === 'listingPrice') {
        return (a.listingPrice || 0) - (b.listingPrice || 0); // Crescente (Low to High)
      }
      return 0;
    });

    return deals;
  }, [initialDeals, filters]);

  // Funzione per aggiornare un singolo filtro per Select
  const handleSelectFilterChange = (key: 'brand' | 'sortBy', value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Funzione per aggiornare i filtri di prezzo
  const handlePriceChange = (key: 'minPrice' | 'maxPrice', value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    if (value === '' || (numValue !== null && !isNaN(numValue) && numValue >= 0)) {
      setFilters(prev => ({ ...prev, [key]: numValue }));
    } else if (value !== '' && (numValue === null || isNaN(numValue))) {
      // If input is not empty and not a valid number, don't update, or clear if invalid
      // For now, we just prevent non-numeric/negative updates unless it's an empty string
    }
  };


  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><FilterIcon className="mr-2 h-5 w-5" /> Filters & Sorting</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Filtro per Brand */}
          <div className="space-y-1.5">
            <Label htmlFor="brand-filter">Brand</Label>
            <Select
              value={filters.brand}
              onValueChange={(value) => handleSelectFilterChange('brand', value)}
            >
              <SelectTrigger id="brand-filter">
                <SelectValue placeholder="Select brand" />
              </SelectTrigger>
              <SelectContent>
                {availableBrands.map(brand => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filtro per Min Price */}
          <div className="space-y-1.5">
            <Label htmlFor="min-price-filter">Min Price (€)</Label>
            <Input
              id="min-price-filter"
              type="number"
              placeholder="e.g., 500"
              value={filters.minPrice === null ? '' : filters.minPrice}
              onChange={(e) => handlePriceChange('minPrice', e.target.value)}
              min="0"
            />
          </div>

          {/* Filtro per Max Price */}
          <div className="space-y-1.5">
            <Label htmlFor="max-price-filter">Max Price (€)</Label>
            <Input
              id="max-price-filter"
              type="number"
              placeholder="e.g., 5000"
              value={filters.maxPrice === null ? '' : filters.maxPrice}
              onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
              min="0"
            />
          </div>
          
          {/* Filtro per Ordinamento */}
          <div className="space-y-1.5">
            <Label htmlFor="sort-filter">Sort By</Label>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => handleSelectFilterChange('sortBy', value as Filters['sortBy'])}
            >
              <SelectTrigger id="sort-filter">
                <SelectValue placeholder="Select sorting" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aiScore">AI Score (High to Low)</SelectItem>
                <SelectItem value="listingPrice">Price (Low to High)</SelectItem>
                {/* We can add more options here, like Price (High to Low) by extending the sortBy logic */}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* --- GRIGLIA DEGLI AFFARI FILTRATI --- */}
      {filteredAndSortedDeals.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedDeals.map((deal) => (
            <WatchCard key={deal.id} deal={deal} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-card p-6 rounded-lg shadow-md">
            <p className="text-xl text-muted-foreground">
              No deals match your current filters.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Try adjusting your filter criteria or check back later for new deals.
            </p>
          </div>
      )}
    </div>
  );
}
