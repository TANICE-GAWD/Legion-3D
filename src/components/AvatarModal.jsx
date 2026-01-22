import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Video, VideoOff, Mic, MicOff } from 'lucide-react';
import { BouncyButton } from './Layout';
import { AgentChat } from './AgentChat';

export const AvatarModal = ({ avatar, onClose }) => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      streamRef.current = stream;
      setIsCameraOn(true);
      setIsMicOn(true);
    } catch (error) {
      console.error('Error accessing webcam:', error);
      alert('Unable to access camera. Please check permissions!');
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOn(false);
    setIsMicOn(false);
  };

  const toggleCamera = () => {
    if (!streamRef.current) return;
    
    const videoTrack = streamRef.current.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      setIsCameraOn(videoTrack.enabled);
    }
  };

  const toggleMic = () => {
    if (!streamRef.current) return;
    
    const audioTrack = streamRef.current.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicOn(audioTrack.enabled);
    }
  };

  const handleStartTalking = async () => {
    if (!isSessionActive) {
      await startWebcam();
      setIsSessionActive(true);
    } else {
      stopWebcam();
      setIsSessionActive(false);
    }
  };

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopWebcam();
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        transition={{ type: 'spring', bounce: 0.3 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border-4 border-white"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b-2 border-slate-200 p-6 flex items-center justify-between z-10">
          <div>
            <h2 className="text-3xl font-bold text-slate-800">{avatar.name}</h2>
            <p className="text-lg text-slate-500">Let's have a chat! 💬</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-3 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <X className="w-8 h-8 text-slate-600" />
          </motion.button>
        </div>

        {/* Main Content */}
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Side - Avatar */}
            <div className="space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', bounce: 0.5 }}
                className="aspect-square rounded-3xl overflow-hidden bg-gradient-to-br from-blue-100 to-purple-100 shadow-2xl"
              >
                <img
                  src={avatar.image_url}
                  alt={avatar.name}
                  className="w-full h-full object-cover"
                />
              </motion.div>

              {/* Avatar Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
              >
                <h3 className="text-xl font-bold text-slate-800 mb-3">
                  About {avatar.name}
                </h3>
                <p className="text-slate-600 text-lg line-clamp-4">
                  {avatar.system_prompt}
                </p>
              </motion.div>
            </div>

            {/* Right Side - Interaction */}
            <div className="space-y-6">
              {/* Start Talking Button */}
              {!isSessionActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring', bounce: 0.6 }}
                  className="flex flex-col items-center"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  >
                    <BouncyButton
                      onClick={handleStartTalking}
                      variant="success"
                      className="text-2xl px-12 py-6 shadow-2xl"
                    >
                      🎤 Start Talking
                    </BouncyButton>
                  </motion.div>
                  <p className="text-slate-500 text-lg mt-4 text-center">
                    Click to start your conversation!
                  </p>
                </motion.div>
              )}

              {/* Active Session */}
              {isSessionActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  {/* Webcam View */}
                  <div className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-2xl aspect-video">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                    
                    {!isCameraOn && (
                      <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                        <VideoOff className="w-16 h-16 text-slate-500" />
                      </div>
                    )}

                    {/* Overlay Controls */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleCamera}
                        className={`p-4 rounded-full shadow-lg transition-colors ${
                          isCameraOn
                            ? 'bg-white text-slate-700'
                            : 'bg-red-500 text-white'
                        }`}
                      >
                        {isCameraOn ? (
                          <Video className="w-6 h-6" />
                        ) : (
                          <VideoOff className="w-6 h-6" />
                        )}
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={toggleMic}
                        className={`p-4 rounded-full shadow-lg transition-colors ${
                          isMicOn
                            ? 'bg-white text-slate-700'
                            : 'bg-red-500 text-white'
                        }`}
                      >
                        {isMicOn ? (
                          <Mic className="w-6 h-6" />
                        ) : (
                          <MicOff className="w-6 h-6" />
                        )}
                      </motion.button>
                    </div>
                  </div>

                  {/* ElevenLabs Chat Component */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
                    <AgentChat agentId={avatar.agent_id} />
                  </div>

                  {/* End Session Button */}
                  <BouncyButton
                    onClick={handleStartTalking}
                    variant="danger"
                    className="w-full text-xl"
                  >
                    End Conversation
                  </BouncyButton>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
