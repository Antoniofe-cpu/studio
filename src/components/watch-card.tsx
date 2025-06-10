
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link'; // Importa il Link
import type { WatchDeal } from '@/lib/types';
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

const getScoreColor = (score: number) => {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
};


export function WatchCard({ deal }: WatchCardProps) {
  const [formattedListingPrice, setFormattedListingPrice] = useState<string | null>(null);
  const [formattedMarketPrice, setFormattedMarketPrice] = useState<string | null>(null);
  const [formattedRetailPrice, setFormattedRetailPrice] = useState<string | null>(null);

  useEffect(() => {
    setFormattedListingPrice(deal.listingPrice.toLocaleString());
    setFormattedMarketPrice(deal.marketPrice.toLocaleString());
    if (deal.retailPrice !== undefined) {
      setFormattedRetailPrice(deal.retailPrice.toLocaleString());
    } else {
      setFormattedRetailPrice(null);
    }
  }, [deal.listingPrice, deal.marketPrice, deal.retailPrice]);

  if (!deal || !deal.id) return null; // Controllo di sicurezza

  return (
    <Link href={`/deals/${deal.id}`} className="block hover:shadow-xl hover:scale-[1.02] transition-all duration-200 rounded-lg">
      <Card className="h-full flex flex-col overflow-hidden shadow-lg transition-shadow duration-300 bg-card">
        <CardHeader className="p-4">
          {deal.imageUrl ? (
            <div className="aspect-[4/3] relative w-full rounded-md overflow-hidden mb-3">
              <Image
                src={deal.imageUrl}
                alt={`${deal.brand} ${deal.model}`}
                fill
                className="object-cover"
                data-ai-hint="luxury watch"
              />
            </div>
          ) : (
             <div className="aspect-[4/3] w-full rounded-md bg-muted flex items-center justify-center mb-3">
              <TagIcon className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          <CardTitle className="text-lg font-headline truncate" title={`${deal.brand} ${deal.model}`}>
            {deal.brand} - {deal.model}
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">{deal.referenceNumber}</CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3 text-sm flex-grow">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Listing Price:</span>
            <span className="font-semibold text-primary">
              €{formattedListingPrice !== null ? formattedListingPrice : deal.listingPrice.toString()}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Market Price:</span>
            <span className="font-semibold">
              €{formattedMarketPrice !== null ? formattedMarketPrice : deal.marketPrice.toString()}
            </span>
          </div>
          {deal.retailPrice !== undefined && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Retail Price:</span>
              <span className="font-semibold">
                €{formattedRetailPrice !== null ? formattedRetailPrice : deal.retailPrice.toString()}
              </span>
            </div>
          )}
          
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center"><TrendingUp className="w-4 h-4 mr-1.5" /> AI Score:</span>
              <span className="font-bold text-lg">{deal.aiScore}/100</span>
            </div>
            <Progress value={deal.aiScore} className="h-2" indicatorClassName={getScoreColor(deal.aiScore)} />
          </div>

          <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center"><Percent className="w-4 h-4 mr-1.5" /> Margin:</span>
              <Badge variant={deal.estimatedMarginPercent > 10 ? 'default' : 'secondary'} className={`${deal.estimatedMarginPercent > 10 ? 'bg-green-600/80 hover:bg-green-600' : 'bg-yellow-600/80 hover:bg-yellow-600'} text-primary-foreground`}>
                {deal.estimatedMarginPercent.toFixed(1)}%
              </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center"><BarChartBig className="w-4 h-4 mr-1.5" /> Deal:</span>
            <Badge variant="outline" className="flex items-center">
              <DealLabelIcon label={deal.dealLabel} /> {deal.dealLabel}
            </Badge>
          </div>

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
