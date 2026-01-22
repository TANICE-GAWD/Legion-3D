import React, { useCallback, useRef, useState, useEffect } from "react";
import { SimliClient } from "simli-client";

const SimliAvatar = ({ 
  faceId = "0c2b8b04-5274-41f1-a21c-d5c98322efa9", // Default face ID
  className = "",
  onConnectionChange = () => {},
  autoStart = false 
}) => {
  // State management
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  // Refs
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const simliClientRef = useRef(null);
  const connectionTimeoutRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  /**
   * Initializes the Simli client with proper error handling and connection management
   */
  const initializeSimliClient = useCallback(() => {
    if (!videoRef.current || !audioRef.current) {
      console.error("Video or audio ref not available");
      return false;
    }

    if (!import.meta.env.VITE_SIMLI_API_KEY) {
      setError("Simli API key not found. Please add VITE_SIMLI_API_KEY to your .env file");
      return false;
    }

    try {
      // Clean up any existing client
      if (simliClientRef.current) {
        try {
          simliClientRef.current.ClearBuffer();
          simliClientRef.current.close();
        } catch (e) {
          console.warn("Error cleaning up previous client:", e);
        }
      }

      // Create new SimliClient instance
      simliClientRef.current = new SimliClient();

      const SimliConfig = {
        apiKey: import.meta.env.VITE_SIMLI_API_KEY,
        faceID: faceId,
        handleSilence: true,
        videoRef: videoRef.current,
        audioRef: audioRef.current,
      };

      simliClientRef.current.Initialize(SimliConfig);
      console.log("Simli Client initialized successfully");
      return true;
    } catch (error) {
      console.error("Failed to initialize Simli client:", error);
      setError(`Failed to initialize: ${error.message}`);
      return false;
    }
  }, [faceId]);

  /**
   * Starts the Simli connection with robust error handling and retry logic
   */
  const startConnection = useCallback(async () => {
    // Prevent multiple simultaneous connection attempts
    if (isLoading || isConnected) {
      console.log("Connection already in progress or established");
      return;
    }

    // Limit retry attempts to prevent infinite loops
    if (connectionAttempts >= 3) {
      setError("Maximum connection attempts reached. Please refresh the page.");
      return;
    }

    if (!simliClientRef.current) {
      if (!initializeSimliClient()) {
        return;
      }
    }

    setIsLoading(true);
    setError("");
    setConnectionAttempts(prev => prev + 1);

    // Set a connection timeout
    connectionTimeoutRef.current = setTimeout(() => {
      if (isLoading && !isConnected) {
        console.error("Connection timeout");
        setError("Connection timeout. Retrying...");
        setIsLoading(false);
        
        // Auto-retry after timeout
        retryTimeoutRef.current = setTimeout(() => {
          startConnection();
        }, 2000);
      }
    }, 15000); // 15 second timeout

    try {
      // Set up event listeners with proper error handling
      simliClientRef.current.on("connected", () => {
        console.log("SimliClient connected successfully");
        
        // Clear timeout since we connected successfully
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }

        setIsConnected(true);
        setIsLoading(false);
        setConnectionAttempts(0); // Reset attempts on successful connection
        onConnectionChange(true);

        // Send initial silence to establish connection properly
        // This helps prevent the "credits used but no video" issue
        setTimeout(() => {
          if (simliClientRef.current && isConnected) {
            const silenceData = new Uint8Array(1024).fill(0);
            simliClientRef.current.sendAudioData(silenceData);
            console.log("Sent initial silence data");
          }
        }, 500);
      });

      simliClientRef.current.on("disconnected", () => {
        console.log("SimliClient disconnected");
        setIsConnected(false);
        setIsLoading(false);
        onConnectionChange(false);
        
        // Clear any pending timeouts
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }
      });

      simliClientRef.current.on("error", (error) => {
        console.error("SimliClient error:", error);
        setError(`Connection error: ${error.message || error}`);
        setIsLoading(false);
        setIsConnected(false);
        onConnectionChange(false);
        
        // Clear timeout on error
        if (connectionTimeoutRef.current) {
          clearTimeout(connectionTimeoutRef.current);
          connectionTimeoutRef.current = null;
        }

        // Auto-retry on certain errors
        if (connectionAttempts < 3) {
          retryTimeoutRef.current = setTimeout(() => {
            console.log("Auto-retrying connection after error...");
            startConnection();
          }, 3000);
        }
      });

      // Start the connection
      await simliClientRef.current.start();
      console.log("Simli connection start initiated");
    } catch (error) {
      console.error("Error starting Simli connection:", error);
      setError(`Failed to start: ${error.message}`);
      setIsLoading(false);
      setIsConnected(false);
      onConnectionChange(false);
      
      // Clear timeout on error
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }

      // Auto-retry on connection failure
      if (connectionAttempts < 3) {
        retryTimeoutRef.current = setTimeout(() => {
          console.log("Auto-retrying connection after failure...");
          startConnection();
        }, 3000);
      }
    }
  }, [initializeSimliClient, onConnectionChange, isLoading, isConnected, connectionAttempts]);

  /**
   * Stops the Simli connection cleanly
   */
  const stopConnection = useCallback(() => {
    console.log("Stopping Simli connection...");
    
    // Clear any pending timeouts
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current);
      connectionTimeoutRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    if (simliClientRef.current) {
      try {
        simliClientRef.current.ClearBuffer();
        simliClientRef.current.close();
        simliClientRef.current = null;
      } catch (error) {
        console.error("Error stopping Simli connection:", error);
      }
    }
    
    setIsConnected(false);
    setIsLoading(false);
    setError("");
    setConnectionAttempts(0);
    onConnectionChange(false);
    console.log("Simli connection stopped");
  }, [onConnectionChange]);

  /**
   * Sends audio data to Simli for avatar animation with error handling
   */
  const sendAudioData = useCallback((audioData) => {
    if (simliClientRef.current && isConnected) {
      try {
        simliClientRef.current.sendAudioData(audioData);
      } catch (error) {
        console.error("Error sending audio data:", error);
        // Don't set error state for audio send failures to avoid UI disruption
      }
    }
  }, [isConnected]);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        startConnection();
      }, 100);
      
      return () => clearTimeout(timer);
    }

    // Cleanup on unmount
    return () => {
      stopConnection();
    };
  }, [autoStart, startConnection, stopConnection]);

  // Expose methods to parent component via window object for easy access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.simliAvatar = {
        start: startConnection,
        stop: stopConnection,
        sendAudio: sendAudioData,
        isConnected,
        isLoading,
        connectionAttempts
      };
    }
  }, [startConnection, stopConnection, sendAudioData, isConnected, isLoading, connectionAttempts]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Video Container */}
      <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
        {/* Video Element */}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted={false}
          className="w-full h-full object-cover"
          style={{ 
            transform: 'scaleX(-1)', // Mirror the video for natural interaction
            backgroundColor: '#1a1a1a'
          }}
          onLoadStart={() => console.log("Video loading started")}
          onCanPlay={() => console.log("Video can play")}
          onError={(e) => console.error("Video error:", e)}
        />
        
        {/* Audio Element (hidden) */}
        <audio 
          ref={audioRef} 
          autoPlay 
          className="hidden"
          onError={(e) => console.error("Audio error:", e)}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-white font-medium">
                Connecting to avatar... (Attempt {connectionAttempts}/3)
              </span>
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {error && (
          <div className="absolute inset-0 bg-red-900/80 flex items-center justify-center p-4">
            <div className="text-center">
              <div className="text-red-200 font-medium mb-2">Connection Error</div>
              <div className="text-red-100 text-sm mb-3">{error}</div>
              {connectionAttempts < 3 && (
                <button 
                  onClick={startConnection}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Retrying...' : 'Retry Connection'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Connection Status Indicator */}
        <div className="absolute top-3 right-3">
          <div className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 
            isLoading ? 'bg-yellow-500 animate-pulse' : 
            'bg-red-500'
          }`} />
        </div>

        {/* Manual Controls (for testing) */}
        {!autoStart && (
          <div className="absolute bottom-3 left-3 right-3 flex gap-2">
            {!isConnected && !isLoading && (
              <button 
                onClick={startConnection}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Start Avatar
              </button>
            )}
            {isConnected && (
              <button 
                onClick={stopConnection}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                Stop Avatar
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimliAvatar;