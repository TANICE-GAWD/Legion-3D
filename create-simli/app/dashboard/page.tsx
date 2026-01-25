'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Sparkles, MessageCircle, ArrowLeft, Home, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// --- STYLING HELPERS ---
const CARD_COLORS = [
  'bg-[#FFD93D]', // Yellow
  'bg-[#FF6B6B]', // Red
  'bg-[#A29BFE]', // Purple
  'bg-[#FF9F43]', // Orange
];

const getCardColor = (index: number) => CARD_COLORS[index % CARD_COLORS.length];

interface Avatar {
  id: string;
  name: string;
  image_url: string;
  agent_id: string;
  system_prompt: string;
}

// Reusable Neo-Pop Card Component
interface PopCardProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  color?: string;
  rotate?: number;
}

const PopCard: React.FC<PopCardProps> = ({ 
  onClick, 
  children, 
  className = '', 
  color = 'bg-white', 
  rotate = 0 
}) => (
  <motion.div
    whileHover={{ scale: 1.02, rotate: 0 }}
    whileTap={{ scale: 0.96 }}
    onClick={onClick}
    className={`
      ${color} ${className}
      relative border-[3px] border-black rounded-[30px] p-4
      shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
      cursor-pointer flex flex-col items-center justify-between
      transition-all duration-200 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]
    `}
    style={{ rotate: `${rotate}deg` }}
  >
    {children}
  </motion.div>
);

// Loading Animation Component
const LoadingBounce: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 p-8">
      <div className="flex space-x-2">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="w-4 h-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full"
            animate={{
              y: [-10, 10, -10],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: index * 0.1,
            }}
          />
        ))}
      </div>
      <p className="text-lg text-slate-600 font-semibold">{text}</p>
    </div>
  );
};

export default function Dashboard() {
  const router = useRouter();
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch avatars from API
  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/avatars');
        setAvatars(response.data.avatars || []);
      } catch (error) {
        console.error('Error fetching avatars:', error);
        setError('Failed to load avatars');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvatars();
  }, []);

  const handleAvatarClick = (avatar: Avatar) => {
    const params = new URLSearchParams({
      avatarId: avatar.id,
      name: avatar.name,
      agentId: avatar.agent_id,
      imageUrl: avatar.image_url
    });
    
    router.push(`/chat?${params.toString()}`);
  };

  const handleCreateAvatar = () => {
    router.push('/create-avatar');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#4D96FF] flex items-center justify-center"
           style={{ backgroundImage: 'radial-gradient(circle, #ffffff 10%, transparent 10%)', backgroundSize: '30px 30px' }}>
        <div className="bg-white p-8 rounded-3xl border-[3px] border-black shadow-[8px_8px_0px_0px_black]">
          <LoadingBounce text="GATHERING THE SQUAD..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#4D96FF] font-sans selection:bg-black selection:text-white pb-24 relative"
         style={{ backgroundImage: 'radial-gradient(circle, #ffffff 10%, transparent 10%)', backgroundSize: '30px 30px', backgroundColor: '#4D96FF' }}>
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* --- TOP NAVIGATION --- */}
        <div className="flex justify-between items-center mb-8">
          <motion.button
            whileHover={{ x: -2, y: -2, boxShadow: "4px 4px 0px 0px black" }}
            whileTap={{ x: 0, y: 0, boxShadow: "0px 0px 0px 0px black" }}
            onClick={() => router.push('/')}
            className="bg-white px-5 py-3 rounded-xl border-[3px] border-black shadow-[2px_2px_0px_0px_black] flex items-center gap-2 group transition-all"
          >
            <ArrowLeft size={20} strokeWidth={3} />
            <span className="font-black text-lg">HOME</span>
          </motion.button>

          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-white font-black text-5xl drop-shadow-lg mb-2">
              YOUR AVATARS
            </h1>
            <p className="text-white/80 font-bold text-lg">
              Choose your AI companion
            </p>
          </motion.div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ rotate: 5, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/sessions')}
              className="bg-[#6BCB77] text-white px-4 py-3 rounded-xl border-[3px] border-black shadow-[2px_2px_0px_0px_black] font-black flex items-center gap-2"
            >
              <Activity size={20} strokeWidth={3} />
              SESSIONS
            </motion.button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8">
            <div className="bg-[#FF6B6B] text-white p-6 rounded-3xl border-[3px] border-black shadow-[8px_8px_0px_0px_black] text-center">
              <h3 className="font-black text-xl mb-2">OOPS!</h3>
              <p className="font-bold">{error}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 bg-white text-[#FF6B6B] px-6 py-2 rounded-xl border-[2px] border-black font-black hover:bg-gray-100 transition-colors"
              >
                TRY AGAIN
              </button>
            </div>
          </div>
        )}

        {/* --- AVATARS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          
          {/* Create New Avatar Card */}
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
          >
            <PopCard
              onClick={handleCreateAvatar}
              color="bg-[#6BCB77]"
              className="h-80 text-white"
              rotate={-2}
            >
              <div className="flex-1 flex flex-col items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  className="mb-4"
                >
                  <Plus size={64} strokeWidth={4} />
                </motion.div>
                <h3 className="font-black text-2xl text-center mb-2">
                  CREATE NEW
                </h3>
                <p className="font-bold text-center text-white/90">
                  Build your perfect AI companion
                </p>
              </div>
              <div className="w-full h-2 bg-white/30 rounded-full">
                <motion.div
                  className="h-full bg-white rounded-full"
                  animate={{ width: ["0%", "100%", "0%"] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </PopCard>
          </motion.div>

          {/* Existing Avatars */}
          {avatars.map((avatar, index) => (
            <motion.div
              key={avatar.id}
              initial={{ scale: 0, rotate: 10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: (index + 1) * 0.1,
                type: "spring", 
                bounce: 0.4 
              }}
            >
              <PopCard
                onClick={() => handleAvatarClick(avatar)}
                color={getCardColor(index)}
                className="h-80 text-black"
                rotate={index % 2 === 0 ? 1 : -1}
              >
                <div className="flex-1 flex flex-col items-center justify-center">
                  <div className="w-24 h-24 mb-4 rounded-full border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden bg-white">
                    {avatar.image_url ? (
                      <img 
                        src={avatar.image_url} 
                        alt={avatar.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MessageCircle size={32} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <h3 className="font-black text-xl text-center mb-2 line-clamp-2">
                    {avatar.name.toUpperCase()}
                  </h3>
                  <p className="font-bold text-center text-sm opacity-80 line-clamp-3">
                    {avatar.system_prompt || 'Ready to chat!'}
                  </p>
                </div>
                
                <div className="flex items-center justify-center gap-2 mt-4">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="w-3 h-3 bg-black rounded-full"
                  />
                  <span className="font-black text-sm">READY TO CHAT</span>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                    className="w-3 h-3 bg-black rounded-full"
                  />
                </div>
              </PopCard>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {!isLoading && avatars.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <div className="bg-white/90 backdrop-blur-sm p-12 rounded-3xl border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md mx-auto">
              <Sparkles size={64} strokeWidth={3} className="mx-auto mb-6 text-[#4D96FF]" />
              <h3 className="font-black text-2xl mb-4">NO AVATARS YET!</h3>
              <p className="font-bold text-gray-600 mb-6">
                Create your first AI avatar to get started with amazing conversations.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateAvatar}
                className="bg-[#6BCB77] text-white px-8 py-4 rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black text-lg hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                CREATE YOUR FIRST AVATAR
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}