import React, { useCallback, useRef, useState, useEffect } from 'react';
import { SimliClient } from 'simli-client';

const SimliAvatar = ({ faceId, className = "" }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState("");

  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const simliClientRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Clean up function
  const cleanup = useCallback(() => {
    console.log("Cleaning up Simli client...");
    
    if (simliClientRef.current) {
      try {
        simliClientRef.current.ClearBuffer();
        simliClientRef.current.close();
      } catch (error) {
        console.warn("Error during cleanup:", error);
      }
      simliClientRef.current = null;
    }
    
    isInitializedRef.current = false;
    setIsConnected(false);
    setIsLoading(false);
    setError("");
  }, []);

  // Initialize Simli client
  const initializeSimliClient = useCallback(() => {
    // Always cleanup first
    cleanup();
    
    if (videoRef.current && audioRef.current && !isInitializedRef.current) {
      console.log("Initializing new Simli client...");
      
      const simliConfig = {
        apiKey: import.meta.env.VITE_SIMLI_API_KEY,
        faceID: faceId,
        handleSilence: true,
        videoRef: videoRef.current,
        audioRef: audioRef.current,
      };

      simliClientRef.current = new SimliClient();
      simliClientRef.current.Initialize(simliConfig);
      isInitializedRef.current = true;
      console.log("Simli Client initialized with face ID:", faceId);
    }
  }, [faceId, cleanup]);

  // Start the avatar
  const startAvatar = useCallback(async () => {
    console.log("Starting avatar...");
    setIsLoading(true);
    setError("");

    try {
      // Always reinitialize on start
      initializeSimliClient();
      
      if (!simliClientRef.current) {
        throw new Error("Failed to initialize Simli client");
      }

      // Set up event listeners
      simliClientRef.current.on("connected", () => {
        console.log("SimliClient connected");
        setIsConnected(true);
        setIsLoading(false);
        
        // Send initial audio data to establish connection
        const audioData = new Uint8Array(6000).fill(0);
        simliClientRef.current.sendAudioData(audioData);
      });

      simliClientRef.current.on("disconnected", () => {
        console.log("SimliClient disconnected");
        setIsConnected(false);
      });

      simliClientRef.current.on("error", (error) => {
        console.error("SimliClient error:", error);
        setError(`Connection error: ${error.message || error}`);
        setIsLoading(false);
        setIsConnected(false);
      });

      // Start the client
      await simliClientRef.current.start();
    } catch (error) {
      console.error("Error starting Simli avatar:", error);
      setError(`Error starting avatar: ${error.message}`);
      setIsLoading(false);
      setIsConnected(false);
    }
  }, [initializeSimliClient]);

  // Stop the avatar
  const stopAvatar = useCallback(() => {
    console.log("Stopping avatar...");
    cleanup();
  }, [cleanup]);

  // Send audio data to avatar (for future use with audio input)
  const sendAudioData = useCallback((audioData) => {
    if (simliClientRef.current && isConnected) {
      simliClientRef.current.sendAudioData(audioData);
    }
  }, [isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAvatar();
    };
  }, [stopAvatar]);

  return (
    <div className={`relative ${className}`}>
      {/* Video container */}
      <div className="aspect-video flex rounded-lg overflow-hidden items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200 relative">
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isConnected ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <audio ref={audioRef} autoPlay />
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-white font-bold text-sm">Loading Avatar...</span>
            </div>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center z-10">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded max-w-xs text-center">
              <p className="font-bold text-sm">Error</p>
              <p className="text-xs">{error}</p>
            </div>
          </div>
        )}

        {/* Placeholder when not connected */}
        {!isConnected && !isLoading && !error && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm font-medium">Simli Avatar Ready</p>
              <p className="text-gray-400 text-xs">Click Start to begin</p>
            </div>
          </div>
        )}

        {/* Connection status indicator */}
        {isConnected && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            Live
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-4 flex gap-2">
        {!isConnected ? (
          <button
            onClick={startAvatar}
            disabled={isLoading}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            {isLoading ? "Starting..." : "Start Avatar"}
          </button>
        ) : (
          <button
            onClick={stopAvatar}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
          >
            Stop Avatar
          </button>
        )}
      </div>
    </div>
  );
};

export default SimliAvatar;