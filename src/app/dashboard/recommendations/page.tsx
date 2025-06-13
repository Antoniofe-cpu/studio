import { WatchRecommendationsForm } from '@/components/ai/recommendations-form';

export default function AIRecommendationsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">AI Watch Recommendations</h1>
      <p className="text-muted-foreground">
        Discover new watch models tailored to your profile and current market dynamics. 
        Our AI analyzes your data to suggest the best options for your collection or investment.
      </p>
      <WatchRecommendationsForm />
    </div>
  );
}
