'use client';

import { useState, type FormEvent } from 'react';
import { getWatchRecommendations, type WatchRecommendationsInput, type WatchRecommendationsOutput } from '@/ai/flows/ai-recommendations';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function WatchRecommendationsForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<WatchRecommendationsOutput | null>(null);
  const { toast } = useToast();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setRecommendations(null);

    const formData = new FormData(event.currentTarget);
    const inputData: WatchRecommendationsInput = {
      userHistory: formData.get('userHistory') as string,
      userPreferences: formData.get('userPreferences') as string,
      marketTrends: formData.get('marketTrends') as string,
    };

    try {
      const result = await getWatchRecommendations(inputData);
      setRecommendations(result);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      toast({
        title: 'Error',
        description: 'Failed to get watch recommendations. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center"><Wand2 className="mr-2 h-6 w-6 text-primary" />AI Watch Recommendations</CardTitle>
        <CardDescription>
          Enter your history, preferences, and market trends (as JSON strings for now) to get AI-powered watch recommendations.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="userHistory">User History (JSON)</Label>
            <Textarea id="userHistory" name="userHistory" placeholder='e.g., {"viewed": ["Rolex Submariner", "Omega Speedmaster"]}' rows={3} defaultValue='{"viewed_models": ["Rolex Daytona 116500LN", "Omega Seamaster 300M"], "purchased_brands": ["Rolex"]}' />
          </div>
          <div>
            <Label htmlFor="userPreferences">User Preferences (JSON)</Label>
            <Textarea id="userPreferences" name="userPreferences" placeholder='e.g., {"brands": ["Rolex", "Patek Philippe"], "price_max": 20000}' rows={3} defaultValue='{"preferred_styles": ["diver", "chronograph"], "max_price": 15000, "materials": ["stainless steel"]}' />
          </div>
          <div>
            <Label htmlFor="marketTrends">Market Trends (JSON)</Label>
            <Textarea id="marketTrends" name="marketTrends" placeholder='e.g., {"hot_brands": ["Audemars Piguet"], "trending_styles": ["integrated bracelet"]}' rows={3} defaultValue='{"rising_brands": ["F.P. Journe", "Czapek"], "popular_complications": ["perpetual calendar", "tourbillon"]}' />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Get Recommendations
          </Button>
        </CardFooter>
      </form>

      {recommendations && (
        <CardContent className="mt-6">
          <h3 className="text-xl font-semibold mb-2 text-primary">Recommended Watches:</h3>
          <pre className="bg-muted p-4 rounded-md text-sm overflow-x-auto font-code">
            {JSON.stringify(JSON.parse(recommendations.recommendations), null, 2)}
          </pre>
        </CardContent>
      )}
    </Card>
  );
}
