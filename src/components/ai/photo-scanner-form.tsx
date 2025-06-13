// This file is no longer used for AI Photo Scanner, 
// its functionality has been replaced by WatchSelectorForm.
// Keeping the file for now, but it can be deleted later if not repurposed.
'use client';

import { useState } from 'react';
// Intentionally keeping imports commented to avoid build errors if this file is not deleted immediately
// import { aiPhotoScanner, type AiPhotoScannerInput, type AiPhotoScannerOutput } from '@/ai/flows/ai-photo-scanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUploader } from '@/components/file-uploader';
import { Loader2, ScanSearch, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

// Mock type for AiPhotoScannerOutput since the flow might be removed
type AiPhotoScannerOutput = { identification: { modelName: string, estimatedValue: string }};
type AiPhotoScannerInput = { photoDataUri: string };


export function AIPhotoScannerForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [scanResult, setScanResult] = useState<AiPhotoScannerOutput | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (file: File | null, dataUrl: string | null) => {
    setSelectedFile(file);
    setPhotoDataUri(dataUrl);
    setScanResult(null); 
  };

  async function handleSubmit() {
    if (!photoDataUri) {
      toast({
        title: 'No Image Selected',
        description: 'Please upload an image of a watch to scan.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setScanResult(null);

    const inputData: AiPhotoScannerInput = { photoDataUri };

    try {
      // const result = await aiPhotoScanner(inputData); // Original call
      // Mocking the result as the flow might be deprecated
      await new Promise(resolve => setTimeout(resolve, 1000));
      const result: AiPhotoScannerOutput = {
        identification: {
          modelName: "Mocked Model Name",
          estimatedValue: "€X,XXX (Mocked)"
        }
      }
      setScanResult(result);
      toast({title: "Info", description: "Photo scanning is currently mocked as this feature is being redesigned."});
    } catch (error) {
      console.error('Error scanning photo:', error);
      toast({
        title: 'Scan Error',
        description: 'Failed to scan the photo. Please try again with a clearer image.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full opacity-50 pointer-events-none">
      <CardHeader>
        <CardTitle className="flex items-center"><ScanSearch className="mr-2 h-6 w-6 text-primary" />AI Photo Scanner (Deprecated)</CardTitle>
        <CardDescription>
          This photo scanner is being replaced by the AI Search Scanner.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FileUploader onFileSelect={handleFileSelect} acceptedFileTypes="image/jpeg, image/png, image/webp, image/gif" />
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-4">
        <Button onClick={handleSubmit} disabled={true || isLoading || !selectedFile} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          Scan Watch Photo (Disabled)
        </Button>
      </CardFooter>

      {scanResult && (
        <CardContent className="mt-6 border-t pt-6">
          <h3 className="text-xl font-semibold mb-4 text-primary">Scan Results:</h3>
          <div className="space-y-3 bg-muted p-4 rounded-md">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Identified Model:</p>
              <p className="text-lg font-semibold">{scanResult.identification.modelName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Estimated Current Value:</p>
              <p className="text-lg font-semibold">{scanResult.identification.estimatedValue}</p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
