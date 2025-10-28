import { AnalysisResult } from "@/utils/phishingDetection";
import { RiskScore } from "./RiskScore";
import { AlertCircle, CheckCircle, Download, FileText, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateReport } from "@/utils/phishingDetection";

interface AnalysisResultsProps {
  result: AnalysisResult;
  input: string;
  type: 'url' | 'message';
}

export function AnalysisResults({ result, input, type }: AnalysisResultsProps) {
  const handleDownloadReport = () => {
    const report = generateReport(result, input, type);
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `garuda-analysis-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Risk Score */}
      <RiskScore score={result.riskScore} level={result.riskLevel} />

      {/* Details */}
      <div className="bg-card border border-card-border rounded-[20px] shadow-apple p-8">
        <div className="flex items-center gap-2 mb-6">
          <FileText className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-semibold">Analysis Details</h3>
        </div>

        <div className="space-y-3">
          {result.details.map((detail, index) => {
            const isPositive = detail.includes('✅');
            const isWarning = detail.includes('⚠️');
            const isCritical = detail.includes('🚨');
            
            return (
              <div
                key={index}
                className={`flex items-start gap-3 p-4 rounded-xl transition-apple ${
                  isPositive ? 'bg-success/5' :
                  isWarning ? 'bg-warning/5' :
                  isCritical ? 'bg-destructive/5' :
                  'bg-muted/50'
                }`}
              >
                {isPositive ? (
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    isCritical ? 'text-destructive' : 'text-warning'
                  }`} />
                )}
                <p className="text-sm leading-relaxed">{detail}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      {result.suggestions.length > 0 && (
        <div className="bg-card border border-card-border rounded-[20px] shadow-apple p-8">
          <div className="flex items-center gap-2 mb-6">
            <Lightbulb className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold">Recommendations</h3>
          </div>

          <div className="space-y-3">
            {result.suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-xl bg-primary/5"
              >
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-semibold text-primary">{index + 1}</span>
                </div>
                <p className="text-sm leading-relaxed">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleDownloadReport}
          variant="outline"
          size="lg"
          className="h-12 px-8 rounded-xl border-card-border hover:border-primary hover:bg-primary/5 transition-apple"
        >
          <Download className="w-4 h-4 mr-2" />
          Export JSON Report
        </Button>
      </div>
    </div>
  );
}
