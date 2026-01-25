import React, { useState, useEffect } from 'react';
import { AlertTriangle, Info } from 'lucide-react';

interface UsageTrackerProps {
  isVisible?: boolean;
}

const UsageTracker: React.FC<UsageTrackerProps> = ({ isVisible = true }) => {
  const [estimatedUsage, setEstimatedUsage] = useState(0);
  const [sessionStart, setSessionStart] = useState<Date | null>(null);

  useEffect(() => {
    // Reset usage tracking when component mounts
    setEstimatedUsage(0);
    setSessionStart(new Date());
  }, []);

  const addUsage = (characters: number) => {
    setEstimatedUsage(prev => prev + characters);
  };

  const getUsageColor = () => {
    if (estimatedUsage > 8000) return 'text-red-500';
    if (estimatedUsage > 5000) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getUsageWarning = () => {
    if (estimatedUsage > 8000) {
      return {
        icon: AlertTriangle,
        message: 'High usage - approaching free tier limit',
        color: 'bg-red-100 border-red-500 text-red-700'
      };
    }
    if (estimatedUsage > 5000) {
      return {
        icon: AlertTriangle,
        message: 'Moderate usage - monitor your quota',
        color: 'bg-yellow-100 border-yellow-500 text-yellow-700'
      };
    }
    return {
      icon: Info,
      message: 'Usage within normal range',
      color: 'bg-green-100 border-green-500 text-green-700'
    };
  };

  if (!isVisible) return null;

  const warning = getUsageWarning();
  const Icon = warning.icon;

  return (
    <div className="fixed bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg border-[2px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-xs font-mono z-50 max-w-xs">
      <div className="font-bold mb-2 flex items-center gap-2">
        <Icon size={16} />
        ElevenLabs Usage
      </div>
      
      <div className="space-y-1">
        <div className={`font-bold ${getUsageColor()}`}>
          ~{estimatedUsage.toLocaleString()} characters
        </div>
        
        <div className="text-gray-600">
          Free tier: 10,000/month
        </div>
        
        {sessionStart && (
          <div className="text-gray-500">
            Session: {Math.round((Date.now() - sessionStart.getTime()) / 1000)}s
          </div>
        )}
      </div>

      <div className={`mt-2 p-2 rounded border ${warning.color} text-xs`}>
        <Icon size={12} className="inline mr-1" />
        {warning.message}
      </div>

      <div className="mt-2 text-gray-500 text-xs">
        <a 
          href="https://elevenlabs.io/usage" 
          target="_blank" 
          rel="noopener noreferrer"
          className="underline hover:text-blue-600"
        >
          Check actual usage →
        </a>
      </div>
    </div>
  );
};

export default UsageTracker;