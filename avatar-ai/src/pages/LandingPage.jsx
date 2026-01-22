import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { 
  ArrowRight, 
  Smile, 
  Volume2, 
  Shield, 
  Heart, 
  Sparkles, 
  Star, 
  Zap, 
  Play,
  MessageCircle,
  Users
} from 'lucide-react';
import { Link } from 'react-router-dom';

// --- STYLING CONSTANTS & HELPERS ---
const COLORS = {
  blue: 'bg-[#4D96FF]',
  yellow: 'bg-[#FFD93D]',
  red: 'bg-[#FF6B6B]',
  green: 'bg-[#6BCB77]',
  purple: 'bg-[#A29BFE]',
  white: 'bg-white',
  black: 'bg-black'
};

// 1. Reusable Pop Button
const PopButton = ({ children, color = 'bg-white', className = '', onClick }) => (
  <motion.button
    whileHover={{ x: -4, y: -4, boxShadow: "8px 8px 0px 0px black" }}
    whileTap={{ x: 0, y: 0, boxShadow: "0px 0px 0px 0px black" }}
    onClick={onClick}
    className={`
      ${color} ${className}
      relative px-8 py-4 rounded-2xl font-black text-xl border-[3px] border-black 
      shadow-[4px_4px_0px_0px_black] flex items-center justify-center gap-3 transition-all
    `}
  >
    {children}
  </motion.button>
);

// 2. Marquee Component
const Marquee = ({ text, color = 'bg-black text-white' }) => (
  <div className={`${color} py-4 border-y-[3px] border-black overflow-hidden whitespace-nowrap`}>
    <motion.div 
      animate={{ x: [0, -1000] }}
      transition={{ ease: "linear", duration: 20, repeat: Infinity }}
      className="inline-block"
    >
      {[...Array(10)].map((_, i) => (
        <span key={i} className="text-2xl font-black uppercase mx-8 tracking-widest">
          {text} <span className="text-[#FFD93D]">★</span>
        </span>
      ))}
    </motion.div>
  </div>
);

// 3. Feature Card
const FeatureCard = ({ icon: Icon, title, desc, color, rotate }) => (
  <motion.div
    whileHover={{ scale: 1.05, rotate: 0 }}
    className={`${color} p-8 rounded-[30px] border-[3px] border-black shadow-[8px_8px_0px_0px_black] h-full flex flex-col items-start relative overflow-hidden`}
    style={{ rotate: `${rotate}deg` }}
  >
    <div className="bg-black/10 p-4 rounded-2xl mb-6 border-2 border-black">
      <Icon size={40} className="text-black" strokeWidth={2.5} />
    </div>
    <h3 className="text-3xl font-black text-black mb-4 uppercase leading-none">{title}</h3>
    <p className="text-lg font-bold text-black/70 leading-snug">{desc}</p>
    <div className="absolute -bottom-10 -right-10 opacity-10">
      <Icon size={150} />
    </div>
  </motion.div>
);

export const LandingPage = () => {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  
  // Animation Triggers
  const featuresRef = useRef(null);
  const isFeaturesInView = useInView(featuresRef, { once: true, margin: "-100px" });

  return (
    <div className="min-h-screen bg-[#FFF4E0] font-sans selection:bg-black selection:text-[#FFD93D] overflow-x-hidden">
      
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full z-50 px-4 py-4 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-between items-center pointer-events-auto">
          <motion.div 
            initial={{ y: -100 }} animate={{ y: 0 }}
            className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl border-[3px] border-black shadow-[4px_4px_0px_0px_black]"
          >
            <div className="bg-[#FF6B6B] p-2 rounded-lg border-2 border-black">
              <Heart className="text-white fill-white" size={24} />
            </div>
            <span className="text-2xl font-black italic tracking-tighter">WeCare</span>
          </motion.div>

          <motion.div initial={{ y: -100 }} animate={{ y: 0 }} transition={{ delay: 0.1 }}>
            <Link to="/dashboard">
              <button className="bg-[#4D96FF] text-white px-6 py-3 rounded-xl border-[3px] border-black font-black uppercase shadow-[4px_4px_0px_0px_black] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_black] transition-all">
                Launch App 🚀
              </button>
            </Link>
          </motion.div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <header className="relative pt-40 pb-20 px-6 overflow-hidden">
        {/* Decorative Blobs */}
        <div className="absolute top-20 left-10 text-[#FFD93D] animate-spin-slow opacity-50 hidden lg:block">
          <Star size={120} strokeWidth={3} />
        </div>
        <div className="absolute bottom-20 right-10 text-[#6BCB77] animate-bounce opacity-50 hidden lg:block">
          <Zap size={120} strokeWidth={3} />
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Left Content */}
          <div className="space-y-8 relative z-10">
            <motion.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="inline-block bg-[#A29BFE] px-6 py-2 rounded-full border-[3px] border-black shadow-[4px_4px_0px_0px_black] rotate-[-2deg]"
            >
              <span className="font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={18} fill="white" /> The World's Friendliest AI
              </span>
            </motion.div>

            <motion.h1 
              initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              className="text-6xl lg:text-8xl font-black text-black leading-[0.9] tracking-tighter"
            >
              A PATIENT FRIEND <br/>
              FOR <span className="text-[#4D96FF] underline decoration-4 decoration-black underline-offset-4">EVERY MIND.</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="text-2xl font-bold text-black/70 max-w-lg"
            >
              Safe, private, and endless conversations. Designed for learning, therapy, and pure fun.
            </motion.p>

            <motion.div 
              initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-6"
            >
              <Link to="/dashboard">
                <PopButton color="bg-[#FFD93D]">
                  GET STARTED <ArrowRight strokeWidth={4} />
                </PopButton>
              </Link>
              <PopButton color="bg-white" className="text-black">
                <Play fill="black" size={20} /> WATCH DEMO
              </PopButton>
            </motion.div>

            {/* Social Proof */}
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-[3px] border-black bg-gray-200 overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i*13}`} alt="User" />
                  </div>
                ))}
              </div>
              <div className="font-bold text-lg leading-tight">
                Trusted by <br/> 10,000+ Families
              </div>
            </div>
          </div>

          {/* Right Visual (Interactive-looking Card) */}
          <motion.div 
            style={{ y: y1 }}
            className="relative hidden lg:block"
          >
            <div className="relative z-10 bg-white p-6 rounded-[40px] border-[4px] border-black shadow-[16px_16px_0px_0px_black] rotate-2">
              
              {/* Fake Browser Header */}
              <div className="flex items-center gap-3 mb-6 border-b-[3px] border-black pb-4">
                <div className="w-5 h-5 rounded-full bg-[#FF6B6B] border-2 border-black" />
                <div className="w-5 h-5 rounded-full bg-[#FFD93D] border-2 border-black" />
                <div className="w-5 h-5 rounded-full bg-[#6BCB77] border-2 border-black" />
                <div className="ml-auto bg-gray-100 px-4 py-1 rounded-full border-2 border-black text-xs font-bold text-gray-400">
                  neuropal.app
                </div>
              </div>

              {/* Chat Content */}
              <div className="space-y-6">
                <div className="flex gap-4 items-end">
                  <div className="w-16 h-16 rounded-2xl border-[3px] border-black overflow-hidden bg-[#FFD93D]">
                     <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Buddy" alt="Bot" />
                  </div>
                  <div className="bg-[#E0E0E0] p-4 rounded-2xl rounded-bl-none border-[3px] border-black relative">
                    <p className="font-bold text-lg">Hi! I'm Buddy. Do you like dinosaurs? 🦕</p>
                    <div className="absolute -bottom-3 -left-1 w-6 h-6 bg-[#E0E0E0] border-l-[3px] border-b-[3px] border-black clip-path-polygon" />
                  </div>
                </div>

                <div className="flex gap-4 items-end justify-end">
                  <div className="bg-[#4D96FF] text-white p-4 rounded-2xl rounded-br-none border-[3px] border-black">
                    <p className="font-bold text-lg">YES! T-Rex is my favorite! 🦖</p>
                  </div>
                  <div className="w-16 h-16 rounded-2xl border-[3px] border-black overflow-hidden bg-white">
                     <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Kid" alt="User" />
                  </div>
                </div>
              </div>

              {/* Fake Input */}
              <div className="mt-8 bg-gray-100 p-3 rounded-xl border-[3px] border-black flex justify-between items-center text-gray-400 font-bold">
                <span>Type a message...</span>
                <div className="bg-[#6BCB77] p-2 rounded-lg border-2 border-black text-white">
                  <ArrowRight size={20} />
                </div>
              </div>
            </div>

            {/* Decor behind card */}
            <div className="absolute -top-10 -right-10 w-full h-full bg-[#FF6B6B] rounded-[40px] border-[4px] border-black -z-10 rotate-[-4deg]" />
          </motion.div>

        </div>
      </header>

      {/* --- MARQUEE --- */}
      <Marquee text="NO JUDGEMENT • ALWAYS LISTENING • 100% PRIVATE • FUN LEARNING •" />

      {/* --- FEATURES GRID --- */}
      <section ref={featuresRef} className="py-24 px-6 bg-[#4D96FF]"
        style={{ backgroundImage: 'radial-gradient(circle, #ffffff 10%, transparent 10%)', backgroundSize: '30px 30px' }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            className="text-center mb-16 relative"
            initial={{ y: 50, opacity: 0 }}
            animate={isFeaturesInView ? { y: 0, opacity: 1 } : {}}
          >
             <div className="inline-block bg-white px-6 py-2 rounded-full border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,0.2)] mb-4 -rotate-2">
                <h2 className="text-xl font-black text-black uppercase">Why It Works</h2>
             </div>
             <h2 className="text-5xl md:text-6xl font-black text-white drop-shadow-[4px_4px_0px_black]"
                 style={{ WebkitTextStroke: '2px black' }}>
               DESIGNED FOR <br/> DIFFERENT MINDS
             </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={Smile}
              color="bg-[#FFD93D]"
              rotate={-2}
              title="Zero Judgement"
              desc="Ask the same question 100 times. Buddy never gets tired, annoyed, or impatient. Just pure support."
            />
            <FeatureCard 
              icon={Volume2}
              color="bg-white"
              rotate={2}
              title="Calm Voices"
              desc="No shouting or sudden noises. We use scientifically calibrated tones that are soothing and easy to process."
            />
            <FeatureCard 
              icon={Shield}
              color="bg-[#FF6B6B]"
              rotate={-1}
              title="Total Privacy"
              desc="What happens in NeuroPal stays in NeuroPal. No data selling. No ads. Just safe space."
            />
          </div>
        </div>
      </section>

      {/* --- LIVE DEMO TEASER --- */}
      <section className="py-24 px-6 bg-[#FFD93D] relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-black text-black mb-8 leading-tight">
            READY TO MEET <br/> YOUR NEW BUDDY?
          </h2>
          
          <div className="bg-white p-8 rounded-[40px] border-[4px] border-black shadow-[12px_12px_0px_0px_black] rotate-1">
             <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-full md:w-1/3">
                   <div className="aspect-square bg-[#A29BFE] rounded-3xl border-[3px] border-black overflow-hidden relative">
                      <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Buddy&backgroundColor=A29BFE" className="w-full h-full object-cover" />
                      <div className="absolute bottom-4 right-4 bg-[#6BCB77] text-white px-3 py-1 rounded-full border-2 border-black font-bold text-sm animate-bounce">
                        Hello! 👋
                      </div>
                   </div>
                </div>
                <div className="w-full md:w-2/3 text-left space-y-6">
                   <h3 className="text-3xl font-black uppercase">Create Your Avatar</h3>
                   <p className="text-xl font-bold text-gray-600">
                     Customize appearance, voice, and personality. Make a friend that understands YOU.
                   </p>
                   <Link to="/dashboard" className="block">
                     <button className="w-full py-4 bg-[#4D96FF] text-white rounded-xl border-[3px] border-black font-black text-2xl shadow-[6px_6px_0px_0px_black] hover:translate-y-1 hover:shadow-[2px_2px_0px_0px_black] transition-all flex items-center justify-center gap-3">
                       <Sparkles fill="white" /> START CREATING
                     </button>
                   </Link>
                </div>
             </div>
          </div>
        </div>
        
        {/* Background Patterns */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10" 
             style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '20px 20px' }}></div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-black text-white pt-20 pb-10 px-6 border-t-[6px] border-[#FF6B6B]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
               <div className="bg-[#4D96FF] p-2 rounded-lg border-2 border-white">
                 <Heart className="text-white fill-white" size={24} />
               </div>
               <h2 className="text-4xl font-black italic">NeuroPal</h2>
            </div>
            <p className="text-xl font-bold text-gray-400 max-w-sm">
              Making the world a little less lonely and a lot more understandable for everyone.
            </p>
          </div>
          
          <div>
            <h4 className="text-[#FFD93D] font-black uppercase text-xl mb-6">Explore</h4>
            <ul className="space-y-4 font-bold text-lg text-gray-300">
              <li className="hover:text-white hover:translate-x-2 transition-transform cursor-pointer">About Us</li>
              <li className="hover:text-white hover:translate-x-2 transition-transform cursor-pointer">Safety Center</li>
              <li className="hover:text-white hover:translate-x-2 transition-transform cursor-pointer">For Schools</li>
            </ul>
          </div>

          <div>
            <h4 className="text-[#6BCB77] font-black uppercase text-xl mb-6">Legal</h4>
            <ul className="space-y-4 font-bold text-lg text-gray-300">
              <li className="hover:text-white hover:translate-x-2 transition-transform cursor-pointer">Privacy Policy</li>
              <li className="hover:text-white hover:translate-x-2 transition-transform cursor-pointer">Terms of Service</li>
              <li className="hover:text-white hover:translate-x-2 transition-transform cursor-pointer">Cookie Settings</li>
            </ul>
          </div>
        </div>

        <div className="text-center pt-10 border-t border-gray-800">
          <p className="font-bold text-gray-500">© 2026 NeuroPal Inc. Built with ❤️ and ☕.</p>
        </div>
      </footer>

    </div>
  );
};