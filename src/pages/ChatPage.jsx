import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Video, VideoOff, Mic, MicOff, MessageCircle, Radio, X } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { AgentChat } from '../components/AgentChat';
import { AvatarView } from '../components/AvatarView';

// --- NEO-POP COMPONENTS ---

// 1. Hard Shadow Button
const PopButton = ({ onClick, disabled, children, colorClass = 'bg-black text-white', icon: Icon, className = '' }) => (
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
const ControlButton = ({ onClick, isActive, onIcon: OnIcon, offIcon: OffIcon }) => (
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

export const ChatPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const avatar = location.state?.avatar;

  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);

  // Redirect if no avatar data
  useEffect(() => {
    if (!avatar) {
      navigate('/dashboard');
    }
  }, [avatar, navigate]);

  const handleRecordingFinished = async (recordedBlob) => {
    try {
      const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

      if (!cloudName || !uploadPreset) {
        throw new Error('Missing Cloudinary config');
      }

      const formData = new FormData();
      formData.append('file', recordedBlob, `session_${Date.now()}.webm`);
      formData.append('upload_preset', uploadPreset);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
        { method: 'POST', body: formData }
      );

      if (!response.ok) throw new Error(`Cloudinary upload failed: ${response.status}`);

      const data = await response.json();
      const videoUrl = data.secure_url || data.url;
      console.log('Cloudinary URL:', videoUrl);

      // Send the Cloudinary URL to your backend for further processing
      try {
        const backendResponse = await fetch(
          'https://besotted-mallory-prenebular.ngrok-free.dev/process-session',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              avatar_id: avatar?.id ?? avatar?.agent_id ?? 'unknown-avatar',
              video_url: videoUrl,
            }),
          }
        );

        if (!backendResponse.ok) {
          console.error('Backend processing failed:', backendResponse.status);
        }
      } catch (backendError) {
        console.error('Error calling backend /process-session:', backendError);
      }
    } catch (error) {
      console.error('Error uploading recorded session:', error);
    }
  };

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      if (videoRef.current) videoRef.current.srcObject = stream;
      streamRef.current = stream;

      try {
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' });
        recordedChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) recordedChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          if (recordedChunksRef.current.length > 0) {
            const recordedBlob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
            recordedChunksRef.current = [];
            await handleRecordingFinished(recordedBlob);
          }
          setIsRecording(false);
        };

        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
        setIsRecording(true);
      } catch (recorderError) {
        console.error('Error starting MediaRecorder:', recorderError);
      }

      setIsCameraOn(true);
      setIsMicOn(true);
    } catch (error) {
      console.error('Error accessing webcam:', error);
      alert('Unable to access camera. Please check permissions!');
    }
  };

  const stopWebcam = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
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
    if (isSessionActive && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [isSessionActive]);

  useEffect(() => {
    return () => stopWebcam();
  }, []);

  if (!avatar) return null;

  return (
    <Layout>
      <div className="min-h-screen bg-[#4D96FF] font-sans selection:bg-black selection:text-white pb-24"
           style={{ backgroundImage: 'radial-gradient(circle, #ffffff 10%, transparent 10%)', backgroundSize: '30px 30px', backgroundColor: '#4D96FF' }}
      >
        <div className="max-w-7xl mx-auto px-6 py-12">
          
          {/* HEADER */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
            className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6"
          >
             <div className="flex items-center gap-4">
                <PopButton onClick={() => navigate('/dashboard')} colorClass="bg-white text-black" icon={ArrowLeft} className="w-auto">
                  Back
                </PopButton>
             </div>

             <div className="text-right">
                <h1 className="text-5xl font-black text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] uppercase tracking-tight"
                    style={{ WebkitTextStroke: '2px black' }}>
                  Chat with {avatar.name}
                </h1>
                <p className="text-xl font-black text-black uppercase mt-1">Let's have some fun! 💬</p>
             </div>
          </motion.div>

          {/* MAIN GRID */}
          <div className="grid md:grid-cols-2 gap-8 items-start">
            
            {/* LEFT SIDE: AVATAR DISPLAY (TV Style) */}
            <div className="space-y-8">
              
              {/* The "TV" Frame */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative bg-[#FFD93D] p-4 rounded-[40px] border-[4px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
              >
                {/* Antenna Decoration */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-12 border-l-[4px] border-r-[4px] border-black border-t-0 opacity-0 md:opacity-100 rotate-12"></div>
                
                <div className="bg-white border-[3px] border-black rounded-[30px] overflow-hidden aspect-square relative shadow-[inset_0px_0px_20px_rgba(0,0,0,0.1)]">
                   {isSessionActive ? (
                      <AvatarView isSpeaking={isAvatarSpeaking} />
                   ) : (
                      <img
                        src={avatar.image_url}
                        alt={avatar.name}
                        className="w-full h-full object-cover"
                      />
                   )}
                   
                   {/* "On Air" Indicator */}
                   {isSessionActive && (
                     <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full border-2 border-white shadow-md flex items-center gap-2 animate-pulse">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                        <span className="font-black text-xs uppercase">Live</span>
                     </div>
                   )}
                </div>

                {/* TV Knobs Decoration */}
                <div className="mt-4 flex justify-between items-center px-4">
                   <div className="flex gap-2">
                      <div className="w-4 h-4 rounded-full bg-black"></div>
                      <div className="w-4 h-4 rounded-full bg-black/50"></div>
                      <div className="w-4 h-4 rounded-full bg-black/50"></div>
                   </div>
                   <div className="h-2 w-32 bg-black/10 rounded-full"></div>
                </div>
              </motion.div>

              {/* Avatar Info Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-[#A29BFE] border-[3px] border-black rounded-3xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rotate-[-1deg]"
              >
                <h3 className="text-2xl font-black text-black mb-2 uppercase flex items-center gap-2">
                  <Radio size={24} /> About {avatar.name}
                </h3>
                <p className="font-bold text-black/80 text-lg leading-snug">
                  {avatar.system_prompt}
                </p>
              </motion.div>
            </div>

            {/* RIGHT SIDE: INTERACTION ZONE */}
            <div className="space-y-6">
              
              {/* START BUTTON STATE */}
              {!isSessionActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: 'spring', bounce: 0.6 }}
                  className="flex flex-col items-center justify-center min-h-[400px] bg-white/50 rounded-[40px] border-[4px] border-black border-dashed p-8"
                >
                  <motion.div
                    animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-full"
                  >
                    <PopButton
                      onClick={handleStartTalking}
                      colorClass="bg-[#6BCB77] text-white"
                      className="text-3xl py-8 w-full shadow-[8px_8px_0px_0px_black] hover:shadow-[12px_12px_0px_0px_black]"
                    >
                      <Mic size={40} strokeWidth={3} className="mr-4" />
                      START TALKING
                    </PopButton>
                  </motion.div>
                  <p className="font-black text-black/60 text-xl mt-6 uppercase text-center">
                    Click the Green Button to start your conversation!
                  </p>
                </motion.div>
              )}

              {/* ACTIVE SESSION STATE */}
              {isSessionActive && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Webcam Frame (The "Monitor") */}
                  <div className="relative rounded-[30px] overflow-hidden bg-black border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <div className="aspect-video relative bg-slate-800">
                        <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover scale-x-[-1]"
                        />
                        
                        {!isCameraOn && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#2d3436] text-white/50 gap-2">
                            <VideoOff className="w-16 h-16" strokeWidth={1.5} />
                            <span className="font-black uppercase">Camera Off</span>
                        </div>
                        )}
                    </div>

                    {/* Floating Controls */}
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-6">
                        <ControlButton onClick={toggleCamera} isActive={isCameraOn} onIcon={Video} offIcon={VideoOff} />
                        <ControlButton onClick={toggleMic} isActive={isMicOn} onIcon={Mic} offIcon={MicOff} />
                    </div>
                  </div>

                  {/* Chat Box / Transcript Area */}
                  <div className="bg-white border-[3px] border-black rounded-3xl p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center gap-2 mb-4 border-b-2 border-black/10 pb-2">
                       <MessageCircle size={20} />
                       <span className="font-black uppercase text-sm">Conversation Log</span>
                    </div>
                    {/* ElevenLabs Chat Component */}
                    <div className="min-h-[100px]">
                       <AgentChat 
                        agentId={avatar.agent_id} 
                        onSpeakingChange={setIsAvatarSpeaking} 
                        />
                    </div>
                  </div>

                  {/* End Session Button */}
                  <PopButton
                    onClick={handleStartTalking}
                    colorClass="bg-[#FF6B6B] text-white"
                    icon={X}
                  >
                    END CONVERSATION
                  </PopButton>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};