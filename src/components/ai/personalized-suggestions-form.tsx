'use client';

import { useState, type FormEvent } from 'react';
import { getPersonalizedSuggestions, type PersonalizedSuggestionsInput, type PersonalizedSuggestionsOutput } from '@/ai/flows/personalized-suggestions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, UserCheck, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function PersonalizedSuggestionsForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<PersonalizedSuggestionsOutput | null>(null);
  const { toast } = useToast();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setSuggestions(null);

    const formData = new FormData(event.currentTarget);
    const inputData: PersonalizedSuggestionsInput = {
      userHistory: formData.get('userHistory') as string,
      userPreferences: formData.get('userPreferences') as string,
      currentTrends: formData.get('currentTrends') as string,
    };
    
    try {
      const result = await getPersonalizedSuggestions(inputData);
      setSuggestions(result);
    } catch (error) {
      console.error('Error getting personalized suggestions:', error);
      toast({
        title: 'Error',
        description: 'Failed to get personalized suggestions. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center"><UserCheck className="mr-2 h-6 w-6 text-primary" />Personalized Watch Suggestions</CardTitle>
        <CardDescription>
          Provide details about your watch journey and let our AI find suggestions just for you.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="userHistory">User History</Label>
            <Textarea id="userHistory" name="userHistory" placeholder="e.g., Previously owned a Rolex Submariner, currently interested in vintage chronographs." rows={3} defaultValue="Owned a Seiko SKX007, viewed several Omega Seamasters, looking for a dress watch." />
          </div>
          <div>
            <Label htmlFor="userPreferences">User Preferences</Label>
            <Textarea id="userPreferences" name="userPreferences" placeholder="e.g., Prefers dive watches, budget up to $5000, likes blue dials." rows={3} defaultValue="Prefers German brands, automatic movement, case size 38-40mm, budget around $3000."/>
          </div>
          <div>
            <Label htmlFor="currentTrends">Current Trends</Label>
            <Textarea id="currentTrends" name="currentTrends" placeholder="e.g., Green dials are popular, microbrands offering good value." rows={3} defaultValue="Integrated sports watches are still in high demand, vintage re-issues are popular."/>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Get Personalized Suggestions
          </Button>
        </CardFooter>
      </form>

      {suggestions && (
        <CardContent className="mt-6">
          <h3 className="text-xl font-semibold mb-2 text-primary">Your Personalized Suggestions:</h3>
          <ul className="list-disc list-inside space-y-1 bg-muted p-4 rounded-md">
            {suggestions.suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </CardContent>
      )}
    </Card>
  );
}
