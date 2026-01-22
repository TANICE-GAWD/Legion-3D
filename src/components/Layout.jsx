import React from 'react';
import { motion } from 'framer-motion';

export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-purple-50 font-nunito">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        {children}
      </motion.div>
    </div>
  );
};

// Reusable Button Component with bouncy animations
export const BouncyButton = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '', 
  disabled = false,
  ...props 
}) => {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600',
    danger: 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600',
    ghost: 'bg-white/80 text-slate-700 hover:bg-white border-2 border-slate-200 hover:border-slate-300',
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        px-8 py-4 rounded-full font-bold text-lg
        shadow-lg transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// Loading Animation Component
export const LoadingBounce = ({ text = 'Loading...' }) => {
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

// Card Component
export const Card = ({ children, className = '', ...props }) => {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className={`
        bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl 
        p-6 transition-all duration-300 border-2 border-slate-100
        hover:shadow-2xl hover:border-slate-200
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
};
