"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MessageCircle, Sparkles, ArrowRight } from "lucide-react";
import SimliElevenlabs from "@/app/SimliElevenlabs";
import DottedFace from "./Components/DottedFace";
import SimliHeaderLogo from "./Components/Logo";
import Navbar from "./Components/Navbar";
import Image from "next/image";
import GitHubLogo from "@/media/github-mark-white.svg";

interface avatarSettings {
  elevenlabs_agentid: string;
  simli_faceid: string;
}

// Customize your avatar here
const avatar: avatarSettings = {
  elevenlabs_agentid: "agent_5901kfmmz0gnfserfyw932r615x0", 
  simli_faceid: "0c2b8b04-5274-41f1-a21c-d5c98322efa9", 
};

const Demo: React.FC = () => {
  const router = useRouter();
  const [showDottedFace, setShowDottedFace] = useState(true);

  const onStart = () => {
    console.log("Setting setshowDottedface to false...");
    setShowDottedFace(false);
  };

  const onClose = () => {
    console.log("Setting setshowDottedface to true...");
    setShowDottedFace(true);
  };

  return (
    <div className="bg-black min-h-screen flex flex-col items-center font-abc-repro font-normal text-sm text-white p-8">
      <SimliHeaderLogo />
      <Navbar />

      <div className="absolute top-[32px] right-[32px]">
        <text
          onClick={() => {
            window.open("https://github.com/simliai/create-simli-app-elevenlabs");
          }}
          className="font-bold cursor-pointer mb-8 text-xl leading-8"
        >
          <Image className="w-[20px] inline mr-2" src={GitHubLogo} alt="" />
          create-simli-app (ElevenLabs)
        </text>
      </div>

      {/* Navigation to Dashboard */}
      <div className="mb-8 flex gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/dashboard')}
          className="bg-[#4D96FF] text-white px-6 py-3 rounded-xl border-[3px] border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] font-black text-lg hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] transition-all flex items-center gap-2"
        >
          <MessageCircle size={20} strokeWidth={3} />
          CHAT WITH AVATARS
          <ArrowRight size={20} strokeWidth={3} />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => router.push('/create-avatar')}
          className="bg-[#6BCB77] text-white px-6 py-3 rounded-xl border-[3px] border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] font-black text-lg hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] transition-all flex items-center gap-2"
        >
          <Sparkles size={20} strokeWidth={3} />
          CREATE AVATAR
        </motion.button>
      </div>

      <div className="flex flex-col items-center gap-6 bg-effect15White p-6 pb-[40px] rounded-xl w-full">
        <div>
          {showDottedFace && <DottedFace />}
          <SimliElevenlabs
            agentId={avatar.elevenlabs_agentid}
            simli_faceid={avatar.simli_faceid}
            onStart={onStart}
            onClose={onClose}
            showDottedFace={showDottedFace}
          />
        </div>
      </div>

      <div className="max-w-[350px] font-thin flex flex-col items-center ">
        <span className="font-bold mb-[8px] leading-5 ">
          {" "}
          Create Simli App with integrated chat features and avatar management
        </span>
        <ul className="list-decimal list-inside max-w-[350px] ml-[6px] mt-2">
          <li className="mb-1">
            Fill in your ElevenLabs and Simli API keys in .env file.
          </li>
          <li className="mb-1">
            Create and manage multiple AI avatars with custom personalities.
          </li>
          <li className="mb-1">
            Chat with your avatars using voice and video in real-time.
          </li>
          <li className="mb-1">
            View conversation history and session recordings.
          </li>
        </ul>
        <span className=" mt-[16px]">
          You can now deploy this app to Vercel, or incorporate it as part of
          your existing project.
        </span>
      </div>
    </div>
  );
};

export default Demo;
