import React from 'react';
import { motion } from 'framer-motion';

export default function MoodCard({ mood, isSelected, onClick }) {
  return (
    <motion.button
      whileHover={{ y: -3, scale: 1.03 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center p-2 rounded-xl md:rounded-2xl transition-all duration-300 ${mood.color} ${isSelected ? 'ring-2 ring-primary ring-offset-2 shadow-lg scale-105' : 'opacity-80 hover:opacity-100 hover:shadow-md'}`}
    >
      <span className="text-xl md:text-3xl mb-1 filter drop-shadow-sm">{mood.emoji}</span>
      <span className="font-medium text-[10px] md:text-xs truncate">{mood.label}</span>
      {isSelected && (
          <motion.div 
            layoutId="outline"
            className="absolute inset-0 rounded-2xl border-2 border-white mix-blend-overlay pointer-events-none"
            initial={false}
            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          />
      )}
    </motion.button>
  );
}