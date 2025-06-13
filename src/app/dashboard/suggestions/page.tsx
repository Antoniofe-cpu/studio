import { PersonalizedSuggestionsForm } from '@/components/ai/personalized-suggestions-form';

export default function PersonalizedSuggestionsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Personalized Watch Suggestions</h1>
      <p className="text-muted-foreground">
        Get watch recommendations curated specifically for you by our AI. 
        The more details you provide, the better the suggestions will be.
      </p>
      <PersonalizedSuggestionsForm />
    </div>
  );
}
