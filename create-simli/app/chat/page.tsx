'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Video, VideoOff, Mic, MicOff, MessageCircle, Radio, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SimliElevenLabsAvatarView } from '../Components/chat/SimliElevenLabsAvatarView';

// --- NEO-POP COMPONENTS ---

// 1. Hard Shadow Button
interface PopButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  colorClass?: string;
  icon?: React.ComponentType<any>;
  className?: string;
}

const PopButton: React.FC<PopButtonProps> = ({ 
  onClick, 
  disabled = false, 
  children, 
  colorClass = 'bg-black text-white', 
  icon: Icon, 
  className = '' 
}) => (
  <motion.button
    whileHover={{ x: -2, y: -2 }}
    whileTap={{ x: 2, y: 2 }}
    onClick={onClick}
    disabled={disabled}
    className={`
      relative py-4 px-6 rounded-xl font-black text-xl border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
      flex items-center justify-center gap-3 transition-all
      ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : `${colorClass} hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`}
      ${className}
    `}
  >
    {Icon && <Icon size={24} strokeWidth={3} />}
    {children}
  </motion.button>
);

// 2. Circle Control Button (For Mic/Cam)
interface ControlButtonProps {
  onClick: () => void;
  isActive: boolean;
  onIcon: React.ComponentType<any>;
  offIcon: React.ComponentType<any>;
}

const ControlButton: React.FC<ControlButtonProps> = ({ 
  onClick, 
  isActive, 
  onIcon: OnIcon, 
  offIcon: OffIcon 
}) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className={`
      w-16 h-16 rounded-full border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
      flex items-center justify-center transition-colors
      ${isActive ? 'bg-white text-black' : 'bg-[#FF6B6B] text-white'}
    `}
  >
    {isActive ? <OnIcon size={24} strokeWidth={3} /> : <OffIcon size={24} strokeWidth={3} />}
  </motion.button>
);

interface Avatar {
  id: string;
  name: string;
  image_url: string;
  agent_id: string;
  system_prompt: string;
}

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get avatar data from URL params
  const avatarId = searchParams.get('avatarId');
  const avatarName = searchParams.get('name');
  const agentId = searchParams.get('agentId');
  const imageUrl = searchParams.get('imageUrl');

  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Redirect if no avatar data
  useEffect(() => {
    if (!avatarId || !agentId) {
      router.push('/dashboard');
    }
  }, [avatarId, agentId, router]);

  const handleRecordingFinished = async (recordedBlob: Blob) => {
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        throw new Error('Missing Cloudinary config');
      }

      const formData = new FormData();
      formData.append('file', recordedBlob, `session_${Date.now()}.webm`);
      formData.append('upload_preset', uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload recording');
      }

      const data = await response.json();
      console.log('Recording uploaded:', data.secure_url);

      // TODO: Save session to database with emotion analysis
      // This would call your API endpoint to save the session
      
    } catch (error) {
      console.error('Error uploading recording:', error);
    }
  };

  const toggleCamera = async () => {
    if (!isCameraOn) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: false 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        streamRef.current = stream;
        setIsCameraOn(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      
      setIsCameraOn(false);
    }
  };

  const toggleMic = () => {
    setIsMicOn(!isMicOn);
  };

  const startSession = () => {
    setIsSessionActive(true);
    
    // Start recording if camera is on
    if (isCameraOn && streamRef.current) {
      try {
        const mediaRecorder = new MediaRecorder(streamRef.current);
        mediaRecorderRef.current = mediaRecorder;
        recordedChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const recordedBlob = new Blob(recordedChunksRef.current, {
            type: 'video/webm'
          });
          handleRecordingFinished(recordedBlob);
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Error starting recording:', error);
      }
    }
  };

  const endSession = () => {
    setIsSessionActive(false);
    
    // Stop recording
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  if (!avatarId || !agentId) {
    return (
      <div className="min-h-screen bg-[#4D96FF] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#4D96FF] font-sans selection:bg-black selection:text-white relative"
         style={{ 
           backgroundImage: 'radial-gradient(circle, #ffffff 10%, transparent 10%)', 
           backgroundSize: '30px 30px' 
         }}>
      
      {/* Header */}
      <div className="relative z-10 p-6">
        <div className="flex items-center justify-between">
          <motion.button
            whileHover={{ x: -2, y: -2, boxShadow: "4px 4px 0px 0px black" }}
            whileTap={{ x: 0, y: 0, boxShadow: "0px 0px 0px 0px black" }}
            onClick={() => router.push('/dashboard')}
            className="bg-white px-5 py-3 rounded-xl border-[3px] border-black shadow-[2px_2px_0px_0px_black] flex items-center gap-2 group transition-all"
          >
            <ArrowLeft size={20} strokeWidth={3} />
            <span className="font-black text-lg">BACK</span>
          </motion.button>

          <div className="text-center">
            <h1 className="text-white font-black text-3xl drop-shadow-lg">
              CHAT WITH {avatarName?.toUpperCase() || 'AVATAR'}
            </h1>
          </div>

          <div className="w-24" /> {/* Spacer for centering */}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 pb-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-200px)]">
            
            {/* Avatar Side */}
            <div className="relative">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-[30px] border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] h-full overflow-hidden"
              >
                {isSessionActive && agentId ? (
                  <SimliElevenLabsAvatarView
                    agentId={agentId}
                    className="w-full h-full"
                    onSpeakingChange={setIsAvatarSpeaking}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-100">
                    <div className="text-center p-8">
                      <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                        {imageUrl ? (
                          <img 
                            src={imageUrl} 
                            alt={avatarName || 'Avatar'} 
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <MessageCircle size={48} strokeWidth={3} />
                        )}
                      </div>
                      <h2 className="text-2xl font-black mb-2">{avatarName || 'Avatar'}</h2>
                      <p className="text-gray-600 font-bold">Ready to chat!</p>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Controls Side */}
            <div className="flex flex-col gap-6">
              
              {/* User Video */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-[30px] border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] h-64 overflow-hidden"
              >
                {isCameraOn ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <VideoOff size={48} strokeWidth={3} className="mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-500 font-bold">Camera Off</p>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Control Buttons */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex justify-center gap-4"
              >
                <ControlButton
                  onClick={toggleCamera}
                  isActive={isCameraOn}
                  onIcon={Video}
                  offIcon={VideoOff}
                />
                <ControlButton
                  onClick={toggleMic}
                  isActive={isMicOn}
                  onIcon={Mic}
                  offIcon={MicOff}
                />
              </motion.div>

              {/* Session Controls */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex-1 flex flex-col justify-center gap-4"
              >
                {!isSessionActive ? (
                  <PopButton
                    onClick={startSession}
                    colorClass="bg-[#6BCB77] text-white"
                    icon={Radio}
                    className="w-full text-2xl py-6"
                  >
                    START CONVERSATION
                  </PopButton>
                ) : (
                  <PopButton
                    onClick={endSession}
                    colorClass="bg-[#FF6B6B] text-white"
                    icon={X}
                    className="w-full text-2xl py-6"
                  >
                    END CONVERSATION
                  </PopButton>
                )}

                {/* Status Indicators */}
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-xl border-[3px] border-black text-center font-black ${
                    isSessionActive ? 'bg-[#6BCB77] text-white' : 'bg-white text-gray-500'
                  }`}>
                    <div className="text-sm">SESSION</div>
                    <div className="text-lg">{isSessionActive ? 'ACTIVE' : 'INACTIVE'}</div>
                  </div>
                  <div className={`p-4 rounded-xl border-[3px] border-black text-center font-black ${
                    isAvatarSpeaking ? 'bg-[#FFD93D] text-black' : 'bg-white text-gray-500'
                  }`}>
                    <div className="text-sm">AI STATUS</div>
                    <div className="text-lg">{isAvatarSpeaking ? 'SPEAKING' : 'LISTENING'}</div>
                  </div>
                </div>

                {isRecording && (
                  <div className="bg-[#FF6B6B] text-white p-3 rounded-xl border-[3px] border-black text-center font-black">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                      RECORDING SESSION
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}