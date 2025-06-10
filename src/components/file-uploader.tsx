'use client';

import { useState, type ChangeEvent, type DragEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image'; // Using next/image for preview

interface FileUploaderProps {
  onFileSelect: (file: File | null, dataUrl: string | null) => void;
  acceptedFileTypes?: string; // e.g., "image/jpeg, image/png"
}

export function FileUploader({ onFileSelect, acceptedFileTypes = "image/*" }: FileUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    processFile(file);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file && (!acceptedFileTypes || acceptedFileTypes.split(',').map(ft=>ft.trim()).includes(file.type) || acceptedFileTypes === "image/*" && file.type.startsWith("image/"))) {
        processFile(file);
    } else {
        alert("Invalid file type."); // Simple error handling
    }
  };
  
  const processFile = (file: File | undefined | null) => {
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setPreviewUrl(dataUrl);
        onFileSelect(file, dataUrl);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
      onFileSelect(null, null);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    onFileSelect(null, null);
    // Reset file input value
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };


  return (
    <div className="space-y-4">
      <div 
        className={`w-full p-6 border-2 border-dashed rounded-lg transition-colors
                    ${isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-muted-foreground/50'}
                    ${previewUrl ? 'border-solid' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <Input
          id="file-upload"
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept={acceptedFileTypes}
        />
        {!previewUrl ? (
          <Label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center space-y-2 cursor-pointer"
          >
            <UploadCloud className={`h-12 w-12 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
            <span className="text-sm font-medium">
              Drag & drop an image or click to browse
            </span>
            <span className="text-xs text-muted-foreground">
              PNG, JPG, GIF up to 10MB
            </span>
          </Label>
        ) : (
          <div className="relative group aspect-video w-full max-w-md mx-auto">
            <Image src={previewUrl} alt="Preview" layout="fill" objectFit="contain" className="rounded-md" />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={clearSelection}
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      {selectedFile && !previewUrl && (
         <div className="flex items-center space-x-2 p-2 border rounded-md bg-muted">
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground truncate flex-1">{selectedFile.name}</span>
            <Button variant="ghost" size="icon" onClick={clearSelection} aria-label="Remove image">
              <X className="h-4 w-4" />
            </Button>
          </div>
      )}
    </div>
  );
}
