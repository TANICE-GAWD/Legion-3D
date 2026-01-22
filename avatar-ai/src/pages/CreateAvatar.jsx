import React, { useState, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, ArrowLeft, Play, Pause, Check,
  Wand2, Rocket, Star, Heart, Zap, Smile, Volume2,
  Image as ImageIcon, Globe, Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Layout } from '../components/Layout';

// --- DATA FROM YOUR SNIPPET ---
const VOICE_OPTIONS = [
  { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', gender: 'Male', accent: 'American' },
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', gender: 'Female', accent: 'American' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', gender: 'Female', accent: 'American' },
  { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian', gender: 'Male', accent: 'American' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi', gender: 'Female', accent: 'American' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni', gender: 'Male', accent: 'American' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', gender: 'Female', accent: 'American' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', gender: 'Male', accent: 'American' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold', gender: 'Male', accent: 'American' },
  { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', gender: 'Female', accent: 'British' }
];

// Helper to assign Neo-Pop colors to voices
const getVoiceColor = (index) => {
  const colors = ['bg-[#FFD93D]', 'bg-[#FF6B6B]', 'bg-[#6BCB77]', 'bg-[#4D96FF]', 'bg-[#A29BFE]'];
  return colors[index % colors.length];
};

// --- NEO-POP COMPONENTS ---

// 1. Hard Shadow Button
const PopButton = ({ onClick, disabled, children, colorClass = 'bg-black text-white', icon: Icon, className = '' }) => (
  <motion.button
    whileHover={{ x: -2, y: -2 }}
    whileTap={{ x: 2, y: 2 }}
    onClick={onClick}
    disabled={disabled}
    className={`
      relative w-full py-4 px-6 rounded-xl font-black text-xl border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
      flex items-center justify-center gap-3 transition-all
      ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : `${colorClass} hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]`}
      ${className}
    `}
  >
    {Icon && <Icon size={24} strokeWidth={3} />}
    {children}
  </motion.button>
);

// 2. Section Card
const SectionCard = ({ title, color, icon: Icon, children, rotate = 0 }) => (
  <div
    className={`
      ${color} p-6 rounded-3xl border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative
      transform transition-transform hover:scale-[1.01] mb-8
    `}
    style={{ rotate: `${rotate}deg` }}
  >
    <div className="absolute -top-6 left-6 bg-black text-white px-4 py-2 rounded-lg border-[3px] border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] flex items-center gap-2 transform -rotate-2 z-10">
      <Icon size={18} className="text-[#FFD93D]" />
      <span className="font-black uppercase tracking-wider text-sm">{title}</span>
    </div>
    <div className="mt-4">
      {children}
    </div>
  </div>
);

export const CreateAvatar = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [playingVoice, setPlayingVoice] = useState(null);
  const [showCloneVoicePopup, setShowCloneVoicePopup] = useState(false);
  const fileInputRef = useRef(null);

  // State from your snippet
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    knowledgeBase: '',
    imageUrl: '',
    systemPrompt: '',
    voiceId: VOICE_OPTIONS[0].id,
    language: 'en'
  });

  // --- API ---
  const generateImageMutation = useMutation({
    mutationFn: async (data) => (await axios.post('/api/generate-image', data)).data,
    onSuccess: (data) => setFormData(prev => ({ ...prev, imageUrl: data.image_url })),
  });

  const generatePromptMutation = useMutation({
    mutationFn: async (data) => (await axios.post('/api/generate-prompt', data)).data,
    onSuccess: (data) => setFormData(prev => ({ ...prev, systemPrompt: data.system_prompt })),
  });

  const createAvatarMutation = useMutation({
    mutationFn: async (data) => (await axios.post('/api/create-agent', data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries(['avatars']);
      navigate('/dashboard');
    },
  });

  // --- HANDLERS ---
  const handleGenerateImage = () => {
    if (formData.name.trim()) {
      generateImageMutation.mutate({
        name: formData.name,
        description: formData.description || 'portrait',
      });
    }
  };

  const uploadImageMutation = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post('/api/upload-avatar-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: (data) => {
      setFormData(prev => ({ ...prev, imageUrl: data.image_url }));
    },
  });

  const handleUploadImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    uploadImageMutation.mutate(file);
  };

  const handleGeneratePrompt = () => {
    if (formData.knowledgeBase.trim()) {
      generatePromptMutation.mutate({
        knowledge_base: formData.knowledgeBase,
      });
    }
  };

  const handleSaveFriend = () => {
    if (formData.name && formData.imageUrl && formData.systemPrompt) {
      createAvatarMutation.mutate({
        name: formData.name,
        image_url: formData.imageUrl,
        system_prompt: formData.systemPrompt,
        voice_id: formData.voiceId,
        language: formData.language,
        first_message: `Hi! I'm ${formData.name}. Let's chat!`,
        model_id: formData.language === 'en' ? 'eleven_turbo_v2' : 'eleven_turbo_v2_5',
      });
    }
  };

  const toggleVoice = (e, id) => {
    e.stopPropagation();
    setPlayingVoice(playingVoice === id ? null : id);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#4D96FF] p-6 font-sans selection:bg-black selection:text-white pb-24"
        style={{ backgroundImage: 'radial-gradient(circle, #ffffff 10%, transparent 10%)', backgroundSize: '30px 30px', backgroundColor: '#4D96FF' }}
      >
        <div className="max-w-7xl mx-auto">

          {/* HEADER */}
          <div className="flex justify-between items-center mb-10">
            <PopButton onClick={() => navigate('/dashboard')} colorClass="bg-white text-black" icon={ArrowLeft} className="w-auto">
              Back
            </PopButton>
            <div className="hidden md:block bg-black text-[#FFD93D] px-6 py-3 rounded-full border-[3px] border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] font-black text-xl rotate-1">
              BUILD-A-BUDDY WORKSHOP 🛠️
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-start">

            {/* LEFT COLUMN: The Inputs */}
            <div className="lg:col-span-7">

              <div className="text-center lg:text-left mb-8">
                <h1 className="text-6xl font-black text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] tracking-tight"
                  style={{ WebkitTextStroke: '2px black' }}>
                  MAKE YOUR <br /> <span className="text-[#FFD93D]">NEW BEST FRIEND!</span>
                </h1>
              </div>

              {/* CARD 1: IDENTITY & LANGUAGE (RED) */}
              <SectionCard title="Step 1: The Basics" color="bg-[#FF6B6B]" icon={Smile} rotate={-1}>
                <div className="space-y-4">
                  <div>
                    <label className="font-black text-black text-lg mb-1 block">NAME *</label>
                    <input
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Buddy the Robot"
                      className="w-full text-2xl font-black p-4 rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-black text-black text-lg mb-1 block flex items-center gap-2">
                      LANGUAGE <Globe size={20} />
                    </label>
                    <div className="relative">
                      <select
                        value={formData.language}
                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                        className="w-full text-xl font-bold p-4 rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] outline-none appearance-none bg-white cursor-pointer"
                      >
                        <option value="en">English 🇬🇧</option>
                        <option value="hi">Hindi 🇮🇳</option>
                        <option value="es">Spanish 🇪🇸</option>
                        <option value="fr">French 🇫🇷</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <ArrowLeft className="-rotate-90" strokeWidth={3} />
                      </div>
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* CARD 2: APPEARANCE (YELLOW) */}
              <SectionCard title="Step 2: Appearance" color="bg-[#FFD93D]" icon={ImageIcon} rotate={1}>
                <div className="space-y-4">
                  <div>
                    <label className="font-black text-black text-lg mb-1 block">DESCRIPTION</label>
                    <input
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      placeholder="e.g. friendly cartoon, colorful"
                      className="w-full text-lg font-bold p-4 rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] outline-none bg-white"
                    />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <PopButton
                      onClick={handleGenerateImage}
                      disabled={!formData.name || generateImageMutation.isPending}
                      colorClass="bg-black text-white"
                      icon={Wand2}
                    >
                      {generateImageMutation.isPending ? 'PAINTING...' : 'GENERATE IMAGE'}
                    </PopButton>

                    <PopButton
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadImageMutation.isPending}
                      colorClass="bg-white text-black"
                      icon={ImageIcon}
                    >
                      {uploadImageMutation.isPending ? 'UPLOADING...' : 'UPLOAD PHOTO'}
                    </PopButton>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleUploadImage}
                    className="hidden"
                  />
                </div>
              </SectionCard>

              {/* CARD 3: PERSONALITY (BLUE) - ADDED BUTTON */}
              <SectionCard title="Step 3: Personality" color="bg-[#4D96FF]" icon={Zap} rotate={-0.5}>
                <div className="space-y-4">
                  <div>
                    <label className="font-black text-black text-lg mb-1 block">KNOWLEDGE BASE *</label>
                    <textarea
                      value={formData.knowledgeBase}
                      onChange={e => setFormData({ ...formData, knowledgeBase: e.target.value })}
                      placeholder="Tell us what your friend is good at! (e.g. Helping with homework, jokes)"
                      rows={4}
                      className="w-full text-lg font-bold p-4 rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] outline-none resize-none bg-white"
                    />
                  </div>
                  <PopButton
                    onClick={handleGeneratePrompt}
                    disabled={!formData.knowledgeBase || generatePromptMutation.isPending}
                    colorClass="bg-[#FFF]"
                    className="text-black"
                    icon={Sparkles}
                  >
                    {generatePromptMutation.isPending ? 'GENERATING...' : 'GENERATE PERSONALITY'}
                  </PopButton>
                </div>
              </SectionCard>

              {/* CARD 4: VOICE (GREEN) - ADDED CLONE BUTTON & FULL LIST */}
              <SectionCard title="Step 4: Pick a Voice" color="bg-[#6BCB77]" icon={Volume2} rotate={1}>
                <div className="space-y-4">

                  {/* Clone Voice Button */}
                  <PopButton
                    onClick={() => setShowCloneVoicePopup(true)}
                    colorClass="bg-[#F0F0F0] text-black"
                    icon={Sparkles}
                  >
                    CLONE YOUR OWN VOICE ✨
                  </PopButton>

                  <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {VOICE_OPTIONS.map((voice, idx) => (
                      <motion.div
                        key={voice.id}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setFormData({ ...formData, voiceId: voice.id })}
                        className={`
                          cursor-pointer border-[3px] border-black rounded-xl p-3 flex flex-col gap-2 relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all
                          ${getVoiceColor(idx)}
                          ${formData.voiceId === voice.id ? 'translate-x-[2px] translate-y-[2px] shadow-none ring-4 ring-white' : 'hover:-translate-y-1'}
                        `}
                      >
                        <div className="flex justify-between items-start">
                          <span className="font-black text-black uppercase text-sm">{voice.name}</span>
                          {formData.voiceId === voice.id && <div className="bg-black text-white rounded-full p-1"><Check size={10} strokeWidth={4} /></div>}
                        </div>

                        <div className="flex flex-wrap gap-1">
                          <span className="text-[10px] font-bold bg-black/10 px-1 rounded">{voice.gender}</span>
                          <span className="text-[10px] font-bold bg-black/10 px-1 rounded">{voice.accent}</span>
                        </div>

                        <button
                          onClick={(e) => toggleVoice(e, voice.id)}
                          className="mt-2 w-full py-2 bg-white border-2 border-black rounded-lg flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                        >
                          {playingVoice === voice.id ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </SectionCard>

            </div>

            {/* RIGHT COLUMN: Sticky Preview */}
            <div className="lg:col-span-5 relative">
              <div className="sticky top-6">

                <div className="bg-[#A29BFE] p-6 rounded-[40px] border-[4px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rotate-1">

                  <div className="flex justify-center -mt-10 mb-6">
                    <div className="bg-black text-white px-8 py-2 rounded-full border-[3px] border-white font-black text-xl shadow-lg">
                      YOUR FRIEND
                    </div>
                  </div>

                  {/* Image Preview */}
                  <div className="bg-white p-4 rounded-[30px] border-[3px] border-black mb-6 shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.1)]">
                    <div className="aspect-square bg-slate-100 rounded-[20px] overflow-hidden border-[2px] border-black relative">
                      {generateImageMutation.isPending ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FFD93D]">
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
                            <Star size={60} strokeWidth={3} className="text-black" />
                          </motion.div>
                          <p className="mt-4 font-black text-xl">PAINTING...</p>
                        </div>
                      ) : formData.imageUrl ? (
                        <img src={formData.imageUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#f0f0f0] text-gray-400">
                          <ImageIcon size={64} />
                          <p className="font-black mt-2">NO PHOTO YET</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Generated Personality Preview */}
                  {formData.systemPrompt && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-[#6BCB77] p-4 rounded-xl border-[3px] border-black mb-6"
                    >
                      <p className="font-black text-black text-xs uppercase mb-1">Generated Personality:</p>
                      <p className="font-bold text-sm line-clamp-3">{formData.systemPrompt}</p>
                    </motion.div>
                  )}

                  {/* Stats & Save */}
                  <div className="text-center space-y-4">
                    <div>
                      <h2 className="text-4xl font-black text-black uppercase break-words leading-none mb-2">{formData.name || "???"}</h2>
                      <p className="font-bold text-black/60 uppercase tracking-widest text-sm">
                        {VOICE_OPTIONS.find(v => v.id === formData.voiceId)?.name}
                      </p>
                    </div>

                    <PopButton
                      onClick={handleSaveFriend}
                      disabled={!formData.systemPrompt || createAvatarMutation.isPending}
                      colorClass="bg-[#FF6B6B] text-white"
                      icon={Rocket}
                    >
                      {createAvatarMutation.isPending ? "BUILDING..." : "SAVE FRIEND!"}
                    </PopButton>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* --- CLONE VOICE POPUP (Neo-Pop Style) --- */}
        <AnimatePresence>
          {showCloneVoicePopup && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              onClick={() => setShowCloneVoicePopup(false)}
            >
              <motion.div
                initial={{ scale: 0.8, y: 50, rotate: -2 }}
                animate={{ scale: 1, y: 0, rotate: 0 }}
                exit={{ scale: 0.8, y: 50 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-[#FFD93D] rounded-3xl p-8 max-w-md w-full border-[4px] border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden"
              >
                {/* Close Button */}
                <button onClick={() => setShowCloneVoicePopup(false)} className="absolute top-4 right-4 font-black hover:scale-110">X</button>

                <div className="text-center relative z-10">
                  <div className="w-20 h-20 bg-white border-[3px] border-black rounded-full flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Sparkles className="w-10 h-10 text-black" strokeWidth={3} />
                  </div>

                  <h2 className="text-3xl font-black text-black mb-4 uppercase leading-none">
                    Clone Your Voice 🎤
                  </h2>

                  <p className="text-lg font-bold text-black/70 mb-6">
                    Create an AI that sounds exactly like you! Upload voice samples to train a custom model.
                  </p>

                  {/* Price Tag */}
                  <div className="bg-white border-[3px] border-black rounded-xl p-4 mb-6 rotate-1">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-4xl font-black text-[#FF6B6B]">$5</span>
                      <span className="font-bold text-black">/month</span>
                    </div>
                    <p className="text-xs font-black uppercase mt-1">Unlimited voice clones</p>
                  </div>

                  {/* Checklist */}
                  <ul className="text-left font-bold text-black space-y-2 mb-8 pl-4">
                    <li className="flex items-center gap-2"><Check className="text-[#6BCB77]" strokeWidth={4} /> High-quality cloning</li>
                    <li className="flex items-center gap-2"><Check className="text-[#6BCB77]" strokeWidth={4} /> Unlimited voices</li>
                    <li className="flex items-center gap-2"><Check className="text-[#6BCB77]" strokeWidth={4} /> Priority Support</li>
                  </ul>

                  <div className="flex gap-4">
                    <PopButton
                      onClick={() => setShowCloneVoicePopup(false)}
                      colorClass="bg-white text-black"
                      className="text-base"
                    >
                      Maybe Later
                    </PopButton>
                    <PopButton
                      onClick={() => { }}
                      colorClass="bg-[#FF6B6B] text-white"
                      className="text-base"
                    >
                      Upgrade Now
                    </PopButton>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </Layout>
  );
};