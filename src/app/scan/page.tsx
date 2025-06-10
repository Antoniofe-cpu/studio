import { AIPhotoScannerForm } from '@/components/ai/photo-scanner-form';

export default function AIPhotoScannerPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">AI Watch Photo Scanner</h1>
      <p className="text-muted-foreground">
        Got a photo of a watch? Upload it here. Our AI will analyze the image to identify the model
        and provide an estimated current market value. Ensure the image is clear and well-lit for best results.
      </p>
      <AIPhotoScannerForm />
    </div>
  );
}
