import React, { useCallback, useRef, useState, useEffect } from "react";
import { SimliClient } from "simli-client";
import VideoBox from "./VideoBox";

const SimliAvatar = ({ simli_faceid, showDottedFace = false }) => {
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [isAvatarVisible, setIsAvatarVisible] = useState(false);
  const [error, setError] = useState("");

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
      const SimliConfig = {
        apiKey: import.meta.env.VITE_SIMLI_API_KEY,
        faceID: simli_faceid,
        handleSilence: true,
        videoRef: videoRef.current,
        audioRef: audioRef.current,
      };

      simliClientRef.current = new SimliClient();
      simliClientRef.current.Initialize(SimliConfig);
      console.log("Simli Client initialized");
    }
  }, [simli_faceid]);

  /**
   * Handles the start of the avatar display
   */
  const handleStart = useCallback(async () => {
    initializeSimliClient();

    if (simliClientRef.current) {
      simliClientRef.current.on("connected", () => {
        console.log("SimliClient connected");

        // Send initial audio data to establish connection and show avatar
        const audioData = new Uint8Array(6000).fill(0);
        simliClientRef.current.sendAudioData(audioData);
        console.log("Sent initial audio data to Simli");

        setIsAvatarVisible(true);
        setIsLoading(false);
      });

      simliClientRef.current.on("disconnected", () => {
        console.log("SimliClient disconnected");
        setIsAvatarVisible(false);
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
    }
  }, []);

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
    handleStart();
    
    // Cleanup on unmount
    return () => {
      handleStop();
    };
  }, [handleStart, handleStop]);

  // Send periodic audio data to keep avatar active
  useEffect(() => {
    if (isAvatarVisible && simliClientRef.current) {
      const interval = setInterval(() => {
        // Send silent audio data to keep the avatar active
        const silentAudio = new Uint8Array(1024).fill(0);
        simliClientRef.current.sendAudioData(silentAudio);
      }, 1000); // Send every second

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
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
          <div className="bg-white px-4 py-2 rounded-lg shadow-lg">
            <span className="text-sm font-medium">Loading avatar...</span>
          </div>
        </div>
      )}

      <div className={`w-full h-full ${showDottedFace ? 'hidden' : 'block'}`}>
        <VideoBox video={videoRef} audio={audioRef} />
      </div>
    </div>
  );
};

export default SimliAvatar;