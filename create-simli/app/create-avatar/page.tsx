'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Upload, Wand2, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

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

export default function CreateAvatar() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data
  const [avatarName, setAvatarName] = useState('');
  const [description, setDescription] = useState('portrait');
  const [knowledgeBase, setKnowledgeBase] = useState('');
  const [voiceId, setVoiceId] = useState('21m00Tcm4TlvDq8ikWAM'); // Default ElevenLabs voice
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);

  const handleGenerateImage = async () => {
    if (!avatarName.trim()) {
      setError('Please enter an avatar name');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/generate-image', {
        name: avatarName,
        description: description
      });

      setGeneratedImage(response.data.image_url);
      setStep(2);
    } catch (error: any) {
      console.error('Error generating image:', error);
      setError(error.response?.data?.error || 'Failed to generate image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePrompt = async () => {
    if (!knowledgeBase.trim()) {
      setError('Please describe your avatar\'s personality');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/generate-prompt', {
        knowledge_base: knowledgeBase
      });

      setGeneratedPrompt(response.data.system_prompt);
      setStep(3);
    } catch (error: any) {
      console.error('Error generating prompt:', error);
      setError(error.response?.data?.error || 'Failed to generate prompt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAgent = async () => {
    if (!generatedPrompt || !generatedImage) {
      setError('Missing required data');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/create-agent', {
        name: avatarName,
        image_url: generatedImage,
        system_prompt: generatedPrompt,
        voice_id: voiceId,
        language: 'en',
        first_message: `Hello! I'm ${avatarName}. How can I help you today?`
      });

      // Redirect to chat with the new avatar
      const params = new URLSearchParams({
        avatarId: response.data.db_record?.id || 'new',
        name: avatarName,
        agentId: response.data.agent_id,
        imageUrl: generatedImage
      });
      
      router.push(`/chat?${params.toString()}`);
    } catch (error: any) {
      console.error('Error creating agent:', error);
      setError(error.response?.data?.error || 'Failed to create agent');
    } finally {
      setIsLoading(false);
    }
  };

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
            <h1 className="text-white font-black text-4xl drop-shadow-lg">
              CREATE YOUR AVATAR
            </h1>
            <p className="text-white/80 font-bold text-lg">
              Step {step} of 3
            </p>
          </div>

          <div className="w-24" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 pb-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-[#FF6B6B] text-white p-4 rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center font-black"
            >
              {error}
            </motion.div>
          )}

          {/* Step 1: Generate Image */}
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[30px] border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8"
            >
              <div className="text-center mb-8">
                <Sparkles size={48} strokeWidth={3} className="mx-auto mb-4 text-[#4D96FF]" />
                <h2 className="text-3xl font-black mb-2">DESIGN YOUR AVATAR</h2>
                <p className="text-gray-600 font-bold">Let's create a unique look for your AI companion</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-black mb-2">Avatar Name</label>
                  <input
                    type="text"
                    value={avatarName}
                    onChange={(e) => setAvatarName(e.target.value)}
                    placeholder="Enter your avatar's name..."
                    className="w-full p-4 border-[3px] border-black rounded-xl font-bold text-lg focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-lg font-black mb-2">Description</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="portrait, professional, friendly..."
                    className="w-full p-4 border-[3px] border-black rounded-xl font-bold text-lg focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                  />
                </div>

                <PopButton
                  onClick={handleGenerateImage}
                  disabled={isLoading || !avatarName.trim()}
                  colorClass="bg-[#6BCB77] text-white"
                  icon={Wand2}
                  className="w-full text-2xl py-6"
                >
                  {isLoading ? 'GENERATING...' : 'GENERATE AVATAR IMAGE'}
                </PopButton>
              </div>
            </motion.div>
          )}

          {/* Step 2: Generate Personality */}
          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[30px] border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8"
            >
              <div className="text-center mb-8">
                <MessageCircle size={48} strokeWidth={3} className="mx-auto mb-4 text-[#4D96FF]" />
                <h2 className="text-3xl font-black mb-2">DEFINE PERSONALITY</h2>
                <p className="text-gray-600 font-bold">Describe how your avatar should behave and respond</p>
              </div>

              {generatedImage && (
                <div className="flex justify-center mb-6">
                  <div className="w-32 h-32 rounded-full border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                    <img src={generatedImage} alt={avatarName} className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-black mb-2">Avatar Personality & Knowledge</label>
                  <textarea
                    value={knowledgeBase}
                    onChange={(e) => setKnowledgeBase(e.target.value)}
                    placeholder="Describe your avatar's personality, expertise, and how they should interact with users..."
                    rows={6}
                    className="w-full p-4 border-[3px] border-black rounded-xl font-bold text-lg focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-lg font-black mb-2">Voice ID (ElevenLabs)</label>
                  <select
                    value={voiceId}
                    onChange={(e) => setVoiceId(e.target.value)}
                    className="w-full p-4 border-[3px] border-black rounded-xl font-bold text-lg focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    <option value="21m00Tcm4TlvDq8ikWAM">Rachel (Female)</option>
                    <option value="AZnzlk1XvdvUeBnXmlld">Domi (Female)</option>
                    <option value="EXAVITQu4vr4xnSDxMaL">Bella (Female)</option>
                    <option value="ErXwobaYiN019PkySvjV">Antoni (Male)</option>
                    <option value="MF3mGyEYCl7XYWbV9V6O">Elli (Female)</option>
                    <option value="TxGEqnHWrfWFTfGW9XjX">Josh (Male)</option>
                  </select>
                </div>

                <PopButton
                  onClick={handleGeneratePrompt}
                  disabled={isLoading || !knowledgeBase.trim()}
                  colorClass="bg-[#A29BFE] text-white"
                  icon={Wand2}
                  className="w-full text-2xl py-6"
                >
                  {isLoading ? 'GENERATING...' : 'GENERATE PERSONALITY'}
                </PopButton>
              </div>
            </motion.div>
          )}

          {/* Step 3: Review & Create */}
          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[30px] border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8"
            >
              <div className="text-center mb-8">
                <MessageCircle size={48} strokeWidth={3} className="mx-auto mb-4 text-[#4D96FF]" />
                <h2 className="text-3xl font-black mb-2">REVIEW & CREATE</h2>
                <p className="text-gray-600 font-bold">Your avatar is ready to be created!</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xl font-black mb-4">Avatar Preview</h3>
                  {generatedImage && (
                    <div className="w-full h-64 rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                      <img src={generatedImage} alt={avatarName} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="mt-4 text-center">
                    <h4 className="text-lg font-black">{avatarName}</h4>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-black mb-4">Generated Personality</h3>
                  <div className="p-4 border-[3px] border-black rounded-xl bg-gray-50 h-64 overflow-y-auto">
                    <p className="font-bold text-sm">{generatedPrompt}</p>
                  </div>
                </div>
              </div>

              <PopButton
                onClick={handleCreateAgent}
                disabled={isLoading}
                colorClass="bg-[#FFD93D] text-black"
                icon={Sparkles}
                className="w-full text-2xl py-6"
              >
                {isLoading ? 'CREATING AVATAR...' : 'CREATE AVATAR & START CHATTING'}
              </PopButton>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}