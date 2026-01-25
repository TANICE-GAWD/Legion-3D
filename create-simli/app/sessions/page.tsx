'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, MessageCircle, Video } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Session {
  id: string;
  created_at: string;
  avatar_id: string;
  video_url?: string;
  audio_url?: string;
  emotion_report?: any;
  avatars: {
    id: string;
    name: string;
    image_url: string;
  };
}

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

export default function Sessions() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('/api/sessions');
        setSessions(response.data.sessions || []);
      } catch (error) {
        console.error('Error fetching sessions:', error);
        setError('Failed to load sessions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#4D96FF] flex items-center justify-center"
           style={{ backgroundImage: 'radial-gradient(circle, #ffffff 10%, transparent 10%)', backgroundSize: '30px 30px' }}>
        <div className="bg-white p-8 rounded-3xl border-[3px] border-black shadow-[8px_8px_0px_0px_black]">
          <LoadingBounce text="LOADING SESSIONS..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#4D96FF] font-sans selection:bg-black selection:text-white pb-24 relative"
         style={{ backgroundImage: 'radial-gradient(circle, #ffffff 10%, transparent 10%)', backgroundSize: '30px 30px', backgroundColor: '#4D96FF' }}>
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <motion.button
            whileHover={{ x: -2, y: -2, boxShadow: "4px 4px 0px 0px black" }}
            whileTap={{ x: 0, y: 0, boxShadow: "0px 0px 0px 0px black" }}
            onClick={() => router.push('/dashboard')}
            className="bg-white px-5 py-3 rounded-xl border-[3px] border-black shadow-[2px_2px_0px_0px_black] flex items-center gap-2 group transition-all"
          >
            <ArrowLeft size={20} strokeWidth={3} />
            <span className="font-black text-lg">BACK</span>
          </motion.button>

          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-white font-black text-5xl drop-shadow-lg mb-2">
              CONVERSATION HISTORY
            </h1>
            <p className="text-white/80 font-bold text-lg">
              Your chat sessions with AI avatars
            </p>
          </motion.div>

          <div className="w-24" />
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

        {/* Sessions Grid */}
        {sessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ scale: 0, rotate: 5 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  type: "spring", 
                  bounce: 0.4 
                }}
                className="bg-white rounded-[30px] border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                onClick={() => {
                  // Navigate to session details or replay
                  console.log('Session clicked:', session.id);
                }}
              >
                {/* Avatar Info */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden bg-gray-100">
                    {session.avatars?.image_url ? (
                      <img 
                        src={session.avatars.image_url} 
                        alt={session.avatars.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <MessageCircle size={24} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-lg">{session.avatars?.name || 'Unknown Avatar'}</h3>
                    <p className="text-gray-600 font-bold text-sm">Conversation Session</p>
                  </div>
                </div>

                {/* Session Details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar size={16} strokeWidth={3} />
                    <span className="font-bold text-sm">{formatDate(session.created_at)}</span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {session.video_url && (
                      <div className="flex items-center gap-1 text-green-600">
                        <Video size={16} strokeWidth={3} />
                        <span className="font-bold text-xs">VIDEO</span>
                      </div>
                    )}
                    {session.audio_url && (
                      <div className="flex items-center gap-1 text-blue-600">
                        <MessageCircle size={16} strokeWidth={3} />
                        <span className="font-bold text-xs">AUDIO</span>
                      </div>
                    )}
                  </div>

                  {/* Emotion Report Preview */}
                  {session.emotion_report && (
                    <div className="bg-gray-100 p-3 rounded-xl border-[2px] border-black">
                      <p className="font-bold text-xs text-gray-600">EMOTION ANALYSIS</p>
                      <p className="font-black text-sm mt-1">
                        {typeof session.emotion_report === 'string' 
                          ? session.emotion_report.slice(0, 50) + '...'
                          : 'Analysis available'
                        }
                      </p>
                    </div>
                  )}
                </div>

                {/* Session ID */}
                <div className="mt-4 pt-3 border-t-2 border-black">
                  <p className="text-xs font-bold text-gray-500">
                    ID: {session.id.slice(-8)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <div className="bg-white/90 backdrop-blur-sm p-12 rounded-3xl border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md mx-auto">
              <Clock size={64} strokeWidth={3} className="mx-auto mb-6 text-[#4D96FF]" />
              <h3 className="font-black text-2xl mb-4">NO SESSIONS YET!</h3>
              <p className="font-bold text-gray-600 mb-6">
                Start chatting with your avatars to see conversation history here.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard')}
                className="bg-[#6BCB77] text-white px-8 py-4 rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black text-lg hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
              >
                START CHATTING
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}