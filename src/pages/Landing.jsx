import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { currentUser } = useAuth();

  if (currentUser) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 relative w-full h-full overflow-hidden">
      
       {/* Animated Blobs */}
       <div className="absolute top-20 -left-20 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob pointer-events-none"></div>
       <div className="absolute top-40 -right-20 w-72 h-72 bg-pink-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 pointer-events-none"></div>
      
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="w-24 h-24 bg-gradient-to-br from-primary to-purple-400 rounded-3xl shadow-2xl flex items-center justify-center text-white font-bold text-5xl mb-8 rotate-12"
      >
        M
      </motion.div>
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 mb-6 tracking-tight"
      >
        MindSpace
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-xl md:text-2xl text-text-muted mb-12 max-w-2xl font-light"
      >
        Your personal emotional wellness dashboard. Track your journey and reflect on your days with a calming mindful experience.
      </motion.p>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex gap-6"
      >
        <Link 
          to="/register" 
          className="px-8 py-4 bg-gradient-to-r from-primary to-primary-light text-white rounded-2xl font-semibold shadow-lg shadow-primary/30 hover:scale-105 transition-all text-lg"
        >
          Get Started Free
        </Link>
        <Link 
          to="/login" 
          className="px-8 py-4 glass text-primary rounded-2xl font-semibold hover:shadow-lg hover:scale-105 transition-all outline outline-2 outline-primary outline-offset-[-2px] text-lg bg-white/50"
        >
          Login to Account
        </Link>
      </motion.div>
    </div>
  );
}