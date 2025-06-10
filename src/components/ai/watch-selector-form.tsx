// src/components/ai/watch-selector-form.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Search, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { WatchDeal } from '@/lib/types';
import { WatchCard } from '@/components/watch-card';

const watchBrands = [
  { id: 'rolex', name: 'Rolex' },
  { id: 'omega', name: 'Omega' },
  { id: 'patek', name: 'Patek Philippe' },
  { id: 'ap', name: 'Audemars Piguet' },
  { id: 'cartier', name: 'Cartier' },
  { id: 'tudor', name: 'Tudor' },
  { id: 'iwc', name: 'IWC Schaffhausen'},
  { id: 'panerai', name: 'Panerai'}
];

const watchModelsByBrand: Record<string, { id: string; name: string }[]> = {
  rolex: [
    { id: 'submariner', name: 'Submariner' },
    { id: 'daytona', name: 'Daytona' },
    { id: 'gmt-master-ii', name: 'GMT-Master II' },
    { id: 'datejust', name: 'Datejust' },
    { id: 'explorer', name: 'Explorer' },
  ],
  omega: [
    { id: 'speedmaster', name: 'Speedmaster Professional' },
    { id: 'seamaster300', name: 'Seamaster Diver 300M' },
    { id: 'seamaster-aqua-terra', name: 'Seamaster Aqua Terra' },
    { id: 'constellation', name: 'Constellation' },
  ],
  patek: [
    { id: 'nautilus', name: 'Nautilus' },
    { id: 'aquanaut', name: 'Aquanaut' },
    { id: 'calatrava', name: 'Calatrava' },
  ],
  ap: [
    { id: 'royal-oak', name: 'Royal Oak' },
    { id: 'royal-oak-offshore', name: 'Royal Oak Offshore' },
    { id: 'code-1159', name: 'Code 11.59' },
  ],
  cartier: [
    { id: 'tank', name: 'Tank' },
    { id: 'santos', name: 'Santos de Cartier' },
    { id: 'panthere', name: 'Panthère de Cartier' },
  ],
  tudor: [
    { id: 'black-bay', name: 'Black Bay' },
    { id: 'pelagos', name: 'Pelagos' },
    { id: 'royal', name: 'Royal' },
  ],
  iwc: [
    { id: 'portugieser', name: 'Portugieser' },
    { id: 'pilots-watch', name: "Pilot's Watch" },
    { id: 'portofino', name: 'Portofino' },
  ],
    panerai: [
    { id: 'luminor', name: 'Luminor' },
    { id: 'radiomir', name: 'Radiomir' },
    { id: 'submersible', name: 'Submersible' },
  ]
};

export function WatchSelectorForm() {
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [modelsForBrand, setModelsForBrand] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<WatchDeal | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedBrand) {
      setModelsForBrand(watchModelsByBrand[selectedBrand] || []);
      setSelectedModel(''); // Reset model when brand changes
      setSearchResult(null);
    } else {
      setModelsForBrand([]);
    }
  }, [selectedBrand]);

  const handleSearch = async () => {
    if (!selectedBrand || !selectedModel) {
      toast({
        title: 'Selezione Incompleta',
        description: 'Per favore, seleziona sia la marca che il modello.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setSearchResult(null);

    // Simulate API call / AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    const brandName = watchBrands.find(b => b.id === selectedBrand)?.name || 'Sconosciuto';
    const modelName = modelsForBrand.find(m => m.id === selectedModel)?.name || 'Sconosciuto';
    
    // Generate a mock WatchDeal
    const mockListingPrice = Math.floor(Math.random() * 20000) + 5000; // e.g. 5k - 25k
    const marketPriceVariance = (Math.random() * 0.3) - 0.15; // -15% to +15%
    const mockMarketPrice = Math.floor(mockListingPrice * (1 + marketPriceVariance));
    const mockRetailPrice = Math.floor(mockListingPrice * (Math.random() * 0.4 + 0.5)); // 50-90% of listing
    const score = Math.floor(Math.random() * 40) + 60; // Score 60-99

    let dealLabel: WatchDeal['dealLabel'] = '👍 OK';
    if (score > 85 && mockListingPrice < mockMarketPrice * 0.95) {
      dealLabel = '🔥 Affare';
    } else if (score < 70 || mockListingPrice > mockMarketPrice * 1.1) {
      dealLabel = '❌ Fuori Prezzo';
    }
    
    const mockResultData: WatchDeal = {
      id: `search-${selectedBrand}-${selectedModel}-${Date.now()}`,
      imageUrl: `https://placehold.co/600x450.png?text=${encodeURIComponent(brandName + ' ' + modelName)}`,
      brand: brandName,
      model: modelName,
      referenceNumber: `REF-${selectedBrand.toUpperCase().slice(0,3)}${Math.floor(Math.random() * 9000) + 1000}`,
      listingPrice: mockListingPrice,
      marketPrice: mockMarketPrice,
      retailPrice: mockRetailPrice,
      estimatedMarginPercent: parseFloat((((mockMarketPrice - mockListingPrice) / mockListingPrice) * 100).toFixed(1)),
      aiScore: score,
      dealLabel: dealLabel,
      tags: ['#ValutazioneAI', `#${brandName.replace(/\s+/g, '')}`],
      sourceUrl: '#', // Placeholder
      description: `Valutazione AI generata per ${brandName} ${modelName}. Dati simulati.`,
      condition: 'Variabile',
      demand: 'Media',
      rarity: 'Variabile',
      risk: 'Medio',
      lastUpdated: new Date().toISOString(),
    };
    
    // Add data-ai-hint to the imageUrl within the component if WatchCard doesn't handle it,
    // or ensure WatchCard handles it. Here, we assume WatchCard handles it for its own image.
    // For this mock, WatchCard will use its default data-ai-hint.
    // If specific hint is needed, it should be passed to WatchCard or WatchCard modified.
    // The placeholder URL is updated to include text for better visual feedback during mock.
    // However, for production, it should be `https://placehold.co/600x450.png` and rely on `data-ai-hint`.
    // For now, let's keep the text in placeholder for dev feedback but remember to remove it.
    // For the actual task: ensure the image in WatchCard has a generic hint if not specific one.

    mockResultData.imageUrl = 'https://placehold.co/600x450.png'; // Correct placeholder for AI hint

    setSearchResult(mockResultData);
    setIsLoading(false);
     toast({
        title: 'Valutazione Pronta!',
        description: `Ecco la valutazione AI per ${brandName} ${modelName}.`,
      });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center"><Sparkles className="mr-2 h-6 w-6 text-primary" />AI Watch Search & Scanner</CardTitle>
        <CardDescription>
          Seleziona marca e modello per ottenere una valutazione AI simulata.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="brand-select">Marca</Label>
            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger id="brand-select">
                <SelectValue placeholder="Seleziona marca" />
              </SelectTrigger>
              <SelectContent>
                {watchBrands.map(brand => (
                  <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="model-select">Modello</Label>
            <Select value={selectedModel} onValueChange={setSelectedModel} disabled={!selectedBrand || modelsForBrand.length === 0}>
              <SelectTrigger id="model-select">
                <SelectValue placeholder="Seleziona modello" />
              </SelectTrigger>
              <SelectContent>
                {modelsForBrand.length > 0 ? modelsForBrand.map(model => (
                  <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
                )) : <SelectItem value="-" disabled>Seleziona prima una marca</SelectItem>}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-4">
        <Button onClick={handleSearch} disabled={isLoading || !selectedModel || !selectedBrand} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
          Ottieni Valutazione AI
        </Button>
      </CardFooter>

      {searchResult && (
        <CardContent className="mt-6 border-t pt-6">
          <h3 className="text-xl font-semibold mb-4 text-primary">Risultato Valutazione:</h3>
          <div className="max-w-md mx-auto">
            <WatchCard deal={searchResult} />
          </div>
        </CardContent>
      )}
    </Card>
  );
}
