import React, { useState, useCallback } from 'react';
import SimliElevenLabsAvatar from './SimliElevenLabsAvatar';

export const SimliElevenLabsAvatarView = ({ 
  agentId,
  faceId = "0c2b8b04-5274-41f1-a21c-d5c98322efa9",
  className = "",
  onConnectionChange = () => {},
  onSpeakingChange = () => {}
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleConnectionChange = useCallback((connected) => {
    setIsConnected(connected);
    onConnectionChange(connected);
  }, [onConnectionChange]);

  const handleSpeakingChange = useCallback((speaking) => {
    setIsSpeaking(speaking);
    onSpeakingChange(speaking);
  }, [onSpeakingChange]);

  if (!agentId) {
    return (
      <div className={`w-full h-full relative ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-purple-100" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl shadow-lg text-center">
            <div className="text-red-500 text-lg font-bold mb-2">No Agent ID</div>
            <div className="text-gray-600 text-sm">
              Please provide an ElevenLabs agent ID to start the conversation
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full h-full relative ${className}`}>
      {/* Background gradient similar to original AvatarView */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-purple-100" />
      
      {/* Simli + ElevenLabs Avatar Container */}
      <div className="relative w-full h-full">
        <SimliElevenLabsAvatar
          agentId={agentId}
          faceId={faceId}
          className="w-full h-full"
          onConnectionChange={handleConnectionChange}
          onSpeakingChange={handleSpeakingChange}
          autoStart={true}
        />
      </div>

      {/* Status Overlay */}
      <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-400' : 'bg-red-400'
          }`} />
          <span>
            {isConnected ? 'Ready to Chat' : 'Connecting...'}
          </span>
        </div>
        {isSpeaking && isConnected && (
          <div className="text-xs text-green-300 mt-1 flex items-center gap-1">
            <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
            AI Speaking
          </div>
        )}
      </div>

      {/* Instructions overlay when not connected */}
      {!isConnected && (
        <div className="absolute bottom-4 left-4 right-4 bg-black/80 text-white p-4 rounded-lg">
          <div className="text-sm">
            <div className="font-medium mb-2">Setting up AI conversation...</div>
            <div className="text-xs text-gray-300 space-y-1">
              <div>• Connecting to Simli for photorealistic avatar</div>
              <div>• Connecting to ElevenLabs for AI conversation</div>
              <div>• Setting up microphone for voice input</div>
            </div>
          </div>
        </div>
      )}

      {/* Microphone Permission Notice */}
      {isConnected && (
        <div className="absolute bottom-4 right-4 bg-blue-600/80 text-white px-3 py-2 rounded-lg text-xs">
          🎤 Microphone Active
        </div>
      )}
    </div>
  );
};

export default SimliElevenLabsAvatarView;