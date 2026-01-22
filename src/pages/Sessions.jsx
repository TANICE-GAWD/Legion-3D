import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  User, 
  Activity, 
  Heart, 
  AlertTriangle, 
  CheckCircle,
  X,
  TrendingUp,
  Brain,
  Smile,
  Frown,
  Meh
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Layout, LoadingBounce } from '../components/Layout';

// --- STYLING ---
const SESSION_COLORS = [
  'bg-[#FFD93D]', // Yellow
  'bg-[#FF6B6B]', // Red
  'bg-[#A29BFE]', // Purple
  'bg-[#6BCB77]', // Green
  'bg-[#FF9F43]', // Orange
];

const getSessionColor = (index) => SESSION_COLORS[index % SESSION_COLORS.length];

const getEmotionIcon = (emotion) => {
  const e = emotion?.toLowerCase() || '';
  if (e.includes('happy') || e.includes('excited')) return <Smile className="w-6 h-6" />;
  if (e.includes('sad') || e.includes('anxious') || e.includes('frustrated')) return <Frown className="w-6 h-6" />;
  return <Meh className="w-6 h-6" />;
};

const getEmotionColor = (emotion) => {
  const e = emotion?.toLowerCase() || '';
  if (e.includes('happy') || e.includes('excited') || e.includes('calm')) return 'bg-[#6BCB77]';
  if (e.includes('sad') || e.includes('anxious')) return 'bg-[#FF6B6B]';
  if (e.includes('frustrated') || e.includes('confused')) return 'bg-[#FF9F43]';
  return 'bg-[#A29BFE]';
};

const fetchSessions = async () => {
  const response = await axios.get('/api/sessions');
  return response.data.sessions;
};

const fetchSession = async (sessionId) => {
  const response = await axios.get(`/api/sessions/${sessionId}`);
  return response.data.session;
};

// Neo-Pop Card
const PopCard = ({ onClick, children, className = '', color = 'bg-white' }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`
      ${color} ${className}
      relative border-[3px] border-black rounded-[20px] p-4
      shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
      cursor-pointer transition-all duration-200 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
    `}
  >
    {children}
  </motion.div>
);

// Session Detail Modal
const SessionDetailModal = ({ session, onClose }) => {
  const report = session?.emotion_report || {};
  const avatar = session?.avatars;
  const timeline = report.emotion_timeline || [];
  const mentalStatus = report.mental_status_report || {};
  const recommendations = report.recommendations || {};
  const distribution = report.emotion_distribution || {};

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white border-[3px] border-black rounded-[30px] shadow-[10px_10px_0px_0px_black] 
                   w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-[#4D96FF] border-b-[3px] border-black p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {avatar?.image_url && (
              <img 
                src={avatar.image_url} 
                alt={avatar.name} 
                className="w-14 h-14 rounded-xl border-[3px] border-black object-cover"
              />
            )}
            <div>
              <h2 className="text-2xl font-black text-white">{avatar?.name || 'Session'} Report</h2>
              <p className="text-white/80 font-bold text-sm">
                {new Date(session?.created_at).toLocaleString()}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="bg-white p-2 rounded-xl border-[3px] border-black shadow-[3px_3px_0px_0px_black] hover:bg-[#FF6B6B] hover:text-white transition-colors"
          >
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Top Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className={`${getEmotionColor(report.dominant_emotion)} p-4 rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_black]`}>
              <p className="text-xs font-bold uppercase opacity-70">Dominant Emotion</p>
              <p className="text-xl font-black flex items-center gap-2">
                {getEmotionIcon(report.dominant_emotion)}
                {report.dominant_emotion || 'N/A'}
              </p>
            </div>
            <div className="bg-[#FFD93D] p-4 rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_black]">
              <p className="text-xs font-bold uppercase opacity-70">Confidence</p>
              <p className="text-xl font-black">{report.confidence_score || 0}%</p>
            </div>
            <div className="bg-[#A29BFE] p-4 rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_black]">
              <p className="text-xs font-bold uppercase opacity-70">Engagement</p>
              <p className="text-xl font-black">{report.overall_engagement || 'N/A'}</p>
            </div>
            <div className="bg-white p-4 rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_black]">
              <p className="text-xs font-bold uppercase opacity-70">Mood Stability</p>
              <p className="text-xl font-black">{mentalStatus.mood_stability || 'N/A'}</p>
            </div>
          </div>

          {/* Video Player */}
          {session?.video_url && (
            <div className="bg-black rounded-xl border-[3px] border-black overflow-hidden">
              <video 
                src={session.video_url} 
                controls 
                className="w-full max-h-[300px]"
              />
            </div>
          )}

          {/* Session Summary */}
          {report.session_summary && (
            <div className="bg-[#E8F4FD] p-5 rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_black]">
              <h3 className="font-black text-lg mb-2 flex items-center gap-2">
                <Brain size={20} /> Session Summary
              </h3>
              <p className="font-medium text-gray-800">{report.session_summary}</p>
            </div>
          )}

          {/* Emotion Timeline */}
          {timeline.length > 0 && (
            <div className="bg-white p-5 rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_black]">
              <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                <Activity size={20} /> Emotion Timeline
              </h3>
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                {timeline.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex gap-3 items-start p-3 bg-gray-50 rounded-lg border-2 border-gray-200"
                  >
                    <span className="bg-[#4D96FF] text-white px-2 py-1 rounded-lg font-bold text-sm min-w-[60px] text-center">
                      {item.timestamp}
                    </span>
                    <div className="flex-1">
                      <p className="font-bold text-sm">{item.detected_emotion} 
                        <span className="text-xs font-medium text-gray-500 ml-2">({item.intensity})</span>
                      </p>
                      <p className="text-xs text-gray-600">{item.facial_expression}</p>
                      <p className="text-xs text-gray-500 italic mt-1">↳ {item.possible_trigger}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emotion Distribution */}
          {Object.keys(distribution).length > 0 && (
            <div className="bg-white p-5 rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_black]">
              <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                <TrendingUp size={20} /> Emotion Distribution
              </h3>
              <div className="space-y-2">
                {Object.entries(distribution).map(([emotion, percent]) => (
                  <div key={emotion} className="flex items-center gap-3">
                    <span className="w-24 font-bold capitalize text-sm">{emotion}</span>
                    <div className="flex-1 h-6 bg-gray-200 rounded-full border-2 border-black overflow-hidden">
                      <div 
                        className={`h-full ${getEmotionColor(emotion)} transition-all duration-500`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="font-bold text-sm w-12 text-right">{percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mental Status Report */}
          {mentalStatus.overall_assessment && (
            <div className="bg-[#FFF4E6] p-5 rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_black]">
              <h3 className="font-black text-lg mb-3 flex items-center gap-2">
                <Heart size={20} /> Mental Status Assessment
              </h3>
              <p className="font-medium text-gray-800 mb-4">{mentalStatus.overall_assessment}</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                {mentalStatus.positive_indicators?.length > 0 && (
                  <div>
                    <p className="font-bold text-sm text-green-700 mb-2 flex items-center gap-1">
                      <CheckCircle size={16} /> Positive Indicators
                    </p>
                    <ul className="text-sm space-y-1">
                      {mentalStatus.positive_indicators.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-green-500">•</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {mentalStatus.areas_of_concern?.length > 0 && (
                  <div>
                    <p className="font-bold text-sm text-orange-700 mb-2 flex items-center gap-1">
                      <AlertTriangle size={16} /> Areas of Concern
                    </p>
                    <ul className="text-sm space-y-1">
                      {mentalStatus.areas_of_concern.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-orange-500">•</span> {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.for_caregiver && (
            <div className="bg-[#E8FFE8] p-5 rounded-xl border-[3px] border-black shadow-[4px_4px_0px_0px_black]">
              <h3 className="font-black text-lg mb-3 flex items-center gap-2">
                <User size={20} /> Recommendations for Caregiver
              </h3>
              <p className="font-medium text-gray-800 mb-3">{recommendations.for_caregiver}</p>
              
              {recommendations.suggested_activities?.length > 0 && (
                <div className="mt-3">
                  <p className="font-bold text-sm mb-2">Suggested Activities:</p>
                  <div className="flex flex-wrap gap-2">
                    {recommendations.suggested_activities.map((activity, idx) => (
                      <span 
                        key={idx}
                        className="bg-white px-3 py-1 rounded-full border-2 border-black text-sm font-medium"
                      >
                        {activity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {recommendations.follow_up_notes && (
                <p className="mt-3 text-sm text-gray-600 italic">
                  📝 {recommendations.follow_up_notes}
                </p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export const Sessions = () => {
  const navigate = useNavigate();
  const [selectedSession, setSelectedSession] = useState(null);

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: fetchSessions,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-[#4D96FF] flex items-center justify-center"
             style={{ backgroundImage: 'radial-gradient(circle, #ffffff 10%, transparent 10%)', backgroundSize: '30px 30px' }}>
          <div className="bg-white p-8 rounded-3xl border-[3px] border-black shadow-[8px_8px_0px_0px_black]">
            <LoadingBounce text="LOADING SESSIONS..." />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[#4D96FF] font-sans pb-24"
           style={{ backgroundImage: 'radial-gradient(circle, #ffffff 10%, transparent 10%)', backgroundSize: '30px 30px' }}>
        
        <div className="max-w-7xl mx-auto px-6 py-8">
          
          {/* Navigation */}
          <div className="flex justify-between items-center mb-8">
            <motion.button
              whileHover={{ x: -2, y: -2, boxShadow: "4px 4px 0px 0px black" }}
              whileTap={{ x: 0, y: 0, boxShadow: "0px 0px 0px 0px black" }}
              onClick={() => navigate('/dashboard')}
              className="bg-white px-5 py-3 rounded-xl border-[3px] border-black shadow-[2px_2px_0px_0px_black] flex items-center gap-2 group transition-all"
            >
              <div className="bg-black text-white p-1 rounded-md group-hover:bg-[#FF6B6B] transition-colors">
                <ArrowLeft size={20} strokeWidth={3} />
              </div>
              <span className="font-black text-black text-sm uppercase tracking-wide hidden sm:block">
                Back to Dashboard
              </span>
            </motion.button>
          </div>

          {/* Header */}
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-black text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
              SESSION HISTORY
            </h1>
            <p className="mt-4 text-xl font-bold text-white/90">
              Review past interactions and emotion reports
            </p>
          </motion.div>

          {/* Sessions Grid */}
          {sessions.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border-[3px] border-black shadow-[8px_8px_0px_0px_black] text-center">
              <Activity size={64} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-2xl font-black mb-2">No Sessions Yet</h3>
              <p className="text-gray-600">Start chatting with an avatar to create session recordings!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.map((session, index) => {
                const report = session.emotion_report || {};
                const avatar = session.avatars;
                
                return (
                  <PopCard
                    key={session.id}
                    color={getSessionColor(index)}
                    onClick={() => setSelectedSession(session)}
                  >
                    {/* Avatar Info */}
                    <div className="flex items-center gap-3 mb-4">
                      {avatar?.image_url ? (
                        <img 
                          src={avatar.image_url} 
                          alt={avatar.name}
                          className="w-12 h-12 rounded-xl border-[3px] border-black object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl border-[3px] border-black bg-white flex items-center justify-center">
                          <User size={24} />
                        </div>
                      )}
                      <div>
                        <h3 className="font-black text-lg">{avatar?.name || 'Unknown Avatar'}</h3>
                        <p className="text-xs font-bold opacity-70 flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(session.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Emotion Summary */}
                    <div className="bg-white/80 rounded-xl p-3 border-2 border-black mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold">Dominant Emotion</span>
                        <span className={`${getEmotionColor(report.dominant_emotion)} px-2 py-1 rounded-lg text-xs font-black border-2 border-black flex items-center gap-1`}>
                          {getEmotionIcon(report.dominant_emotion)}
                          {report.dominant_emotion || 'N/A'}
                        </span>
                      </div>
                      {report.confidence_score && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs font-medium">Confidence:</span>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#4D96FF]" 
                              style={{ width: `${report.confidence_score}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold">{report.confidence_score}%</span>
                        </div>
                      )}
                    </div>

                    {/* View Button */}
                    <button className="w-full bg-black text-white py-3 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-[#333] transition-colors">
                      <Play size={18} /> View Full Report
                    </button>
                  </PopCard>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Session Detail Modal */}
      <AnimatePresence>
        {selectedSession && (
          <SessionDetailModal 
            session={selectedSession} 
            onClose={() => setSelectedSession(null)} 
          />
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default Sessions;
