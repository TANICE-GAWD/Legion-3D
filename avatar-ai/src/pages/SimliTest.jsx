import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import SimliAvatar from '../components/SimliAvatar';

export const SimliTest = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="min-h-screen bg-[#4D96FF] font-sans selection:bg-black selection:text-white pb-24"
           style={{ backgroundImage: 'radial-gradient(circle, #ffffff 10%, transparent 10%)', backgroundSize: '30px 30px', backgroundColor: '#4D96FF' }}
      >
        <div className="max-w-4xl mx-auto px-6 py-12">
          
          {/* HEADER */}
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
            className="mb-10 flex items-center justify-between gap-6"
          >
             <button
               onClick={() => navigate('/dashboard')}
               className="bg-white text-black px-4 py-2 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_black] font-bold flex items-center gap-2 hover:shadow-[6px_6px_0px_0px_black] transition-all"
             >
               <ArrowLeft size={20} />
               Back
             </button>

             <h1 className="text-4xl font-black text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] uppercase tracking-tight"
                 style={{ WebkitTextStroke: '2px black' }}>
               Simli Avatar Test
             </h1>
          </motion.div>

          {/* SIMLI AVATAR CONTAINER */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white p-6 rounded-[40px] border-[4px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]"
          >
            <div className="max-w-md mx-auto">
              <SimliAvatar 
                faceId="tmp9i8bbq7c" 
                className="w-full"
              />
            </div>
            
            <div className="mt-6 text-center">
              <p className="text-lg font-bold text-gray-700">
                This is a test of the Simli avatar integration. Click "Start Avatar" to see the photorealistic video avatar in action!
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </Layout>
  );
};