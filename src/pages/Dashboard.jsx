import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Plus, Sparkles, MessageCircle, ArrowLeft, Home, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Layout, LoadingBounce } from '../components/Layout';

// --- STYLING HELPERS ---
const CARD_COLORS = [
  'bg-[#FFD93D]', // Yellow
  'bg-[#FF6B6B]', // Red
  'bg-[#A29BFE]', // Purple
  'bg-[#FF9F43]', // Orange
];

const getCardColor = (index) => CARD_COLORS[index % CARD_COLORS.length];

const fetchAvatars = async () => {
  const response = await axios.get('/api/avatars');
  return response.data.avatars;
};

// Reusable Neo-Pop Card Component
const PopCard = ({ onClick, children, className = '', color = 'bg-white', rotate = 0 }) => (
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

export const Dashboard = () => {
  const navigate = useNavigate();

  // Fetch avatars
  const { data: avatars = [], isLoading } = useQuery({
    queryKey: ['avatars'],
    queryFn: fetchAvatars,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#4D96FF] flex items-center justify-center"
             style={{ backgroundImage: 'radial-gradient(circle, #ffffff 10%, transparent 10%)', backgroundSize: '30px 30px' }}>
          <div className="bg-white p-8 rounded-3xl border-[3px] border-black shadow-[8px_8px_0px_0px_black]">
            <LoadingBounce text="GATHERING THE SQUAD..." />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* BACKGROUND */}
      <div className="min-h-screen bg-[#4D96FF] font-sans selection:bg-black selection:text-white pb-24 relative"
           style={{ backgroundImage: 'radial-gradient(circle, #ffffff 10%, transparent 10%)', backgroundSize: '30px 30px', backgroundColor: '#4D96FF' }}
      >
        <div className="max-w-7xl mx-auto px-6 py-8">
          
          {/* --- TOP NAVIGATION --- */}
          <div className="flex justify-between items-center mb-8">
            <motion.button
              whileHover={{ x: -2, y: -2, boxShadow: "4px 4px 0px 0px black" }}
              whileTap={{ x: 0, y: 0, boxShadow: "0px 0px 0px 0px black" }}
              onClick={() => navigate('/')}
              className="bg-white px-5 py-3 rounded-xl border-[3px] border-black shadow-[2px_2px_0px_0px_black] flex items-center gap-2 group transition-all"
            >
              <div className="bg-black text-white p-1 rounded-md group-hover:bg-[#FF6B6B] transition-colors">
                 <ArrowLeft size={20} strokeWidth={3} />
              </div>
              <span className="font-black text-black text-sm md:text-base uppercase tracking-wide hidden sm:block">
                Back Home
              </span>
            </motion.button>

            {/* Sessions Button */}
            <motion.button
              whileHover={{ x: 2, y: -2, boxShadow: "6px 6px 0px 0px black" }}
              whileTap={{ x: 0, y: 0, boxShadow: "2px 2px 0px 0px black" }}
              onClick={() => navigate('/sessions')}
              className="bg-[#A29BFE] px-5 py-3 rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_black] flex items-center gap-2 group transition-all"
            >
              <Activity size={20} strokeWidth={3} className="text-black" />
              <span className="font-black text-black text-sm md:text-base uppercase tracking-wide">
                Session History
              </span>
            </motion.button>
          </div>

          {/* HEADER CONTENT */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
            className="text-center mb-16 relative"
          >
            {/* Decorative Stars */}
            <Sparkles className="absolute top-0 left-4 md:left-1/4 w-12 h-12 text-[#FFD93D] animate-pulse" strokeWidth={3} />
            <Sparkles className="absolute bottom-0 right-4 md:right-1/4 w-8 h-8 text-[#FF6B6B] animate-bounce" strokeWidth={3} />

            <div className="inline-block bg-black text-[#FFD93D] px-6 py-2 rounded-full border-[3px] border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] font-black text-xl -rotate-2 mb-4">
              WELCOME BACK! 👋
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-white drop-shadow-[6px_6px_0px_rgba(0,0,0,1)] flex flex-wrap items-center justify-center gap-4 tracking-tight"
                style={{ WebkitTextStroke: '3px black' }}>
              MY AI SQUAD
            </h1>
            <p className="text-2xl font-black text-black mt-4 uppercase tracking-wide">
              Chat, Play, and Learn Together! 🎉
            </p>
          </motion.div>

          {/* AVATAR GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            
            {/* Existing Avatars */}
            {avatars.map((avatar, index) => (
              <motion.div
                key={avatar.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
              >
                <PopCard
                  onClick={() => navigate('/chat', { state: { avatar } })}
                  color={getCardColor(index)}
                  rotate={index % 2 === 0 ? 1 : -1} // Alternate slight rotations
                  className="h-full min-h-[400px]"
                >
                  {/* Avatar Image Frame */}
                  <div className="w-full aspect-square bg-white rounded-[20px] border-[3px] border-black mb-4 overflow-hidden relative shadow-sm group">
                    <img
                      src={avatar.image_url}
                      alt={avatar.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <MessageCircle size={64} className="text-white drop-shadow-lg" strokeWidth={3} />
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="text-center w-full bg-white/50 rounded-xl p-3 border-2 border-black/10">
                    <h3 className="text-3xl font-black text-black uppercase leading-none mb-2">
                      {avatar.name}
                    </h3>
                    <div className="flex items-center justify-center gap-2">
                       <span className="bg-black text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
                         Chat Now
                       </span>
                    </div>
                  </div>

                  {/* Decorative Pin */}
                  <div className="absolute -top-3 bg-white w-6 h-6 rounded-full border-[3px] border-black shadow-sm z-10" />
                </PopCard>
              </motion.div>
            ))}

            {/* Create New Card (Distinct Style) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: avatars.length * 0.1, duration: 0.4 }}
            >
              <PopCard
                onClick={() => navigate('/create')}
                color="bg-[#6BCB77]" // distinct Green for "Go"
                rotate={2}
                className="h-full min-h-[400px] justify-center group"
              >
                <motion.div
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.3 }}
                  className="mb-6 bg-white rounded-full p-6 border-[3px] border-black shadow-[4px_4px_0px_0px_black]"
                >
                  <Plus className="w-16 h-16 text-black" strokeWidth={4} />
                </motion.div>
                
                <h3 className="text-4xl font-black text-white drop-shadow-[3px_3px_0px_black] text-center uppercase leading-none"
                    style={{ WebkitTextStroke: '1.5px black' }}>
                  Create <br/> New Friend
                </h3>
                
                <div className="mt-4 bg-black text-[#6BCB77] px-4 py-2 rounded-lg font-black uppercase text-sm border-[2px] border-white shadow-lg">
                   Let's Build! 🛠️
                </div>
              </PopCard>
            </motion.div>

          </div>

          {/* Empty State / Encouragement (if no friends yet) */}
          {avatars.length === 0 && !isLoading && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="mt-12 text-center"
            >
              <div className="inline-block bg-white p-6 rounded-2xl border-[3px] border-black shadow-[8px_8px_0px_0px_black] rotate-1">
                <p className="text-2xl font-black">It's quiet in here... click the Green Card to start! 🚀</p>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </Layout>
  );
};