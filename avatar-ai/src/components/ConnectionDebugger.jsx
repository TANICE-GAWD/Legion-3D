import React from 'react';

const ConnectionDebugger = ({ 
  isSimliConnected, 
  isElevenLabsConnected, 
  isLoading, 
  error, 
  agentId 
}) => {
  if (!import.meta.env.DEV) {
    return null; // Only show in development
  }

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50 max-w-xs">
      <div className="font-bold mb-2">Connection Debug</div>
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isSimliConnected ? 'bg-green-400' : 'bg-red-400'}`} />
          <span>Simli: {isSimliConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isElevenLabsConnected ? 'bg-blue-400' : 'bg-red-400'}`} />
          <span>ElevenLabs: {isElevenLabsConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-400 animate-pulse' : 'bg-gray-400'}`} />
          <span>Loading: {isLoading ? 'Yes' : 'No'}</span>
        </div>
        {agentId && (
          <div className="text-gray-300 mt-2">
            Agent: {agentId.slice(-8)}
          </div>
        )}
        {error && (
          <div className="text-red-300 mt-2 text-wrap">
            Error: {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConnectionDebugger;