import React, { useCallback, useRef, useState, useEffect } from "react";
import { SimliClient } from "simli-client";
import VideoBox from "./VideoBox";

const SimliAvatar = ({ simli_faceid, showDottedFace = false, fallbackImage }) => {
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [isAvatarVisible, setIsAvatarVisible] = useState(false);
  const [error, setError] = useState("");
  const [showFallback, setShowFallback] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");

  // Refs
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  // Create a single instance of SimliClient
  const simliClientRef = useRef(null);

  /**
   * Initializes the Simli client with the provided configuration.
   */
  const initializeSimliClient = useCallback(() => {
    if (videoRef.current && audioRef.current && !simliClientRef.current) {
      const apiKey = import.meta.env.VITE_SIMLI_API_KEY;
      
      console.log("Initializing Simli with:", {
        apiKey: apiKey ? `${apiKey.substring(0, 8)}...` : 'NOT_FOUND',
        faceID: simli_faceid,
        videoRef: !!videoRef.current,
        audioRef: !!audioRef.current
      });
      
      if (!apiKey) {
        console.error("Simli API key not found");
        setError("Simli API key not configured");
        setShowFallback(true);
        setIsLoading(false);
        return;
      }

      const SimliConfig = {
        apiKey: apiKey,
        faceID: simli_faceid,
        handleSilence: true,
        videoRef: videoRef.current,
        audioRef: audioRef.current,
      };

      simliClientRef.current = new SimliClient();
      simliClientRef.current.Initialize(SimliConfig);
      console.log("Simli Client initialized successfully");
    }
  }, [simli_faceid]);

  /**
   * Handles the start of the avatar display
   */
  const handleStart = useCallback(async () => {
    // Prevent multiple initializations
    if (simliClientRef.current || isLoading) {
      console.log("Simli already initializing or initialized, skipping...");
      return;
    }

    initializeSimliClient();

    if (simliClientRef.current) {
      simliClientRef.current.on("connected", () => {
        console.log("SimliClient connected");
        setConnectionStatus("connected");

        // Send initial audio data to establish connection and show avatar
        const audioData = new Uint8Array(6000).fill(0);
        simliClientRef.current.sendAudioData(audioData);
        console.log("Sent initial audio data to Simli");

        setIsAvatarVisible(true);
        setIsLoading(false);
        setShowFallback(false);
      });

      simliClientRef.current.on("disconnected", () => {
        console.log("SimliClient disconnected");
        setConnectionStatus("disconnected");
        // Don't immediately set isAvatarVisible to false, as this might be a temporary disconnect
        // setIsAvatarVisible(false);
      });

      simliClientRef.current.on("error", (error) => {
        console.error("SimliClient error:", error);
        setError(`Simli connection failed: ${error.message || error}`);
        setIsLoading(false);
        setShowFallback(true);
      });
    }

    setIsLoading(true);
    setError("");

    try {
      // Start Simli client
      await simliClientRef.current?.start();
    } catch (error) {
      console.error("Error starting Simli avatar:", error);
      setError(`Error starting avatar: ${error.message}`);
      setIsLoading(false);
      setShowFallback(true);
    }
  }, [initializeSimliClient, isLoading]);

  /**
   * Handles stopping the avatar display
   */
  const handleStop = useCallback(() => {
    console.log("Stopping Simli avatar...");
    setIsLoading(false);
    setError("");
    setIsAvatarVisible(false);

    // Clean up Simli client
    if (simliClientRef.current) {
      simliClientRef.current.ClearBuffer();
      simliClientRef.current.close();
      simliClientRef.current = null;
    }

    console.log("Simli avatar stopped");
  }, []);

  // Auto-start the avatar when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      handleStart();
    }, 100); // Small delay to ensure refs are ready
    
    // Cleanup on unmount
    return () => {
      clearTimeout(timer);
      handleStop();
    };
  }, []); // Remove dependencies to prevent re-initialization

  // Send periodic audio data to keep avatar active
  useEffect(() => {
    if (isAvatarVisible && simliClientRef.current) {
      const interval = setInterval(() => {
        try {
          // Send silent audio data to keep the avatar active
          const silentAudio = new Uint8Array(1024).fill(0);
          if (simliClientRef.current) {
            simliClientRef.current.sendAudioData(silentAudio);
          }
        } catch (error) {
          console.error("Error sending keep-alive audio:", error);
        }
      }, 2000); // Send every 2 seconds instead of 1

      return () => clearInterval(interval);
    }
  }, [isAvatarVisible]);

  return (
    <div className="w-full h-full relative">
      {error && (
        <div className="absolute top-4 left-4 right-4 z-10 p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {error}
        </div>
      )}
      
      {isLoading && !showFallback && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
          <div className="bg-white px-4 py-2 rounded-lg shadow-lg">
            <span className="text-sm font-medium">Loading Simli avatar...</span>
          </div>
        </div>
      )}

      {/* Show fallback image if Simli fails or while loading */}
      {(showFallback || (isLoading && fallbackImage)) && fallbackImage && (
        <div className="w-full h-full flex items-center justify-center">
          <img
            src={fallbackImage}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
          {showFallback && (
            <div className="absolute bottom-4 left-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded p-2 text-sm">
              Using fallback image - Simli avatar unavailable
            </div>
          )}
        </div>
      )}

      {/* Simli video container */}
      <div className={`w-full h-full ${showDottedFace || showFallback ? 'hidden' : 'block'}`}>
        <VideoBox video={videoRef} audio={audioRef} />
      </div>
    </div>
  );
};

export default SimliAvatar;