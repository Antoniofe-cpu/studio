import { WatchSelectorForm } from '@/components/ai/watch-selector-form';

export default function AISearchScannerPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline text-primary">AI Watch Search & Scanner</h1>
      <p className="text-muted-foreground">
        Seleziona la marca e il modello di un orologio per ottenere una stima del valore di mercato attuale
        e un punteggio AI. La nostra IA analizzerà i dati da diverse fonti per fornirti una valutazione.
      </p>
      <WatchSelectorForm />
    </div>
  );
}
