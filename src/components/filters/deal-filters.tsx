
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FilterIcon, ListRestart } from 'lucide-react';

interface DealFiltersProps {
  initialSortBy?: 'aiScore' | 'listingPrice';
  initialOrder?: 'asc' | 'desc';
  initialBrand?: string;
}

export function DealFilters({ initialSortBy, initialOrder, initialBrand }: DealFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [sortBy, setSortBy] = useState(initialSortBy || 'aiScore');
  const [order, setOrder] = useState(initialOrder || 'desc');
  const [brand, setBrand] = useState(initialBrand || '');

  // Update local state if URL searchParams change (e.g., browser back/forward)
  useEffect(() => {
    setSortBy(searchParams.get('sortBy') as DealFiltersProps['initialSortBy'] || 'aiScore');
    setOrder(searchParams.get('order') as DealFiltersProps['initialOrder'] || 'desc');
    setBrand(searchParams.get('brand') || '');
  }, [searchParams]);

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    if (sortBy) params.set('sortBy', sortBy);
    if (order) params.set('order', order);
    if (brand) params.set('brand', brand.trim());
    
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  const handleResetFilters = () => {
    setSortBy('aiScore');
    setOrder('desc');
    setBrand('');
    router.push('/', { scroll: false });
  };

  return (
    <Card className="mb-6 shadow-md">
      <CardHeader>
        <CardTitle className="text-xl flex items-center"><FilterIcon className="mr-2 h-5 w-5" /> Filters & Sorting</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
        <div className="space-y-1.5">
          <Label htmlFor="brand-filter">Brand</Label>
          <Input
            id="brand-filter"
            placeholder="e.g., Rolex"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
          />
        </div>
        
        <div className="space-y-1.5">
          <Label htmlFor="sort-by">Sort By</Label>
          <Select value={`${sortBy}-${order}`} onValueChange={(value) => {
            const [newSortBy, newOrder] = value.split('-');
            setSortBy(newSortBy as 'aiScore' | 'listingPrice');
            setOrder(newOrder as 'asc' | 'desc');
          }}>
            <SelectTrigger id="sort-by">
              <SelectValue placeholder="Select sorting" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aiScore-desc">AI Score (High to Low)</SelectItem>
              <SelectItem value="aiScore-asc">AI Score (Low to High)</SelectItem>
              <SelectItem value="listingPrice-desc">Price (High to Low)</SelectItem>
              <SelectItem value="listingPrice-asc">Price (Low to High)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleApplyFilters} className="w-full sm:w-auto">
          Apply Filters
        </Button>
        <Button onClick={handleResetFilters} variant="outline" className="w-full sm:w-auto">
          <ListRestart className="mr-2 h-4 w-4" /> Reset
        </Button>
      </CardContent>
    </Card>
  );
}
