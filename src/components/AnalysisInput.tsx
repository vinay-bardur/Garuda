import { useState } from "react";
import { Link, Mail, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AnalysisInputProps {
  onAnalyze: (input: string, type: 'url' | 'message') => void;
  isAnalyzing: boolean;
}

export function AnalysisInput({ onAnalyze, isAnalyzing }: AnalysisInputProps) {
  const [urlInput, setUrlInput] = useState('');
  const [messageInput, setMessageInput] = useState('');

  const handleURLAnalysis = () => {
    if (urlInput.trim()) {
      onAnalyze(urlInput, 'url');
    }
  };

  const handleMessageAnalysis = () => {
    if (messageInput.trim()) {
      onAnalyze(messageInput, 'message');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="bg-card border border-card-border rounded-[20px] shadow-apple-lg p-8 transition-apple hover-lift">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-semibold mb-2 tracking-tight">
            Analyze Suspicious Content
          </h2>
          <p className="text-muted-foreground">
            Privacy-first phishing detection powered by client-side AI
          </p>
        </div>

        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="url" className="gap-2">
              <Link className="w-4 h-4" />
              URL Analysis
            </TabsTrigger>
            <TabsTrigger value="message" className="gap-2">
              <Mail className="w-4 h-4" />
              Message Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="url-input" className="text-sm font-medium">
                Suspicious URL
              </Label>
              <Input
                id="url-input"
                type="text"
                placeholder="https://suspicious-website.com"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="h-12 rounded-xl border-input-border bg-input"
                onKeyDown={(e) => e.key === 'Enter' && handleURLAnalysis()}
              />
            </div>
            <Button
              onClick={handleURLAnalysis}
              disabled={!urlInput.trim() || isAnalyzing}
              className="w-full h-12 rounded-xl font-medium shadow-apple hover:shadow-apple-lg transition-apple"
              size="lg"
            >
              <Search className="w-4 h-4 mr-2" />
              {isAnalyzing ? 'Analyzing...' : 'Analyze URL'}
            </Button>
          </TabsContent>

          <TabsContent value="message" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="message-input" className="text-sm font-medium">
                Email or Message Content
              </Label>
              <Textarea
                id="message-input"
                placeholder="Paste the suspicious email or message here..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="min-h-[160px] rounded-xl border-input-border bg-input resize-none"
              />
            </div>
            <Button
              onClick={handleMessageAnalysis}
              disabled={!messageInput.trim() || isAnalyzing}
              className="w-full h-12 rounded-xl font-medium shadow-apple hover:shadow-apple-lg transition-apple"
              size="lg"
            >
              <Search className="w-4 h-4 mr-2" />
              {isAnalyzing ? 'Analyzing...' : 'Analyze Message'}
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
