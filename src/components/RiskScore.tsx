import { AlertCircle, AlertTriangle, CheckCircle, Shield, XCircle } from "lucide-react";

interface RiskScoreProps {
  score: number;
  level: 'safe' | 'low' | 'medium' | 'high' | 'critical';
}

const RISK_CONFIG = {
  safe: {
    color: 'text-success',
    bg: 'bg-success/10',
    icon: CheckCircle,
    label: 'Safe',
    description: 'No significant threats detected',
  },
  low: {
    color: 'text-success',
    bg: 'bg-success/10',
    icon: Shield,
    label: 'Low Risk',
    description: 'Minor concerns, proceed with caution',
  },
  medium: {
    color: 'text-warning',
    bg: 'bg-warning/10',
    icon: AlertCircle,
    label: 'Medium Risk',
    description: 'Several suspicious indicators found',
  },
  high: {
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    icon: AlertTriangle,
    label: 'High Risk',
    description: 'Likely phishing attempt detected',
  },
  critical: {
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    icon: XCircle,
    label: 'Critical Risk',
    description: 'Definite phishing attack - DO NOT PROCEED',
  },
};

export function RiskScore({ score, level }: RiskScoreProps) {
  const config = RISK_CONFIG[level];
  const Icon = config.icon;
  
  // Calculate circle progress
  const circumference = 2 * Math.PI * 54;
  const progress = circumference - (score / 100) * circumference;

  return (
    <div className="bg-card border border-card-border rounded-[20px] shadow-apple p-8">
      <div className="flex flex-col items-center">
        {/* Circular progress indicator */}
        <div className="relative w-32 h-32 mb-6">
          <svg className="transform -rotate-90 w-32 h-32">
            {/* Background circle */}
            <circle
              cx="64"
              cy="64"
              r="54"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-muted"
            />
            {/* Progress circle */}
            <circle
              cx="64"
              cy="64"
              r="54"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={progress}
              className={`${config.color} transition-all duration-1000 ease-out`}
              strokeLinecap="round"
            />
          </svg>
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${config.color}`}>{score}</span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
        </div>

        {/* Risk level badge */}
        <div className={`flex items-center gap-2 ${config.bg} px-6 py-3 rounded-full mb-2`}>
          <Icon className={`w-5 h-5 ${config.color}`} />
          <span className={`font-semibold ${config.color}`}>{config.label}</span>
        </div>

        {/* Description */}
        <p className="text-center text-sm text-muted-foreground max-w-xs">
          {config.description}
        </p>
      </div>
    </div>
  );
}
