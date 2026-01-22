import React, { useCallback, useRef, useState, useEffect } from "react";
import { SimliClient } from "simli-client";

// WebSocket event types for ElevenLabs
const ElevenLabsEventTypes = {
  USER_TRANSCRIPT: "user_transcript",
  AGENT_RESPONSE: "agent_response", 
  AUDIO: "audio",
  INTERRUPTION: "interruption",
  PING: "ping",
  PONG: "pong",
  CONVERSATION_INITIATION: "conversation_initiation_client_data"
};

const SimliElevenLabsAvatar = ({ 
  agentId,
  faceId = "0c2b8b04-5274-41f1-a21c-d5c98322efa9",
  className = "",
  onConnectionChange = () => {},
  onSpeakingChange = () => {},
  autoStart = false 
}) => {
  // State management
  const [isSimliConnected, setIsSimliConnected] = useState(false);
  const [isElevenLabsConnected, setIsElevenLabsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Refs
  const videoRef = useRef(null);
  const audioRef = useRef(null);
  const simliClientRef = useRef(null);
  const websocketRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const sourceRef = useRef(null);

  /**
   * Initializes the Simli client
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
          console.warn("Error cleaning up previous Simli client:", e);
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
      setError(`Failed to initialize Simli: ${error.message}`);
      return false;
    }
  }, [faceId]);

  /**
   * Converts base64 audio to Uint8Array for Simli
   */
  const base64ToUint8Array = (base64) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  /**
   * Converts Float32Array to base64 encoded PCM for ElevenLabs
   */
  const float32ToBase64PCM = (float32Array) => {
    // Convert float32 to 16-bit PCM
    const pcmArray = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const clamped = Math.max(-1, Math.min(1, float32Array[i]));
      pcmArray[i] = Math.floor(clamped * 32767);
    }
    
    // Convert to base64
    const arrayBuffer = pcmArray.buffer;
    const uint8Array = new Uint8Array(arrayBuffer);
    
    let binaryString = '';
    const chunkSize = 8192;
    for (let i = 0; i < uint8Array.length; i += chunkSize) {
      const chunk = uint8Array.subarray(i, i + chunkSize);
      binaryString += String.fromCharCode.apply(null, Array.from(chunk));
    }
    
    return btoa(binaryString);
  };

  /**
   * Sets up voice streaming using Web Audio API
   */
  const setupVoiceStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;

      // Create AudioContext for real-time processing
      const audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000,
      });
      audioContextRef.current = audioContext;

      // Create audio source from microphone stream
      const source = audioContext.createMediaStreamSource(stream);
      sourceRef.current = source;

      // Create ScriptProcessorNode for real-time audio processing
      const bufferSize = 4096;
      const processor = audioContext.createScriptProcessor(bufferSize, 1, 1);
      processorRef.current = processor;

      let isProcessing = false;

      // Process audio in real-time
      processor.onaudioprocess = (event) => {
        if (isProcessing || !websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) {
          return;
        }

        isProcessing = true;
        
        try {
          const inputBuffer = event.inputBuffer;
          const inputData = inputBuffer.getChannelData(0);

          // Only send if we have meaningful audio data
          const hasAudio = inputData.some(sample => Math.abs(sample) > 0.01);
          
          if (hasAudio) {
            const base64Audio = float32ToBase64PCM(inputData);
            sendAudioToWebSocket(base64Audio);
          }
        } catch (error) {
          console.error("Error processing audio:", error);
        } finally {
          isProcessing = false;
        }
      };

      // Connect the audio processing chain
      source.connect(processor);
      processor.connect(audioContext.destination);

      console.log("Voice streaming started");
    } catch (error) {
      console.error("Failed to setup voice stream:", error);
      throw error;
    }
  };

  /**
   * Stops voice streaming
   */
  const stopVoiceStream = () => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current.onaudioprocess = null;
      processorRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    console.log("Voice streaming stopped");
  };

  /**
   * Sends audio data to WebSocket
   */
  const sendAudioToWebSocket = (audioData) => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      websocketRef.current.send(
        JSON.stringify({
          user_audio_chunk: audioData,
        })
      );
    }
  };

  /**
   * Sends message to WebSocket
   */
  const sendMessage = (websocket, message) => {
    if (websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify(message));
    }
  };

  /**
   * Gets ElevenLabs signed URL
   */
  const getElevenLabsSignedUrl = async (agentId) => {
    try {
      const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
      
      if (!apiKey) {
        throw new Error("ElevenLabs API key not found");
      }

      const response = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
        {
          method: 'GET',
          headers: {
            'xi-api-key': apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get signed URL: ${response.statusText}`);
      }

      const data = await response.json();
      return data.signed_url;
    } catch (error) {
      console.error("Error getting ElevenLabs signed URL:", error);
      throw error;
    }
  };

  /**
   * Establishes WebSocket connection to ElevenLabs
   */
  const connectToElevenLabs = async () => {
    try {
      const signedUrl = await getElevenLabsSignedUrl(agentId);
      console.log("Got ElevenLabs signed URL");

      const websocket = new WebSocket(signedUrl);
      websocketRef.current = websocket;

      websocket.onopen = async () => {
        console.log("ElevenLabs WebSocket connected");
        setIsElevenLabsConnected(true);

        // Send conversation initiation
        sendMessage(websocket, {
          type: ElevenLabsEventTypes.CONVERSATION_INITIATION,
          conversation_initiation_client_data: {
            custom_llm_extra_body: {}
          }
        });

        // Setup voice streaming after WebSocket is connected
        await setupVoiceStream();
      };

      websocket.onmessage = async (event) => {
        const data = JSON.parse(event.data);

        // Handle ping events
        if (data.type === ElevenLabsEventTypes.PING) {
          setTimeout(() => {
            sendMessage(websocket, {
              type: ElevenLabsEventTypes.PONG,
              event_id: data.ping_event.event_id,
            });
          }, data.ping_event.ping_ms || 0);
        }

        // Handle user transcript
        if (data.type === ElevenLabsEventTypes.USER_TRANSCRIPT) {
          console.log("User transcript:", data.user_transcription_event.user_transcript);
        }

        // Handle agent response
        if (data.type === ElevenLabsEventTypes.AGENT_RESPONSE) {
          console.log("Agent response:", data.agent_response_event.agent_response);
          setIsSpeaking(true);
          onSpeakingChange(true);
        }

        // Handle audio data - Send to Simli for avatar animation
        if (data.type === ElevenLabsEventTypes.AUDIO) {
          const { audio_base_64 } = data.audio_event;

          if (simliClientRef.current && isSimliConnected) {
            // Convert base64 audio to Uint8Array and send to Simli
            const audioData = base64ToUint8Array(audio_base_64);
            simliClientRef.current.sendAudioData(audioData);
            console.log("Sent ElevenLabs audio to Simli:", audioData.length, "bytes");
          }
        }

        // Handle interruption
        if (data.type === ElevenLabsEventTypes.INTERRUPTION) {
          console.log("Conversation interrupted:", data.interruption_event.reason);
          setIsSpeaking(false);
          onSpeakingChange(false);
        }
      };

      websocket.onclose = (event) => {
        console.log("ElevenLabs WebSocket disconnected", event.code, event.reason);
        setIsElevenLabsConnected(false);
        setIsSpeaking(false);
        onSpeakingChange(false);
        stopVoiceStream();
        websocketRef.current = null;
      };

      websocket.onerror = (error) => {
        console.error("ElevenLabs WebSocket error:", error);
        setError("ElevenLabs connection failed");
      };
    } catch (error) {
      console.error("Failed to connect to ElevenLabs:", error);
      setError(`Failed to connect to ElevenLabs: ${error.message}`);
    }
  };

  /**
   * Starts both Simli and ElevenLabs connections
   */
  const startConnection = useCallback(async () => {
    if (isLoading) return;

    if (!agentId) {
      setError("Agent ID is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Initialize Simli client
      if (!initializeSimliClient()) {
        setIsLoading(false);
        return;
      }

      // Set up Simli event listeners
      simliClientRef.current.on("connected", () => {
        console.log("Simli connected");
        setIsSimliConnected(true);
        
        // Send initial silence to establish connection
        const silenceData = new Uint8Array(1024).fill(0);
        simliClientRef.current.sendAudioData(silenceData);

        // Start ElevenLabs connection after Simli is ready
        connectToElevenLabs();
      });

      simliClientRef.current.on("disconnected", () => {
        console.log("Simli disconnected");
        setIsSimliConnected(false);
      });

      simliClientRef.current.on("error", (error) => {
        console.error("Simli error:", error);
        setError(`Simli error: ${error.message || error}`);
        setIsLoading(false);
      });

      // Start Simli connection
      await simliClientRef.current.start();
      
    } catch (error) {
      console.error("Error starting connections:", error);
      setError(`Failed to start: ${error.message}`);
      setIsLoading(false);
    }
  }, [agentId, initializeSimliClient]);

  /**
   * Stops all connections
   */
  const stopConnection = useCallback(() => {
    console.log("Stopping all connections...");
    
    // Close ElevenLabs WebSocket
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }

    // Stop voice streaming
    stopVoiceStream();

    // Clean up Simli client
    if (simliClientRef.current) {
      try {
        simliClientRef.current.ClearBuffer();
        simliClientRef.current.close();
        simliClientRef.current = null;
      } catch (error) {
        console.error("Error stopping Simli:", error);
      }
    }
    
    setIsSimliConnected(false);
    setIsElevenLabsConnected(false);
    setIsLoading(false);
    setIsSpeaking(false);
    setError("");
    onConnectionChange(false);
    onSpeakingChange(false);
    
    console.log("All connections stopped");
  }, [onConnectionChange, onSpeakingChange]);

  // Update connection status
  useEffect(() => {
    const bothConnected = isSimliConnected && isElevenLabsConnected;
    onConnectionChange(bothConnected);
    
    if (bothConnected) {
      setIsLoading(false);
    }
  }, [isSimliConnected, isElevenLabsConnected, onConnectionChange]);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && agentId) {
      const timer = setTimeout(() => {
        startConnection();
      }, 100);
      
      return () => clearTimeout(timer);
    }

    return () => {
      stopConnection();
    };
  }, [autoStart, agentId, startConnection, stopConnection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopConnection();
    };
  }, [stopConnection]);

  const isConnected = isSimliConnected && isElevenLabsConnected;

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
            transform: 'scaleX(-1)',
            backgroundColor: '#1a1a1a'
          }}
        />
        
        {/* Audio Element (hidden) */}
        <audio 
          ref={audioRef} 
          autoPlay 
          className="hidden"
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-white font-medium">
                {!isSimliConnected ? 'Connecting to Simli...' : 
                 !isElevenLabsConnected ? 'Connecting to ElevenLabs...' : 
                 'Establishing connection...'}
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
              <button 
                onClick={startConnection}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Retrying...' : 'Retry Connection'}
              </button>
            </div>
          </div>
        )}

        {/* Connection Status Indicators */}
        <div className="absolute top-3 right-3 flex gap-2">
          {/* Simli Status */}
          <div className={`w-3 h-3 rounded-full ${
            isSimliConnected ? 'bg-green-500' : 
            isLoading ? 'bg-yellow-500 animate-pulse' : 
            'bg-red-500'
          }`} title="Simli Connection" />
          
          {/* ElevenLabs Status */}
          <div className={`w-3 h-3 rounded-full ${
            isElevenLabsConnected ? 'bg-blue-500' : 
            isLoading ? 'bg-yellow-500 animate-pulse' : 
            'bg-red-500'
          }`} title="ElevenLabs Connection" />
        </div>

        {/* Speaking Indicator */}
        {isSpeaking && (
          <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Speaking
          </div>
        )}

        {/* Manual Controls */}
        {!autoStart && (
          <div className="absolute bottom-3 left-3 right-3 flex gap-2">
            {!isConnected && !isLoading && (
              <button 
                onClick={startConnection}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Start Conversation
              </button>
            )}
            {isConnected && (
              <button 
                onClick={stopConnection}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                End Conversation
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimliElevenLabsAvatar;