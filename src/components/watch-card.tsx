
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { WatchDeal, DealLabel } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Flame, ThumbsUp, XCircle, Percent, BarChartBig, TrendingUp, TagIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface WatchCardProps {
  deal: WatchDeal;
}

const DealLabelIcon = ({ label }: { label: WatchDeal['dealLabel'] }) => {
  if (label === '🔥 Affare') return <Flame className="w-4 h-4 mr-1 text-red-500" />;
  if (label === '👍 OK') return <ThumbsUp className="w-4 h-4 mr-1 text-green-500" />;
  if (label === '❌ Fuori Prezzo') return <XCircle className="w-4 h-4 mr-1 text-yellow-500" />;
  return null;
};

const getScoreColor = (score: number | null) => {
  if (score === null) return 'bg-muted';
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
};


export function WatchCard({ deal }: WatchCardProps) {
  const [formattedListingPrice, setFormattedListingPrice] = useState<string | null>(null);
  const [formattedMarketPrice, setFormattedMarketPrice] = useState<string | null>(null);
  const [formattedRetailPrice, setFormattedRetailPrice] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const currentImageUrl = deal.imageUrl; // Store for dependency array

  useEffect(() => {
    if (deal.listingPriceEUR !== undefined && deal.listingPriceEUR !== null) {
      setFormattedListingPrice(deal.listingPriceEUR.toLocaleString());
    } else {
      setFormattedListingPrice(null);
    }
    if (deal.marketPriceEUR !== undefined && deal.marketPriceEUR !== null) {
      setFormattedMarketPrice(deal.marketPriceEUR.toLocaleString());
    } else {
      setFormattedMarketPrice(null);
    }
    if (deal.retailPriceEUR !== undefined && deal.retailPriceEUR !== null) {
      setFormattedRetailPrice(deal.retailPriceEUR.toLocaleString());
    } else {
      setFormattedRetailPrice(null);
    }
  }, [deal.listingPriceEUR, deal.marketPriceEUR, deal.retailPriceEUR]);

  useEffect(() => {
    setImageError(false); // Reset error state when the deal or its imageUrl changes
  }, [deal.id, currentImageUrl]);


  if (!deal || !deal.id) return null;

  const displayBrand = deal.brand || 'Unknown Brand';
  const displayModel = deal.model || 'Unknown Model';
  const displayReference = deal.referenceNumber || 'N/A';
  const displayTitle = deal.title || `${displayBrand} ${displayModel}`.trim();

  return (
    <Link href={`/deals/${deal.id}`} className="block hover:shadow-xl hover:scale-[1.02] transition-all duration-200 rounded-lg">
      <Card className="h-full flex flex-col overflow-hidden shadow-lg transition-shadow duration-300 bg-card">
        <CardHeader className="p-4">
          {currentImageUrl && !imageError ? (
            <div className="relative w-full h-[200px] rounded-md overflow-hidden mb-3">
              <Image
                key={currentImageUrl} // Add key to help React differentiate when src changes
                src={currentImageUrl}
                alt={displayTitle}
                fill
                className="object-cover object-center"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                data-ai-hint="luxury watch"
                onError={() => {
                  console.error(`Failed to load card image: ${currentImageUrl} for deal ID: ${deal.id}`);
                  setImageError(true);
                }}
              />
            </div>
          ) : (
             <div className="w-full h-[200px] rounded-md bg-muted flex items-center justify-center mb-3">
              <TagIcon className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <CardTitle className="text-lg font-headline truncate" title={displayTitle}>
            {displayTitle}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">{displayReference}</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3 text-sm flex-grow">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Prezzo Annuncio:</span>
            <span className="font-semibold text-primary">
              €{formattedListingPrice !== null ? formattedListingPrice : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Valore di Mercato:</span>
            <span className="font-semibold">
              €{formattedMarketPrice !== null ? formattedMarketPrice : 'N/A'}
            </span>
          </div>
          {deal.retailPriceEUR !== undefined && deal.retailPriceEUR !== null && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Prezzo Listino (Nuovo):</span>
              <span className="font-semibold">
                €{formattedRetailPrice !== null ? formattedRetailPrice : 'N/A'}
              </span>
            </div>
          )}

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center"><TrendingUp className="w-4 h-4 mr-1.5" /> AI Score:</span>
              <span className="font-bold text-lg">{deal.aiScore !== null ? deal.aiScore : 'N/A'}/100</span>
            </div>
            <Progress value={deal.aiScore || 0} className="h-2" indicatorClassName={getScoreColor(deal.aiScore)} />
          </div>

          <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center"><Percent className="w-4 h-4 mr-1.5" /> Margin:</span>
              <Badge variant={deal.estimatedMarginPercent !== null && deal.estimatedMarginPercent > 10 ? 'default' : 'secondary'} className={`${deal.estimatedMarginPercent !== null && deal.estimatedMarginPercent > 10 ? 'bg-green-600/80 hover:bg-green-600' : 'bg-yellow-600/80 hover:bg-yellow-600'} text-primary-foreground`}>
                {deal.estimatedMarginPercent !== null ? deal.estimatedMarginPercent.toFixed(1) : 'N/A'}%
              </Badge>
          </div>

          {deal.dealLabel && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center"><BarChartBig className="w-4 h-4 mr-1.5" /> Deal:</span>
              <Badge variant="outline" className="flex items-center">
                <DealLabelIcon label={deal.dealLabel as DealLabel} /> {deal.dealLabel}
              </Badge>
            </div>
          )}

          {deal.tags && deal.tags.length > 0 && (
            <div className="pt-1">
              <span className="text-muted-foreground text-xs flex items-center mb-1"><TagIcon className="w-3 h-3 mr-1.5" /> Tags:</span>
              <div className="flex flex-wrap gap-1">
                {deal.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs px-1.5 py-0.5">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="p-4 bg-muted/30">
          <Button variant="outline" className="w-full text-primary border-primary hover:bg-primary/10 hover:text-primary">
            View Details <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
