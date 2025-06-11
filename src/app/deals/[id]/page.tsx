
'use client'; // Required for useRouter

import { useEffect, useState } from 'react'; // useEffect and useState for client-side logic if needed in future
import { useRouter } from 'next/navigation';
import { getWatchDealById } from '@/lib/firebase/firestore-service';
import type { WatchDeal } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Info, LineChart, Percent, ShieldAlert, ShoppingCart, Tag, Thermometer, TrendingUp, MapPin, CalendarDays, TagIcon, DraftingCompass, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { ImageGallery } from '@/components/image-gallery';


interface DealPageProps {
  params: {
    id: string;
  };
}

const getScoreColor = (score: number | null) => {
  if (score === null) return 'bg-muted';
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
};

export default function DealPage({ params }: DealPageProps) {
  const router = useRouter();
  const { id } = params;
  const [deal, setDeal] = useState<WatchDeal | null | undefined>(undefined); // undefined for initial loading state

  useEffect(() => {
    async function fetchDeal() {
      const fetchedDeal = await getWatchDealById(id);
      setDeal(fetchedDeal);
    }
    fetchDeal();
  }, [id]);

  if (deal === undefined) { // Loading state
    return (
      <main className="container mx-auto p-4 md:p-8 flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
        <p>Loading deal details...</p> {/* Or a spinner component */}
      </main>
    );
  }

  if (!deal) {
    return (
      <main className="container mx-auto p-4 md:p-8 flex flex-col items-center justify-center min-h-[calc(100vh-12rem)]">
        <Button variant="outline" onClick={() => router.back()} className="self-start mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Torna Indietro
        </Button>
        <Alert variant="destructive" className="max-w-md text-center">
          <ShieldAlert className="h-5 w-5" />
          <AlertTitle className="text-2xl font-bold">Deal Not Found</AlertTitle>
          <AlertDescription className="text-lg">
            The watch deal you are looking for (ID: {id}) could not be found. It might have been removed or the ID is incorrect.
          </AlertDescription>
        </Alert>
        <Button asChild className="mt-8">
          <Link href="/">Back to Deals</Link>
        </Button>
      </main>
    );
  }

  const pageTitle = deal.title || `${deal.brand || 'Watch'} ${deal.model || ''}`.trim();
  const galleryAltText = pageTitle;

  return (
    <main className="container mx-auto p-4 md:p-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6 inline-flex items-center">
        <ArrowLeft className="mr-2 h-4 w-4" /> Torna Indietro
      </Button>
      <Card className="overflow-hidden shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">

          <div className="lg:col-span-3">
            <ImageGallery 
              imageUrls={deal.imageUrls} 
              imageUrl={deal.imageUrl} 
              altText={galleryAltText} 
            />
          </div>

          <div className="lg:col-span-2 p-6 md:p-8 space-y-6">
            <CardHeader className="p-0">
              <CardTitle className="text-3xl md:text-4xl font-bold font-headline text-primary">{deal.brand || 'Unknown Brand'}</CardTitle>
              <CardDescription className="text-xl md:text-2xl text-muted-foreground">{deal.model || 'Unknown Model'}</CardDescription>
              <p className="text-sm text-muted-foreground pt-1">Ref: {deal.referenceNumber || 'N/A'}</p>
            </CardHeader>

            <CardContent className="p-0 space-y-4">
              <div className="border bg-card p-4 rounded-lg space-y-2 shadow-sm">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-medium text-muted-foreground">Prezzo Annuncio:</span>
                  <span className="text-2xl font-bold text-primary">€{deal.listingPriceEUR?.toLocaleString() ?? 'N/A'}</span>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-medium text-muted-foreground">Valore di Mercato:</span>
                  <span className="text-lg font-semibold">€{deal.marketPriceEUR?.toLocaleString() ?? 'N/A'}</span>
                </div>
                {deal.retailPriceEUR !== undefined && deal.retailPriceEUR !== null && (
                  <div className="flex justify-between items-baseline text-sm">
                    <span className="text-muted-foreground">Prezzo Listino (Nuovo):</span>
                    <span className="text-foreground">€{deal.retailPriceEUR?.toLocaleString() ?? 'N/A'}</span>
                  </div>
                )}
                 {deal.originalListingPrice && deal.originalCurrency && (
                  <div className="flex justify-between items-baseline text-xs pt-1 text-muted-foreground/80">
                    <span>Prezzo Originale:</span>
                    <span>{deal.originalListingPrice.toLocaleString()} {deal.originalCurrency}</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-muted-foreground flex items-center"><TrendingUp className="w-4 h-4 mr-1.5"/>AI Score:</span>
                    <span className="font-bold text-lg">{deal.aiScore !== null ? deal.aiScore : 'N/A'}/100</span>
                  </div>
                  <Progress value={deal.aiScore || 0} className="h-2.5" indicatorClassName={getScoreColor(deal.aiScore)} />
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground flex items-center"><Percent className="w-4 h-4 mr-1.5"/>Est. Margin:</span>
                  {deal.estimatedMarginPercent !== null ? (
                    <Badge
                      variant={deal.estimatedMarginPercent > 10 ? 'default' : 'secondary'}
                      className={`${deal.estimatedMarginPercent > 10 ? 'bg-green-600/80 hover:bg-green-600' : 'bg-yellow-600/80 hover:bg-yellow-600'} text-primary-foreground font-semibold`}>
                      {deal.estimatedMarginPercent?.toFixed(1)}%
                    </Badge>
                  ) : (
                    <span className="font-medium">N/A</span>
                  )}
                </div>
                {deal.dealLabel && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground flex items-center"><LineChart className="w-4 h-4 mr-1.5"/>Deal Label:</span>
                    <Badge variant="outline" className="font-semibold">{deal.dealLabel}</Badge>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                {deal.condition && <div className="flex justify-between"><span className="text-muted-foreground flex items-center"><Info className="w-4 h-4 mr-1.5"/>Condition:</span> <span className="font-medium">{deal.condition}</span></div>}
                {deal.demand && <div className="flex justify-between"><span className="text-muted-foreground flex items-center"><Thermometer className="w-4 h-4 mr-1.5"/>Demand:</span> <span className="font-medium">{deal.demand}</span></div>}
                {deal.rarity && <div className="flex justify-between"><span className="text-muted-foreground flex items-center"><DraftingCompass className="w-4 h-4 mr-1.5"/>Rarity:</span> <span className="font-medium">{deal.rarity}</span></div>}
                {deal.risk && <div className="flex justify-between"><span className="text-muted-foreground flex items-center"><ShieldAlert className="w-4 h-4 mr-1.5"/>Risk:</span> <span className="font-medium">{deal.risk}</span></div>}
                {deal.location && <div className="flex justify-between"><span className="text-muted-foreground flex items-center"><MapPin className="w-4 h-4 mr-1.5"/>Location:</span> <span className="font-medium">{deal.location}</span></div>}
                <div className="flex justify-between">
                  <span className="text-muted-foreground flex items-center"><CalendarDays className="w-4 h-4 mr-1.5"/>Last Updated:</span>
                  <span className="font-medium text-xs">{new Date(deal.lastUpdated).toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric', hour:'2-digit', minute:'2-digit' })}</span>
                </div>
              </div>

              {deal.tags && deal.tags.length > 0 && (
                <div>
                  <h4 className="text-xs text-muted-foreground mb-1.5 flex items-center"><Tag className="w-3 h-3 mr-1"/>Tags:</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {deal.tags.map(tag => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                  </div>
                </div>
              )}
            </CardContent>

            <Button asChild className="w-full text-lg py-6">
              <a href={deal.sourceUrl} target="_blank" rel="noopener noreferrer">
                View Original Deal <ExternalLink className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>

        {(deal.description && deal.description.trim() !== '' && deal.description !== 'No description provided.') && (
          <div className="lg:col-span-5 p-6 md:p-8 border-t">
            <h3 className="text-xl font-semibold mb-3 text-primary">Description</h3>
            <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{deal.description}</p>
          </div>
        )}
         <div className="lg:col-span-5 p-6 md:p-8 border-t">
            <h3 className="text-xl font-semibold mb-3 text-primary">Historical Data & Charts</h3>
            <p className="text-muted-foreground">Price history charts and margin trends will be displayed here soon.</p>
        </div>
      </Card>
    </main>
  );
}

