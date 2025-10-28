import { useState, useCallback } from "react";
import { Upload, Image as ImageIcon, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createWorker } from 'tesseract.js';
import { analyzeMessage } from "@/utils/phishingDetection";
import { toast } from "sonner";

interface OCRAnalysisProps {
  onAnalysisComplete: (result: any, input: string, type: 'message') => void;
}

export function OCRAnalysis({ onAnalysisComplete }: OCRAnalysisProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      const imageData = e.target?.result as string;
      setPreview(imageData);

      try {
        toast.info('Extracting text from image...', {
          description: 'Using client-side OCR for privacy',
        });

        const worker = await createWorker('eng');
        const { data: { text } } = await worker.recognize(imageData);
        await worker.terminate();

        if (text.trim().length === 0) {
          toast.error('No text detected in image');
          setIsProcessing(false);
          return;
        }

        toast.success('Text extracted successfully', {
          description: 'Analyzing for phishing indicators...',
        });

        const result = analyzeMessage(text);
        onAnalysisComplete(result, text, 'message');
      } catch (error) {
        console.error('OCR Error:', error);
        toast.error('Failed to process image', {
          description: 'Please try again with a clearer image',
        });
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsDataURL(file);
  }, [onAnalysisComplete]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }, [handleFileUpload]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-card border border-card-border rounded-[20px] shadow-apple-lg p-8 transition-apple">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold mb-2 tracking-tight">
            Screenshot Analysis
          </h2>
          <p className="text-muted-foreground text-sm">
            Privacy-first OCR • All processing done locally in your browser
          </p>
        </div>

        {preview ? (
          <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden border border-card-border">
              <img src={preview} alt="Preview" className="w-full h-auto" />
              {isProcessing && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                    <p className="text-sm font-medium">Extracting text...</p>
                  </div>
                </div>
              )}
            </div>
            <Button
              onClick={() => {
                setPreview(null);
                setIsProcessing(false);
              }}
              variant="outline"
              className="w-full h-12 rounded-xl"
              disabled={isProcessing}
            >
              Upload Different Image
            </Button>
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-card-border rounded-xl p-12 text-center hover:border-primary/50 transition-apple cursor-pointer bg-muted/20"
          >
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept="image/*"
              onChange={handleFileInput}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">
                Drop image here or click to upload
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                Supports JPG, PNG, WebP • Maximum 10MB
              </p>
              <Button type="button" className="rounded-xl">
                <FileText className="w-4 h-4 mr-2" />
                Choose File
              </Button>
            </label>
          </div>
        )}

        <div className="mt-6 p-4 rounded-xl bg-muted/50 border border-card-border">
          <p className="text-xs text-muted-foreground text-center">
            🔒 <strong>Privacy Protected:</strong> OCR processing happens entirely in your browser.
            No images are uploaded to any server.
          </p>
        </div>
      </div>
    </div>
  );
}
