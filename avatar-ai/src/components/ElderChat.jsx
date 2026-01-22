import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Phone, Heart } from 'lucide-react';

const ElderChat = () => {
    const [isListening, setIsListening] = useState(false);
    const [captions, setCaptions] = useState('Tap the green button to talk with your family...');
    const [isEmergency, setIsEmergency] = useState(false);

    // Simulate live captions
    useEffect(() => {
        if (isListening) {
            const messages = [
                'Hello! How are you feeling today?',
                'I hope you had a good breakfast...',
                'The weather looks lovely outside.',
                'Would you like to hear about your grandchildren?',
            ];
            let index = 0;
            const interval = setInterval(() => {
                setCaptions(messages[index % messages.length]);
                index++;
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [isListening]);

    const handleMicToggle = () => {
        setIsListening(!isListening);
        if (!isListening) {
            setCaptions('Listening...');
        } else {
            setCaptions('Tap the green button to talk with your family...');
        }
    };

    const handleEmergency = () => {
        setIsEmergency(true);
        setCaptions('🚨 Emergency alert sent! Help is on the way...');
        setTimeout(() => setIsEmergency(false), 5000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex flex-col relative overflow-hidden">
            {/* Warm background pattern */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-sage-500" />
                <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full bg-amber-400" />
                <div className="absolute top-1/3 right-1/4 w-24 h-24 rounded-full bg-orange-300" />
            </div>

            {/* Emergency Button - Top Right Corner */}
            <div className="absolute top-6 right-6 z-20">
                <button
                    onClick={handleEmergency}
                    className={`
            w-16 h-16 md:w-20 md:h-20 rounded-2xl 
            bg-gradient-to-br from-red-500 to-red-600 
            shadow-lg shadow-red-200
            flex items-center justify-center
            transition-all duration-300
            hover:scale-105 hover:shadow-xl hover:shadow-red-300
            active:scale-95
            ${isEmergency ? 'animate-pulse ring-4 ring-red-300' : ''}
          `}
                    aria-label="Emergency Call"
                >
                    <Phone className="w-8 h-8 md:w-10 md:h-10 text-white" strokeWidth={2.5} />
                </button>
                <p className="text-center text-red-600 font-bold text-sm mt-2">EMERGENCY</p>
            </div>

            {/* Header */}
            <header className="pt-8 pb-4 px-6 text-center relative z-10">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <Heart className="w-8 h-8 text-rose-400" fill="currentColor" />
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800">CareChain</h1>
                </div>
                <p className="text-xl md:text-2xl text-gray-600 font-medium">Your Family is Here</p>
            </header>

            {/* Main Content - Avatar Container */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 pb-8 relative z-10">
                {/* Avatar Container with Breathing Animation */}
                <div className="relative mb-8">
                    {/* Outer glow rings */}
                    <div
                        className={`
              absolute inset-0 rounded-full 
              bg-gradient-to-r from-emerald-200 to-teal-200
              ${isListening ? 'animate-breathe-outer' : 'opacity-30'}
            `}
                        style={{ transform: 'scale(1.3)' }}
                    />
                    <div
                        className={`
              absolute inset-0 rounded-full 
              bg-gradient-to-r from-emerald-300 to-teal-300
              ${isListening ? 'animate-breathe-middle' : 'opacity-40'}
            `}
                        style={{ transform: 'scale(1.15)' }}
                    />

                    {/* Avatar Container */}
                    <div
                        className={`
              relative w-56 h-56 md:w-72 md:h-72 lg:w-80 lg:h-80
              rounded-full 
              bg-gradient-to-br from-emerald-100 to-teal-100
              border-4 border-white
              shadow-2xl
              flex items-center justify-center
              overflow-hidden
              transition-all duration-500
              ${isListening ? 'ring-4 ring-emerald-300 ring-opacity-60' : ''}
            `}
                    >
                        {/* Placeholder Avatar Image */}
                        <div className="w-full h-full bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center mb-4 shadow-inner">
                                    <span className="text-6xl md:text-7xl">👨‍👩‍👧</span>
                                </div>
                                <p className="text-lg md:text-xl font-semibold text-gray-700">
                                    {isListening ? 'Listening...' : 'Family Avatar'}
                                </p>
                            </div>
                        </div>

                        {/* Active indicator */}
                        {isListening && (
                            <div className="absolute bottom-4 right-4 w-6 h-6 bg-emerald-500 rounded-full animate-pulse shadow-lg shadow-emerald-300" />
                        )}
                    </div>
                </div>

                {/* Live Captions Area */}
                <div
                    className={`
            w-full max-w-lg mx-auto
            bg-white/80 backdrop-blur-sm
            rounded-3xl
            p-6 md:p-8
            shadow-lg
            border-2 border-emerald-100
            transition-all duration-300
            ${isEmergency ? 'border-red-300 bg-red-50/80' : ''}
          `}
                >
                    <p
                        className={`
              text-center
              text-xl md:text-2xl lg:text-3xl
              font-medium
              leading-relaxed
              ${isEmergency ? 'text-red-700' : 'text-gray-800'}
            `}
                    >
                        {captions}
                    </p>
                </div>
            </main>

            {/* Bottom Controls */}
            <footer className="pb-10 pt-4 px-6 relative z-10">
                <div className="flex justify-center">
                    {/* Main Microphone Button */}
                    <button
                        onClick={handleMicToggle}
                        className={`
              w-20 h-20 md:w-24 md:h-24
              rounded-full
              flex items-center justify-center
              transition-all duration-300
              shadow-xl
              ${isListening
                                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-300 scale-110 animate-pulse-slow'
                                : 'bg-gradient-to-br from-emerald-400 to-teal-500 shadow-emerald-200 hover:scale-105'
                            }
              active:scale-95
            `}
                        aria-label={isListening ? 'Stop listening' : 'Start talking'}
                    >
                        {isListening ? (
                            <MicOff className="w-10 h-10 md:w-12 md:h-12 text-white" strokeWidth={2.5} />
                        ) : (
                            <Mic className="w-10 h-10 md:w-12 md:h-12 text-white" strokeWidth={2.5} />
                        )}
                    </button>
                </div>
                <p className="text-center text-gray-600 font-semibold text-lg md:text-xl mt-4">
                    {isListening ? 'Tap to Stop' : 'Tap to Talk'}
                </p>
            </footer>

            {/* Custom Animations */}
            <style>{`
        @keyframes breathe-outer {
          0%, 100% {
            transform: scale(1.3);
            opacity: 0.2;
          }
          50% {
            transform: scale(1.4);
            opacity: 0.4;
          }
        }

        @keyframes breathe-middle {
          0%, 100% {
            transform: scale(1.15);
            opacity: 0.3;
          }
          50% {
            transform: scale(1.25);
            opacity: 0.5;
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
          }
          50% {
            box-shadow: 0 0 0 20px rgba(16, 185, 129, 0);
          }
        }

        .animate-breathe-outer {
          animation: breathe-outer 3s ease-in-out infinite;
        }

        .animate-breathe-middle {
          animation: breathe-middle 3s ease-in-out infinite 0.5s;
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
};

export default ElderChat;
