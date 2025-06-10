import Image from 'next/image';
import Link from 'next/link';
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
  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-primary/30 transition-shadow duration-300">
      <CardHeader className="p-4">
        <div className="aspect-[4/3] relative w-full rounded-md overflow-hidden mb-3">
          <Image
            src={deal.imageUrl}
            alt={`${deal.brand} ${deal.model}`}
            layout="fill"
            objectFit="cover"
            data-ai-hint="luxury watch"
          />
        </div>
        <CardTitle className="text-lg font-headline truncate" title={`${deal.brand} ${deal.model}`}>
          {deal.brand} - {deal.model}
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">{deal.referenceNumber}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-3 text-sm flex-grow">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Listing Price:</span>
          <span className="font-semibold text-primary">€{deal.listingPrice.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Market Price:</span>
          <span className="font-semibold">€{deal.marketPrice.toLocaleString()}</span>
        </div>
        {deal.retailPrice && (
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Retail Price:</span>
            <span className="font-semibold">€{deal.retailPrice.toLocaleString()}</span>
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
            <Badge variant={deal.estimatedMarginPercent > 10 ? 'default' : 'secondary'} className={deal.estimatedMarginPercent > 10 ? 'bg-green-600/80 hover:bg-green-600 text-white' : 'bg-yellow-600/80 hover:bg-yellow-600 text-white'}>
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
      <CardFooter className="p-4 bg-card/50">
        <Button asChild variant="default" className="w-full">
          <Link href={deal.sourceUrl} target="_blank" rel="noopener noreferrer">
            View Deal <ExternalLink className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
