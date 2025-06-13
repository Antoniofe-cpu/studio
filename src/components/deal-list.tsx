
// src/components/deal-list.tsx
'use client'; 

import { useState, useMemo } from 'react';
import type { WatchDeal } from '@/lib/types';
import { WatchCard } from '@/components/watch-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { FilterIcon } from 'lucide-react';


interface Filters {
  brand: string;
  minPrice: number | null;
  maxPrice: number | null;
  sortBy: 'aiScore' | 'listingPriceEUR';
}

interface DealListProps {
  initialDeals: WatchDeal[]; 
}

export function DealList({ initialDeals }: DealListProps) {
  const [filters, setFilters] = useState<Filters>({
    brand: 'All', 
    minPrice: null,
    maxPrice: null,
    sortBy: 'aiScore',
  });

  const availableBrands = useMemo(() => {
    const brands = new Set(initialDeals.map(deal => deal.brand).filter((brand): brand is string => brand !== null));
    return ['All', ...Array.from(brands).sort()];
  }, [initialDeals]);
  
  const filteredAndSortedDeals = useMemo(() => {
    let deals = [...initialDeals];

    deals = deals.filter(deal => {
      const brandMatch = filters.brand === 'All' || deal.brand === filters.brand;
      const minPriceMatch = filters.minPrice === null || (deal.listingPriceEUR !== null && deal.listingPriceEUR >= filters.minPrice);
      const maxPriceMatch = filters.maxPrice === null || (deal.listingPriceEUR !== null && deal.listingPriceEUR <= filters.maxPrice);
      return brandMatch && minPriceMatch && maxPriceMatch;
    });

    deals.sort((a, b) => {
      if (filters.sortBy === 'aiScore') {
        return (b.aiScore || 0) - (a.aiScore || 0); 
      }
      if (filters.sortBy === 'listingPriceEUR') {
        return (a.listingPriceEUR || 0) - (b.listingPriceEUR || 0); 
      }
      return 0;
    });

    return deals;
  }, [initialDeals, filters]);

  const handleSelectFilterChange = (key: 'brand' | 'sortBy', value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePriceChange = (key: 'minPrice' | 'maxPrice', value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    if (value === '' || (numValue !== null && !isNaN(numValue) && numValue >= 0)) {
      setFilters(prev => ({ ...prev, [key]: numValue }));
    } else if (value !== '' && (numValue === null || isNaN(numValue))) {
      // If input is not empty and not a valid number, don't update, or clear if invalid
    }
  };


  return (
    <div className="space-y-6">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><FilterIcon className="mr-2 h-5 w-5" /> Filters & Sorting</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
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
                <SelectItem value="listingPriceEUR">Price (Low to High)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

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

