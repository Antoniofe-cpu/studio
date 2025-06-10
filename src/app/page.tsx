
'use client';

import { useState } from 'react';
import type { WatchDeal } from '@/lib/types';
import { WatchCard } from '@/components/watch-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, ListRestart, Search } from 'lucide-react';

// Mock data - in a real app, this would come from an API or database
const mockDeals: WatchDeal[] = [
  {
    id: '1',
    imageUrl: 'https://placehold.co/600x450.png?a=1',
    brand: 'Rolex',
    model: 'Submariner Date',
    referenceNumber: '126610LN',
    listingPrice: 13500,
    marketPrice: 14000,
    retailPrice: 9550,
    estimatedMarginPercent: 15.5, // Assuming calculated (Listing - Cost) / Cost
    aiScore: 88,
    dealLabel: '🔥 Affare',
    tags: ['#Popular', '#InvestmentGrade'],
    sourceUrl: '#',
    description: 'Mint condition, full set.',
    condition: 'Mint',
    demand: 'High',
    rarity: 'Uncommon',
    risk: 'Low',
    lastUpdated: '2024-07-28T10:00:00Z',
  },
  {
    id: '2',
    imageUrl: 'https://placehold.co/600x450.png?a=2',
    brand: 'Omega',
    model: 'Speedmaster Professional',
    referenceNumber: '310.30.42.50.01.001',
    listingPrice: 6800,
    marketPrice: 6500,
    retailPrice: 7200,
    estimatedMarginPercent: 8.2,
    aiScore: 75,
    dealLabel: '👍 OK',
    tags: ['#Iconic', '#Chronograph'],
    sourceUrl: '#',
    lastUpdated: '2024-07-28T09:30:00Z',
  },
  {
    id: '3',
    imageUrl: 'https://placehold.co/600x450.png?a=3',
    brand: 'Patek Philippe',
    model: 'Nautilus',
    referenceNumber: '5711/1A-010',
    listingPrice: 120000,
    marketPrice: 110000,
    retailPrice: 30000, // Example
    estimatedMarginPercent: -5, // Example of overpriced
    aiScore: 45,
    dealLabel: '❌ Fuori Prezzo',
    tags: ['#Discontinued', '#HolyGrail'],
    sourceUrl: '#',
    lastUpdated: '2024-07-27T15:00:00Z',
  },
   {
    id: '4',
    imageUrl: 'https://placehold.co/600x450.png?a=4',
    brand: 'Audemars Piguet',
    model: 'Royal Oak',
    referenceNumber: '15500ST.OO.1220ST.03',
    listingPrice: 45000,
    marketPrice: 48000,
    estimatedMarginPercent: 12.0,
    aiScore: 92,
    dealLabel: '🔥 Affare',
    tags: ['#LuxurySport', '#GentaDesign'],
    sourceUrl: '#',
    lastUpdated: '2024-07-28T11:00:00Z',
  },
  {
    id: '5',
    imageUrl: 'https://placehold.co/600x450.png?a=5',
    brand: 'Cartier',
    model: 'Tank Must SolarBeat',
    referenceNumber: 'WSTA0059',
    listingPrice: 3200,
    marketPrice: 3000,
    estimatedMarginPercent: 5.0,
    aiScore: 68,
    dealLabel: '👍 OK',
    tags: ['#EcoFriendly', '#Elegant'],
    sourceUrl: '#',
    lastUpdated: '2024-07-28T08:00:00Z',
  },
];


export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDeals = mockDeals.filter(deal => {
    const term = searchTerm.toLowerCase();
    return (
      deal.brand.toLowerCase().includes(term) ||
      deal.model.toLowerCase().includes(term) ||
      deal.referenceNumber.toLowerCase().includes(term)
    );
  });

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
            <Select defaultValue="aiScore">
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
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" /> Filters
            </Button>
             <Button variant="ghost" size="icon" onClick={() => setSearchTerm('')}>
              <ListRestart className="h-5 w-5" />
              <span className="sr-only">Reset Filters</span>
            </Button>
          </div>
        </div>
        
        {filteredDeals.length > 0 ? (
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
