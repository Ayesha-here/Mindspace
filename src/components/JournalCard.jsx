import React from 'react';
import { motion } from 'framer-motion';
import { FiBookmark, FiEdit2, FiTrash2 } from 'react-icons/fi';

const EMOJI_MAP = {
  'Happy': '😊',
  'Calm': '😌',
  'Sad': '😔',
  'Angry': '😡',
  'Stressed': '😣'
};

const COLOR_MAP = {
  'Happy': 'bg-yellow-50 text-yellow-600',
  'Calm': 'bg-blue-50 text-blue-600',
  'Sad': 'bg-indigo-50 text-indigo-600',
  'Angry': 'bg-red-50 text-red-600',
  'Stressed': 'bg-orange-50 text-orange-600'
};

export default function JournalCard({ journal, onEdit, onDelete, showActions = true }) {
  const formatDate = (entryDate, createdAt) => {
    if (!entryDate && !createdAt) return '';
    const date = entryDate ? new Date(entryDate) : createdAt.toDate();
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
    return `${date.toLocaleDateString('en-US', dateOptions)} • ${date.toLocaleTimeString('en-US', timeOptions)}`;
  };

  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="glass p-4 md:p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-start gap-4 relative group"
    >
      <div className={`p-4 rounded-2xl text-3xl shrink-0 ${COLOR_MAP[journal.mood] || 'bg-gray-100'}`}>
        {EMOJI_MAP[journal.mood] || '📝'}
      </div>
      
      <div className={`flex-1 min-w-0 ${showActions ? 'pr-24' : ''}`}>
        <h3 className="font-bold text-lg text-gray-900 truncate">{journal.title}</h3>
        <p className="text-xs text-gray-500 mb-2 font-medium">{formatDate(journal.entryDate, journal.createdAt)}</p>
        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">{journal.description}</p>
      </div>

      {showActions && (
        <div className="absolute right-4 top-4 flex items-center gap-2">
          <button className="text-primary-light hover:text-primary transition-colors p-2" aria-label="Bookmark">
            <FiBookmark className="text-xl"/>
          </button>
          <button
            onClick={onEdit}
            className="text-gray-500 hover:text-primary transition-colors p-2 rounded-full hover:bg-gray-100"
            aria-label="Edit entry"
          >
            <FiEdit2 className="text-lg" />
          </button>
          <button
            onClick={onDelete}
            className="text-red-500 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
            aria-label="Delete entry"
          >
            <FiTrash2 className="text-lg" />
          </button>
        </div>
      )}
    </motion.div>
  );
}