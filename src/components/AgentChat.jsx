import React, { useCallback, useState, useEffect } from 'react';
import { useConversation } from '@elevenlabs/react';

export const AgentChat = ({ agentId, onSpeakingChange }) => {
  const [error, setError] = useState(null);
  
  // 1. Initialize the SDK Hook
  const conversation = useConversation({
    onConnect: () => console.log('Connected'),
    onDisconnect: () => console.log('Disconnected'),
    onMessage: (message) => console.log('Message:', message),
    onError: (e) => {
      console.error('ElevenLabs Error:', e);
      setError(e.message || 'Unknown error');
    },
  });

  const { status, isSpeaking } = conversation;

  // Sync speaking state with parent
  useEffect(() => {
    if (onSpeakingChange) {
      onSpeakingChange(isSpeaking);
    }
  }, [isSpeaking, onSpeakingChange]);

  // 2. Direct Connection Logic (No Backend)
  const connectToAgent = useCallback(async () => {
    try {
      if (status === 'connected') {
        await conversation.endSession();
        return;
      }

      // --- STEP A: Get Signed URL directly from Frontend ---
      // ⚠️ WARNING: This exposes your API Key to the browser network tab
      const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY; 
      
      if (!apiKey) {
        throw new Error("Missing API Key in .env file");
      }

      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
        {
          method: 'GET',
          headers: {
            'xi-api-key': apiKey, // <--- Key used directly here
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to auth: ${response.statusText}`);
      }

      const data = await response.json();

      // --- STEP B: Connect with the signed URL ---
      await conversation.startSession({
        signedUrl: data.signed_url, 
      });

    } catch (err) {
      console.error('Connection failed:', err);
      setError('Connection failed. Check console.');
    }
  }, [conversation, status, agentId]);

  return (
    <div className="flex flex-col items-center gap-4 p-6 border rounded-lg shadow-sm bg-white max-w-sm mx-auto">
      
      {/* Status Circle */}
      <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-colors ${
        status === 'connected' 
          ? 'bg-green-100 border-4 border-green-500' 
          : 'bg-gray-100 border-4 border-gray-300'
      }`}>
        <span className="text-3xl">
          {status === 'connected' ? (isSpeaking ? '🗣️' : '👂') : '😴'}
        </span>
      </div>

      <div className="text-center">
        <h3 className="font-bold text-lg">NeuroPal Agent</h3>
        <p className="text-sm text-gray-500">
          {status === 'connected' ? 'Listening...' : 'Tap to start'}
        </p>
      </div>

      {/* Main Control Button */}
      <button
        onClick={connectToAgent}
        disabled={status === 'connecting'}
        className={`px-8 py-3 rounded-full font-bold text-white transition-all transform hover:scale-105 ${
          status === 'connected'
            ? 'bg-red-500 hover:bg-red-600 shadow-red-200'
            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
        } shadow-lg disabled:opacity-70 disabled:cursor-not-allowed`}
      >
        {status === 'connecting' ? 'Connecting...' : status === 'connected' ? 'End Chat' : 'Start Chat'}
      </button>

      {error && (
        <div className="text-red-500 text-xs text-center px-2">
          {error}
        </div>
      )}
    </div>
  );
};
