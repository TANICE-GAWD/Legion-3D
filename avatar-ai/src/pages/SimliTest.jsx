import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import SimliAvatar from '../components/SimliAvatar';

export const SimliTest = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const handleConnectionChange = (connected) => {
    setIsConnected(connected);
  };

  const toggleSpeaking = () => {
    setIsSpeaking(!isSpeaking);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-white mb-4">
              Simli Avatar Test
            </h1>
            <p className="text-white/80 text-lg">
              Test the Simli avatar integration independently
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Avatar Display */}
            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              <h2 className="text-2xl font-bold mb-4 text-center">Avatar Display</h2>
              <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
                <SimliAvatar
                  faceId="0c2b8b04-5274-41f1-a21c-d5c98322efa9"
                  className="w-full h-full"
                  onConnectionChange={handleConnectionChange}
                  autoStart={true}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-2xl p-6 shadow-2xl">
              <h2 className="text-2xl font-bold mb-4">Controls</h2>
              
              <div className="space-y-4">
                {/* Connection Status */}
                <div className="p-4 rounded-lg bg-gray-50">
                  <h3 className="font-bold mb-2">Connection Status</h3>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      isConnected ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <span className={isConnected ? 'text-green-700' : 'text-red-700'}>
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>

                {/* Speaking Control */}
                <div className="p-4 rounded-lg bg-gray-50">
                  <h3 className="font-bold mb-2">Speaking Simulation</h3>
                  <button
                    onClick={toggleSpeaking}
                    disabled={!isConnected}
                    className={`w-full py-3 px-4 rounded-lg font-bold transition-colors ${
                      isSpeaking
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-green-500 hover:bg-green-600 text-white'
                    } disabled:bg-gray-300 disabled:cursor-not-allowed`}
                  >
                    {isSpeaking ? 'Stop Speaking' : 'Start Speaking'}
                  </button>
                  <p className="text-sm text-gray-600 mt-2">
                    {isSpeaking 
                      ? 'Avatar should be animating with synthetic speech audio'
                      : 'Click to simulate AI speaking and animate the avatar'
                    }
                  </p>
                </div>

                {/* Manual Controls */}
                <div className="p-4 rounded-lg bg-gray-50">
                  <h3 className="font-bold mb-2">Manual Controls</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.simliAvatar?.start()}
                      className="flex-1 py-2 px-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium"
                    >
                      Connect
                    </button>
                    <button
                      onClick={() => window.simliAvatar?.stop()}
                      className="flex-1 py-2 px-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>

                {/* Instructions */}
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <h3 className="font-bold mb-2 text-blue-800">Setup Instructions</h3>
                  <ol className="text-sm text-blue-700 space-y-1">
                    <li>1. Add your VITE_SIMLI_API_KEY to the .env file</li>
                    <li>2. Ensure you have Simli credits in your account</li>
                    <li>3. Wait for the avatar to connect (green status)</li>
                    <li>4. Click "Start Speaking" to test animation</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Debug Info */}
          <div className="mt-8 bg-black/80 text-white p-4 rounded-xl">
            <h3 className="font-bold mb-2">Debug Information</h3>
            <div className="text-sm font-mono space-y-1">
              <div>Connection Status: {isConnected ? 'Connected' : 'Disconnected'}</div>
              <div>Speaking Status: {isSpeaking ? 'Speaking' : 'Silent'}</div>
              <div>API Key Set: {import.meta.env.VITE_SIMLI_API_KEY ? 'Yes' : 'No'}</div>
              <div>Window Object: {typeof window.simliAvatar !== 'undefined' ? 'Available' : 'Not Available'}</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SimliTest;