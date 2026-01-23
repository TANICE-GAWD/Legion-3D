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
  const [micLevel, setMicLevel] = useState(0);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);

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
   * Sets up voice streaming using modern AudioWorkletNode with ScriptProcessor fallback
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

      let processor;
      let useModernAudio = false;
      
      try {
        // Try modern AudioWorkletNode approach first
        if (audioContext.audioWorklet) {
          console.log("🎵 Using modern AudioWorkletNode for audio processing");
          
          // Load the audio processor worklet
          await audioContext.audioWorklet.addModule('/audio-processor.js');
          
          // Create AudioWorkletNode
          processor = new AudioWorkletNode(audioContext, 'audio-processor');
          processorRef.current = processor;
          useModernAudio = true;
          
          // Handle messages from the worklet
          processor.port.onmessage = (event) => {
            const { type, audioData, level, isSpeaking, hasAudio } = event.data;
            
            if (type === 'audioData') {
              // Update UI state
              setMicLevel(level);
              setIsUserSpeaking(isSpeaking);
              
              // Send audio to WebSocket if user is speaking
              if (hasAudio && isSpeaking && websocketRef.current?.readyState === WebSocket.OPEN) {
                const base64Audio = float32ToBase64PCM(audioData);
                sendAudioToWebSocket(base64Audio);
                
                // Reduced logging frequency to avoid spam
                if (Math.random() < 0.05) { // Log only 5% of audio sends
                  console.log("Sending audio to ElevenLabs (AudioWorklet), level:", level);
                }
              }
            }
          };
          
          // Connect the audio processing chain
          source.connect(processor);
          processor.connect(audioContext.destination);
          
        } else {
          throw new Error("AudioWorklet not supported, using fallback");
        }
      } catch (workletError) {
        console.warn("AudioWorklet failed, falling back to ScriptProcessorNode:", workletError.message);
        
        // Fallback to ScriptProcessorNode (deprecated but widely supported)
        console.warn("Using deprecated ScriptProcessorNode for audio processing");
        const bufferSize = 4096;
        processor = audioContext.createScriptProcessor(bufferSize, 1, 1);
        processorRef.current = processor;

        let isProcessing = false;
        let lastSendTime = 0;
        const sendInterval = 100; // Send audio every 100ms to reduce load

        // Process audio in real-time with throttling and level monitoring
        processor.onaudioprocess = (event) => {
          const currentTime = Date.now();
          
          if (isProcessing || 
              !websocketRef.current || 
              websocketRef.current.readyState !== WebSocket.OPEN ||
              currentTime - lastSendTime < sendInterval) {
            return;
          }

          isProcessing = true;
          lastSendTime = currentTime;
          
          try {
            const inputBuffer = event.inputBuffer;
            const inputData = inputBuffer.getChannelData(0);

            // Calculate audio level for visual feedback
            let sum = 0;
            for (let i = 0; i < inputData.length; i++) {
              sum += inputData[i] * inputData[i];
            }
            const rms = Math.sqrt(sum / inputData.length);
            const level = Math.min(100, Math.floor(rms * 1000));
            setMicLevel(level);

            // Detect if user is speaking (higher threshold)
            const hasAudio = inputData.some(sample => Math.abs(sample) > 0.01);
            const isSpeakingNow = level > 5; // Adjust threshold as needed
            setIsUserSpeaking(isSpeakingNow);
            
            if (hasAudio && isSpeakingNow) {
              const base64Audio = float32ToBase64PCM(inputData);
              sendAudioToWebSocket(base64Audio);
              
              // Reduced logging frequency to avoid spam
              if (Math.random() < 0.05) { // Log only 5% of audio sends
                console.log("Sending audio to ElevenLabs (ScriptProcessor), level:", level);
              }
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
      }

      console.log(`Voice streaming started using ${useModernAudio ? 'AudioWorkletNode' : 'ScriptProcessorNode'}`);
    } catch (error) {
      console.error("Failed to setup voice stream:", error);
      throw error;
    }
  };

  /**
   * Stops voice streaming and cleans up audio resources
   */
  const stopVoiceStream = () => {
    if (processorRef.current) {
      try {
        // Handle both AudioWorkletNode and ScriptProcessorNode cleanup
        if (processorRef.current instanceof AudioWorkletNode) {
          // AudioWorkletNode cleanup
          processorRef.current.port.onmessage = null;
          processorRef.current.disconnect();
          console.log("AudioWorkletNode disconnected");
        } else {
          // ScriptProcessorNode cleanup
          processorRef.current.disconnect();
          processorRef.current.onaudioprocess = null;
          console.log("ScriptProcessorNode disconnected");
        }
      } catch (error) {
        console.warn("Error disconnecting processor:", error);
      }
      processorRef.current = null;
    }

    if (sourceRef.current) {
      try {
        sourceRef.current.disconnect();
      } catch (error) {
        console.warn("Error disconnecting source:", error);
      }
      sourceRef.current = null;
    }

    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch (error) {
        console.warn("Error closing audio context:", error);
      }
      audioContextRef.current = null;
    }

    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((track) => track.stop());
      } catch (error) {
        console.warn("Error stopping stream tracks:", error);
      }
      streamRef.current = null;
    }

    console.log("Voice streaming stopped and cleaned up");
  };

  /**
   * Sends audio data to WebSocket with proper format
   */
  const sendAudioToWebSocket = (audioData) => {
    if (websocketRef.current?.readyState === WebSocket.OPEN) {
      const message = {
        user_audio_chunk: audioData,
      };
      
      websocketRef.current.send(JSON.stringify(message));
      // Reduced logging frequency to avoid spam
      if (Math.random() < 0.1) { // Log only 10% of messages
        console.log("Audio chunk sent to ElevenLabs");
      }
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
   * Gets ElevenLabs signed URL with better error handling
   */
  const getElevenLabsSignedUrl = async (agentId) => {
    try {
      const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
      
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
          throw new Error("Invalid ElevenLabs API key. Please check your VITE_ELEVENLABS_API_KEY in .env file.");
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
   * Establishes WebSocket connection to ElevenLabs with better error handling
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

        // Send conversation initiation with proper format
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

        // Wait a moment before setting up voice streaming
        setTimeout(async () => {
          try {
            await setupVoiceStream();
            console.log("Voice streaming setup complete");
            
            // Send a conversation starter after everything is set up
            setTimeout(() => {
              if (websocket.readyState === WebSocket.OPEN) {
                console.log("Sending conversation starter...");
                sendMessage(websocket, {
                  type: "conversation_initiation_client_data",
                  conversation_initiation_client_data: {
                    conversation_config_override: {
                      agent: {
                        first_message: "Hello! I'm ready to chat with you. How are you doing today?"
                      }
                    }
                  }
                });
              }
            }, 2000);
            
          } catch (error) {
            console.error("Failed to setup voice stream:", error);
            setError("Microphone access failed");
          }
        }, 1000);
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

          // Handle audio data - Play audio directly (Simli temporarily disabled)
          if (data.type === ElevenLabsEventTypes.AUDIO) {
            const { audio_base_64 } = data.audio_event;
            console.log("🔊 Received audio from ElevenLabs, length:", audio_base_64.length);

            try {
              // Convert base64 audio to Uint8Array for playback
              const audioData = base64ToUint8Array(audio_base_64);
              
              // TEMPORARILY DISABLED: Send to Simli for avatar animation
              // if (simliClientRef.current && isSimliConnected) {
              //   simliClientRef.current.sendAudioData(audioData);
              //   console.log("✅ Sent ElevenLabs audio to Simli:", audioData.length, "bytes");
              // }
              
              // Play audio directly with multiple format attempts
              try {
                // Try different MIME types as ElevenLabs might send different formats
                const mimeTypes = [
                  'audio/mpeg',     // MP3
                  'audio/wav',      // WAV
                  'audio/webm',     // WebM
                  'audio/ogg',      // OGG
                  'audio/mp4',      // MP4/AAC
                  'audio/x-wav',    // Alternative WAV
                  'audio/pcm'       // PCM
                ];
                
                let audioPlayed = false;
                
                // Try each MIME type until one works
                for (const mimeType of mimeTypes) {
                  if (audioPlayed) break;
                  
                  try {
                    const audioBlob = new Blob([audioData], { type: mimeType });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    
                    const tempAudio = new Audio();
                    tempAudio.volume = 0.8;
                    
                    // Set up event handlers before setting src
                    tempAudio.onloadeddata = () => {
                      console.log(`🔊 Audio loaded successfully with ${mimeType}`);
                    };
                    
                    tempAudio.oncanplay = () => {
                      if (!audioPlayed) {
                        audioPlayed = true;
                        tempAudio.play().then(() => {
                          console.log(`🔊 Audio playback started with ${mimeType} (Simli disabled)`);
                        }).catch(playError => {
                          console.error(`Play error with ${mimeType}:`, playError);
                        });
                      }
                    };
                    
                    tempAudio.onended = () => {
                      URL.revokeObjectURL(audioUrl);
                      console.log("🔊 Audio playback ended");
                    };
                    
                    tempAudio.onerror = (e) => {
                      URL.revokeObjectURL(audioUrl);
                      console.log(`❌ Failed with ${mimeType}, trying next format...`);
                    };
                    
                    // Set the source
                    tempAudio.src = audioUrl;
                    tempAudio.load();
                    
                    // Break after first attempt that doesn't immediately fail
                    break;
                    
                  } catch (formatError) {
                    console.log(`❌ Format ${mimeType} failed:`, formatError.message);
                    continue;
                  }
                }
                
                // Fallback: Try using Web Audio API for direct playback
                if (!audioPlayed) {
                  console.log("🔄 Trying Web Audio API fallback...");
                  try {
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    audioContext.decodeAudioData(audioData.buffer.slice()).then(audioBuffer => {
                      const source = audioContext.createBufferSource();
                      const gainNode = audioContext.createGain();
                      
                      source.buffer = audioBuffer;
                      gainNode.gain.value = 0.8;
                      
                      source.connect(gainNode);
                      gainNode.connect(audioContext.destination);
                      
                      source.start(0);
                      console.log("🔊 Audio playback started via Web Audio API (Simli disabled)");
                      
                      source.onended = () => {
                        audioContext.close();
                        console.log("🔊 Web Audio API playback ended");
                      };
                    }).catch(decodeError => {
                      console.error("❌ Web Audio API decode failed:", decodeError);
                      audioContext.close();
                    });
                  } catch (webAudioError) {
                    console.error("❌ Web Audio API failed:", webAudioError);
                  }
                }
                
              } catch (audioError) {
                console.error("❌ All audio playback methods failed:", audioError);
              }
              
            } catch (error) {
              console.error("Error processing audio:", error);
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

          // Handle conversation metadata
          if (data.type === "conversation_initiation_metadata") {
            console.log("📋 Conversation metadata:", data.conversation_initiation_metadata_event);
          }

          // Handle any other message types
          if (!["ping", "user_transcript", "agent_response", "audio", "interruption", "conversation_initiation_metadata"].includes(data.type)) {
            console.log("❓ Unknown message type:", data.type, data);
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
        stopVoiceStream();
        websocketRef.current = null;
        
        // Only show error if it wasn't a clean close
        if (event.code !== 1000 && event.code !== 1001) {
          setError(`ElevenLabs disconnected: ${event.reason || 'Unknown reason'}`);
        }
      };

      websocket.onerror = (error) => {
        console.error("ElevenLabs WebSocket error:", error);
        clearTimeout(connectionTimeout);
        setError("ElevenLabs connection failed - check agent ID and API key");
        setIsElevenLabsConnected(false);
      };
    } catch (error) {
      console.error("Failed to connect to ElevenLabs:", error);
      setError(`Failed to connect to ElevenLabs: ${error.message}`);
    }
  };

  /**
   * Starts both Simli and ElevenLabs connections with better error handling
   */
  const startConnection = useCallback(async () => {
    console.log("startConnection called", { 
      isLoading, 
      isSimliConnected, 
      isElevenLabsConnected, 
      agentId 
    });

    if (isLoading || (isSimliConnected && isElevenLabsConnected)) {
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
      // Initialize Simli client
      if (!initializeSimliClient()) {
        setIsLoading(false);
        return;
      }

      // Set up Simli event listeners with better error handling
      simliClientRef.current.on("connected", async () => {
        console.log("Simli connected");
        setIsSimliConnected(true);
        
        // Send initial silence to establish connection
        try {
          const silenceData = new Uint8Array(1024).fill(0);
          simliClientRef.current.sendAudioData(silenceData);
          console.log("Sent initial silence to Simli");
          
          // Wait a bit before starting ElevenLabs to ensure Simli is stable
          setTimeout(() => {
            console.log("Attempting to connect to ElevenLabs...", { 
              simliConnected: isSimliConnected, 
              elevenLabsConnected: isElevenLabsConnected,
              agentId 
            });
            if (simliClientRef.current && !websocketRef.current) {
              connectToElevenLabs();
            }
          }, 1000);
        } catch (error) {
          console.error("Error sending initial silence:", error);
        }
      });

      simliClientRef.current.on("disconnected", () => {
        console.log("Simli disconnected");
        setIsSimliConnected(false);
        
        // Don't automatically restart if we're in the middle of stopping
        if (!isLoading) {
          setError("Simli connection lost");
        }
      });

      simliClientRef.current.on("error", (error) => {
        console.error("Simli error:", error);
        setError(`Simli error: ${error.message || error}`);
        setIsLoading(false);
        setIsSimliConnected(false);
      });

      // Start Simli connection
      await simliClientRef.current.start();
      
    } catch (error) {
      console.error("Error starting connections:", error);
      setError(`Failed to start: ${error.message}`);
      setIsLoading(false);
    }
  }, [agentId]); // Minimal dependencies

  /**
   * Stops all connections cleanly
   */
  const stopConnection = useCallback(() => {
    console.log("Stopping all connections...");
    
    // Set loading to prevent new connections during cleanup
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
    
    // Reset all states
    setIsSimliConnected(false);
    setIsElevenLabsConnected(false);
    setIsLoading(false);
    setIsSpeaking(false);
    setError("");
    
    // Notify parent components
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

  // Auto-start if enabled - simplified and stable
  useEffect(() => {
    if (autoStart && agentId) {
      console.log("Auto-start triggered", { agentId, isLoading, isSimliConnected, isElevenLabsConnected });
      
      // Only start if not already connected or loading
      if (!isLoading && !isSimliConnected && !isElevenLabsConnected) {
        const timer = setTimeout(() => {
          console.log("Executing auto-start...");
          startConnection();
        }, 1000); // Longer delay to ensure component is stable
        
        return () => clearTimeout(timer);
      }
    }
  }, [autoStart, agentId]); // Minimal dependencies to prevent re-runs

  // Cleanup on unmount only - prevent premature cleanup
  useEffect(() => {
    return () => {
      console.log("Component unmounting, cleaning up connections...");
      stopConnection();
    };
  }, []); // Empty dependency array - only run on unmount

  const isConnected = isSimliConnected && isElevenLabsConnected;

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
        
        {/* Audio Element (for backup audio playback) */}
        <audio 
          ref={audioRef} 
          autoPlay 
          className="hidden"
          controls={false}
          muted={false}
          volume={0.8}
          onError={(e) => console.error("Audio element error:", e)}
          onPlay={() => console.log("Audio element playing")}
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

        {/* Volume Control (for testing) */}
        <div className="absolute top-12 right-3">
          <button
            onClick={() => {
              // Test system audio
              const testAudio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
              testAudio.volume = 0.5;
              testAudio.play().then(() => {
                console.log("🔊 Test audio played successfully");
              }).catch(e => {
                console.error("❌ Test audio failed:", e);
              });
            }}
            className="px-2 py-1 bg-blue-600/80 text-white rounded text-xs hover:bg-blue-700/80"
          >
            🔊 Test
          </button>
        </div>

        {/* Audio Status Indicator */}
        {isSpeaking && (
          <div className="absolute top-3 right-16 bg-purple-600/80 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            Audio Playing
          </div>
        )}

        {/* Speaking Indicator */}
        {isSpeaking && (
          <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            AI Speaking
          </div>
        )}

        {/* Microphone Status and Level Indicator */}
        <div className="absolute bottom-3 left-3 bg-black/80 text-white px-3 py-2 rounded-lg text-xs">
          <div className="flex items-center gap-2 mb-1">
            <div className={`w-2 h-2 rounded-full ${
              streamRef.current ? 'bg-green-400' : 'bg-red-400'
            }`} />
            <span>Mic: {streamRef.current ? 'Active' : 'Inactive'}</span>
          </div>
          
          {/* Audio Level Bar */}
          {streamRef.current && (
            <div className="flex items-center gap-2">
              <span className="text-xs">Level:</span>
              <div className="w-16 h-2 bg-gray-600 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-100 ${
                    micLevel > 20 ? 'bg-green-400' : 
                    micLevel > 5 ? 'bg-yellow-400' : 'bg-gray-400'
                  }`}
                  style={{ width: `${Math.min(100, micLevel * 2)}%` }}
                />
              </div>
              <span className={`text-xs ${isUserSpeaking ? 'text-green-400' : 'text-gray-400'}`}>
                {isUserSpeaking ? 'Speaking' : 'Silent'}
              </span>
            </div>
          )}
        </div>

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

        {/* ElevenLabs Retry Button (if Simli connected but ElevenLabs failed) */}
        {isSimliConnected && !isElevenLabsConnected && !isLoading && (
          <div className="absolute bottom-3 left-3 right-3">
            <button 
              onClick={connectToElevenLabs}
              className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium text-sm"
            >
              Retry ElevenLabs Connection
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimliElevenLabsAvatar;