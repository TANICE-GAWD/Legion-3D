import React, { useState, useEffect, useRef, useCallback } from 'react';
import SimliAvatar from './SimliAvatar';

export const SimliAvatarView = ({ 
  isSpeaking = false, 
  faceId = "0c2b8b04-5274-41f1-a21c-d5c98322efa9",
  className = "",
  onConnectionChange = () => {}
}) => {
  const [isAvatarConnected, setIsAvatarConnected] = useState(false);
  const simliAvatarRef = useRef(null);

  // Handle connection status changes
  const handleConnectionChange = useCallback((connected) => {
    setIsAvatarConnected(connected);
    onConnectionChange(connected);
  }, [onConnectionChange]);

  // Generate audio data when speaking to animate the avatar
  useEffect(() => {
    if (!isSpeaking || !isAvatarConnected) {
      return;
    }

    // Generate realistic audio data for lip sync
    const generateSpeechAudio = () => {
      const sampleRate = 16000;
      const duration = 0.05; // 50ms chunks for smooth animation
      const samples = Math.floor(sampleRate * duration);
      const audioData = new Uint8Array(samples * 2); // 16-bit audio
      
      for (let i = 0; i < samples; i++) {
        // Generate more realistic speech-like audio with multiple frequencies
        const t = i / sampleRate;
        const fundamental = 150; // Base frequency for speech
        const harmonics = [1, 0.5, 0.3, 0.2]; // Harmonic amplitudes
        
        let sample = 0;
        harmonics.forEach((amp, idx) => {
          const freq = fundamental * (idx + 1);
          sample += amp * Math.sin(2 * Math.PI * freq * t);
        });
        
        // Add some noise for realism
        sample += (Math.random() - 0.5) * 0.1;
        
        // Modulate amplitude to simulate speech patterns
        const envelope = Math.sin(t * 10) * 0.5 + 0.5;
        sample *= envelope * 0.3;
        
        // Convert to 16-bit integer
        const intSample = Math.max(-32767, Math.min(32767, Math.floor(sample * 32767)));
        
        // Store as little-endian 16-bit
        audioData[i * 2] = intSample & 0xFF;
        audioData[i * 2 + 1] = (intSample >> 8) & 0xFF;
      }
      
      return audioData;
    };

    // Send audio data at regular intervals while speaking
    const interval = setInterval(() => {
      if (window.simliAvatar && window.simliAvatar.isConnected && isSpeaking) {
        const speechAudio = generateSpeechAudio();
        window.simliAvatar.sendAudio(speechAudio);
      }
    }, 50); // 50ms intervals for smooth animation

    return () => clearInterval(interval);
  }, [isSpeaking, isAvatarConnected]);

  // Send silence when not speaking to reset avatar mouth
  useEffect(() => {
    if (!isSpeaking && isAvatarConnected && window.simliAvatar) {
      // Send a small amount of silence to reset the avatar
      const silenceData = new Uint8Array(1600).fill(0); // 50ms of silence
      window.simliAvatar.sendAudio(silenceData);
    }
  }, [isSpeaking, isAvatarConnected]);

  return (
    <div className={`w-full h-full relative ${className}`}>
      {/* Background gradient similar to original AvatarView */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-purple-100" />
      
      {/* Simli Avatar Container */}
      <div className="relative w-full h-full">
        <SimliAvatar
          ref={simliAvatarRef}
          faceId={faceId}
          className="w-full h-full"
          onConnectionChange={handleConnectionChange}
          autoStart={true}
        />
      </div>

      {/* Status Overlay */}
      <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            isAvatarConnected ? 'bg-green-400' : 'bg-red-400'
          }`} />
          <span>
            {isAvatarConnected ? 'Avatar Ready' : 'Connecting...'}
          </span>
        </div>
        {isSpeaking && isAvatarConnected && (
          <div className="text-xs text-green-300 mt-1 flex items-center gap-1">
            <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
            Speaking
          </div>
        )}
      </div>

      {/* Instructions overlay when not connected */}
      {!isAvatarConnected && (
        <div className="absolute bottom-4 left-4 right-4 bg-black/80 text-white p-4 rounded-lg">
          <div className="text-sm">
            <div className="font-medium mb-2">Setting up your Simli avatar...</div>
            <div className="text-xs text-gray-300">
              Make sure you have added your VITE_SIMLI_API_KEY to the .env file
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimliAvatarView;