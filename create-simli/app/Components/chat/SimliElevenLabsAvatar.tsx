import React, { useCallback, useRef, useState, useEffect } from "react";
import { SimliClient } from "simli-client";
import ConnectionDebugger from "./ConnectionDebugger";

// WebSocket event types for ElevenLabs
const ElevenLabsEventTypes = {
  USER_TRANSCRIPT: "user_transcript",
  AGENT_RESPONSE: "agent_response", 
  AUDIO: "audio",
  INTERRUPTION: "interruption",
  PING: "ping",
  PONG: "pong",
  CONVERSATION_INITIATION: "conversation_initiation_client_data"
} as const;

interface SimliElevenLabsAvatarProps {
  agentId: string;
  faceId?: string;
  className?: string;
  onConnectionChange?: (connected: boolean) => void;
  onSpeakingChange?: (speaking: boolean) => void;
  autoStart?: boolean;
}

const SimliElevenLabsAvatar: React.FC<SimliElevenLabsAvatarProps> = ({ 
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
  const websocketRef = useRef<WebSocket | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const simliClientRef = useRef<SimliClient | null>(null);

  /**
   * Sends message to WebSocket
   */
  const sendMessage = (websocket: WebSocket, message: any) => {
    if (websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify(message));
    }
  };

  /**
   * Initializes the Simli client
   */
  const initializeSimliClient = useCallback(() => {
    if (videoRef.current && audioRef.current) {
      const simliClient = new SimliClient();
      const SimliConfig = {
        apiKey: process.env.NEXT_PUBLIC_SIMLI_API_KEY,
        faceID: faceId,
        handleSilence: true,
        videoRef: videoRef.current,
        audioRef: audioRef.current,
      };

      simliClient.Initialize(SimliConfig as any);
      simliClientRef.current = simliClient;
      console.log("Simli Client initialized");
      
      // Set up Simli event listeners
      simliClient.on("connected", () => {
        console.log("Simli connected");
        setIsSimliConnected(true);
      });

      simliClient.on("disconnected", () => {
        console.log("Simli disconnected");
        setIsSimliConnected(false);
      });
    }
  }, [faceId]);

  /**
   * Converts base64 audio to Uint8Array for Simli
   */
  const base64ToUint8Array = (base64: string): Uint8Array => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  /**
   * Gets ElevenLabs signed URL
   */
  const getElevenLabsSignedUrl = async (agentId: string): Promise<string> => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
      
      if (!apiKey) {
        throw new Error("ElevenLabs API key not found in environment variables");
      }

      if (!agentId) {
        throw new Error("Agent ID is required");
      }

      console.log("Requesting signed URL for agent:", agentId);

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
        if (response.status === 404) {
          throw new Error(`Agent ID '${agentId}' not found. Please check your ElevenLabs dashboard and ensure the agent exists.`);
        } else if (response.status === 401) {
          throw new Error("Invalid ElevenLabs API key. Please check your NEXT_PUBLIC_ELEVENLABS_API_KEY in .env file.");
        } else if (response.status === 403) {
          throw new Error("Access denied. Please check if your API key has access to this agent.");
        } else {
          throw new Error(`ElevenLabs API error: ${response.status} - ${response.statusText}`);
        }
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
    console.log("connectToElevenLabs called", { 
      isElevenLabsConnected, 
      websocketExists: !!websocketRef.current,
      agentId 
    });
    
    if (isElevenLabsConnected || websocketRef.current) {
      console.log("ElevenLabs already connected or connecting");
      return;
    }

    try {
      const signedUrl = await getElevenLabsSignedUrl(agentId);
      console.log("Got ElevenLabs signed URL");

      const websocket = new WebSocket(signedUrl);
      websocketRef.current = websocket;

      // Set a connection timeout
      const connectionTimeout = setTimeout(() => {
        if (websocket.readyState === WebSocket.CONNECTING) {
          console.error("ElevenLabs connection timeout");
          websocket.close();
          setError("ElevenLabs connection timeout");
        }
      }, 10000);

      websocket.onopen = async () => {
        console.log("ElevenLabs WebSocket connected");
        clearTimeout(connectionTimeout);
        setIsElevenLabsConnected(true);

        // Send conversation initiation
        const initMessage = {
          type: ElevenLabsEventTypes.CONVERSATION_INITIATION,
          conversation_initiation_client_data: {
            custom_llm_extra_body: {},
            conversation_config_override: {
              agent: {
                prompt: {
                  prompt: "You are a helpful AI assistant. Respond naturally to the user's questions and comments."
                }
              }
            }
          }
        };
        
        console.log("Sending conversation initiation:", initMessage);
        sendMessage(websocket, initMessage);
      };

      websocket.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("📨 ElevenLabs message:", data.type, data);

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
            console.log("🎤 User transcript:", data.user_transcription_event.user_transcript);
          }

          // Handle agent response
          if (data.type === ElevenLabsEventTypes.AGENT_RESPONSE) {
            console.log("🤖 Agent response:", data.agent_response_event.agent_response);
            setIsSpeaking(true);
            onSpeakingChange(true);
          }

          // Handle audio data and send to Simli
          if (data.type === ElevenLabsEventTypes.AUDIO) {
            console.log("🔊 Received audio from ElevenLabs");
            if (simliClientRef.current && data.audio_event?.audio_base_64) {
              try {
                const audioData = base64ToUint8Array(data.audio_event.audio_base_64);
                simliClientRef.current.sendAudioData(audioData);
              } catch (error) {
                console.error("Error sending audio to Simli:", error);
              }
            }
          }

          // Handle interruption
          if (data.type === ElevenLabsEventTypes.INTERRUPTION) {
            console.log("⚠️ Conversation interrupted:", data.interruption_event.reason);
            setIsSpeaking(false);
            onSpeakingChange(false);
          }

          // Handle conversation end
          if (data.type === "conversation_end") {
            console.log("🏁 Conversation ended");
            setIsSpeaking(false);
            onSpeakingChange(false);
          }

        } catch (error) {
          console.error("Error processing WebSocket message:", error);
        }
      };

      websocket.onclose = (event) => {
        console.log("ElevenLabs WebSocket disconnected", event.code, event.reason);
        clearTimeout(connectionTimeout);
        setIsElevenLabsConnected(false);
        setIsSpeaking(false);
        onSpeakingChange(false);
        websocketRef.current = null;
        
        // Handle specific error codes
        if (event.code === 1002) {
          setError("ElevenLabs quota exceeded. Please check your usage at elevenlabs.io or upgrade your plan.");
        } else if (event.code === 1008) {
          setError("ElevenLabs API key invalid or expired. Please check your API key.");
        } else if (event.code !== 1000 && event.code !== 1001) {
          setError(`ElevenLabs disconnected: ${event.reason || 'Unknown reason'} (Code: ${event.code})`);
        }
      };

      websocket.onerror = (error) => {
        console.error("ElevenLabs WebSocket error:", error);
        clearTimeout(connectionTimeout);
        setError("ElevenLabs connection failed - check agent ID and API key");
        setIsElevenLabsConnected(false);
      };
    } catch (error: any) {
      console.error("Failed to connect to ElevenLabs:", error);
      setError(`Failed to connect to ElevenLabs: ${error.message}`);
    }
  };

  /**
   * Starts both Simli and ElevenLabs connections
   */
  const startConnection = useCallback(async () => {
    console.log("startConnection called", { 
      isLoading, 
      isElevenLabsConnected, 
      agentId 
    });

    if (isLoading || isElevenLabsConnected) {
      console.log("Connection already in progress or established");
      return;
    }

    if (!agentId) {
      setError("Agent ID is required");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Initialize Simli client first
      initializeSimliClient();
      
      // Start Simli session
      if (simliClientRef.current) {
        await simliClientRef.current.start();
      }
      
      // Connect to ElevenLabs
      await connectToElevenLabs();
      
    } catch (error: any) {
      console.error("Error starting connection:", error);
      setError(`Failed to start: ${error.message}`);
      setIsLoading(false);
    }
  }, [agentId, initializeSimliClient]);

  /**
   * Stops all connections cleanly
   */
  const stopConnection = useCallback(() => {
    console.log("Stopping connection...");
    
    setIsLoading(true);
    
    // Close ElevenLabs WebSocket
    if (websocketRef.current) {
      try {
        websocketRef.current.close(1000, "User initiated disconnect");
        websocketRef.current = null;
      } catch (error) {
        console.error("Error closing WebSocket:", error);
      }
    }
    
    // Stop Simli client
    if (simliClientRef.current) {
      try {
        simliClientRef.current.close();
        simliClientRef.current = null;
      } catch (error) {
        console.error("Error closing Simli client:", error);
      }
    }
    
    // Reset all states
    setIsSimliConnected(false);
    setIsElevenLabsConnected(false);
    setIsLoading(false);
    setIsSpeaking(false);
    setError("");
    
    // Notify parent components
    onConnectionChange(false);
    onSpeakingChange(false);
    
    console.log("Connection stopped");
  }, [onConnectionChange, onSpeakingChange]);

  // Update connection status
  useEffect(() => {
    const connected = isSimliConnected && isElevenLabsConnected;
    onConnectionChange(connected);
    
    if (connected) {
      setIsLoading(false);
    }
  }, [isSimliConnected, isElevenLabsConnected, onConnectionChange]);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && agentId) {
      console.log("Auto-start triggered", { agentId, isLoading, isElevenLabsConnected });
      
      if (!isLoading && !isElevenLabsConnected) {
        const timer = setTimeout(() => {
          console.log("Executing auto-start...");
          startConnection();
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [autoStart, agentId, isLoading, isElevenLabsConnected, startConnection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("Component unmounting, cleaning up connections...");
      stopConnection();
    };
  }, [stopConnection]);

  return (
    <div className={`relative ${className}`}>
      {/* Connection Debugger */}
      <ConnectionDebugger
        isSimliConnected={isSimliConnected}
        isElevenLabsConnected={isElevenLabsConnected}
        isLoading={isLoading}
        error={error}
        agentId={agentId}
      />

      {/* Video and Audio Elements */}
      <div className="relative w-full h-full bg-gray-900 rounded-lg overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        <audio ref={audioRef} autoPlay />
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-white font-medium">
                Connecting...
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

        {/* Connection Status */}
        <div className="absolute top-3 right-3 flex gap-2">
          <div className={`w-3 h-3 rounded-full ${
            isSimliConnected ? 'bg-green-500' : 
            isLoading ? 'bg-yellow-500 animate-pulse' : 
            'bg-red-500'
          }`} title="Simli Connection" />
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
            AI Speaking
          </div>
        )}

        {/* Manual Controls */}
        {!autoStart && (
          <div className="absolute bottom-3 left-3 right-3 flex gap-2">
            {!isElevenLabsConnected && !isLoading && (
              <button 
                onClick={startConnection}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Start Connection
              </button>
            )}
            {isElevenLabsConnected && (
              <button 
                onClick={stopConnection}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
              >
                End Connection
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimliElevenLabsAvatar;