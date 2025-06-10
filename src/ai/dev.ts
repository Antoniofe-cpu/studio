import { config } from 'dotenv';
config();

import '@/ai/flows/personalized-suggestions.ts';
import '@/ai/flows/ai-recommendations.ts';
import '@/ai/flows/ai-deal-scoring.ts';
import '@/ai/flows/ai-photo-scanner.ts';