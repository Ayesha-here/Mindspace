import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase/firebaseConfig';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { FiLogOut, FiEdit2, FiPhone, FiCalendar, FiActivity, FiStar, FiTrendingUp } from 'react-icons/fi';

export default function Profile() {
  const { currentUser, logout } = useAuth();
  const [journals, setJournals] = useState([]);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'users', currentUser.uid, 'journals'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data());
      setJournals(data);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const totalEntries = journals.length;

  const getJournalDate = (journal) => {
    if (journal?.entryDate) return new Date(journal.entryDate);
    if (journal?.createdAt) return journal.createdAt.toDate();
    return null;
  };

  const mostCommonMood = useMemo(() => {
    const counts = journals.reduce((acc, journal) => {
      if (!journal.mood) return acc;
      acc[journal.mood] = (acc[journal.mood] || 0) + 1;
      return acc;
    }, {});
    let topMood = 'N/A';
    let topCount = 0;
    Object.keys(counts).forEach((key) => {
      if (counts[key] > topCount) {
        topMood = key;
        topCount = counts[key];
      }
    });
    return { mood: topMood, count: topCount };
  }, [journals]);

  const lastEntryDate = useMemo(() => {
    const dated = journals
      .map(getJournalDate)
      .filter(Boolean)
      .sort((a, b) => b - a);
    if (!dated.length) return 'No entries yet';
    return dated[0].toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }, [journals]);

  const joinDate = currentUser?.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown';

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-24 md:pb-10 pt-4">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-center"
      >
        <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
          Your Profile
        </h1>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-3xl p-8 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/80 to-purple-400/80"></div>
        
        <div className="relative flex flex-col items-center pt-8">
          <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl bg-white overflow-hidden mb-6 filter drop-shadow-md">
            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${currentUser?.displayName || currentUser?.phone || 'mindspace'}`} alt="avatar" className="w-full h-full object-cover"/>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{currentUser?.displayName || 'Guest'}</h2>
          <div className="flex items-center gap-2 text-text-muted font-medium bg-gray-100/50 px-4 py-1.5 rounded-full">
            <FiPhone />
            <span>{currentUser?.phone ? `+91 ${currentUser.phone}` : 'Phone not added'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10 mb-8">
          <div className="bg-white/40 p-6 rounded-2xl flex flex-col items-center justify-center border border-white/50 shadow-sm">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-3">
              <FiActivity className="text-2xl"/>
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalEntries}</p>
            <p className="text-sm text-text-muted font-medium">Total Entries</p>
          </div>
          <div className="bg-white/40 p-6 rounded-2xl flex flex-col items-center justify-center border border-white/50 shadow-sm">
            <div className="w-12 h-12 bg-purple-400/10 text-purple-600 rounded-full flex items-center justify-center mb-3">
              <FiStar className="text-2xl"/>
            </div>
            <p className="text-lg font-bold text-gray-900 mt-2">{mostCommonMood.mood}</p>
            <p className="text-sm text-text-muted font-medium mt-1">Most Common Mood</p>
          </div>
          <div className="bg-white/40 p-6 rounded-2xl flex flex-col items-center justify-center border border-white/50 shadow-sm">
            <div className="w-12 h-12 bg-green-400/10 text-green-600 rounded-full flex items-center justify-center mb-3">
              <FiTrendingUp className="text-2xl"/>
            </div>
            <p className="text-lg font-bold text-gray-900 mt-2">{lastEntryDate}</p>
            <p className="text-sm text-text-muted font-medium mt-1">Last Check-in</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-white/50 p-5 rounded-2xl border border-white/60 shadow-sm">
            <div className="text-xs text-text-muted mb-2">About</div>
            <div className="text-sm font-medium text-gray-700">
              Keep showing up. Your consistency builds emotional strength.
            </div>
            <div className="mt-4 flex gap-2 text-xs">
              {['Mindful', 'Consistent', 'Calm'].map((tag) => (
                <span key={tag} className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-semibold">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="bg-white/50 p-5 rounded-2xl border border-white/60 shadow-sm">
            <div className="text-xs text-text-muted mb-2">Member Since</div>
            <div className="text-lg font-bold text-gray-900">{joinDate}</div>
            <div className="mt-4 h-2 rounded-full bg-primary/10 overflow-hidden">
              <div className="h-full w-3/4 bg-primary rounded-full"></div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <button className="w-full glass bg-white/50 text-gray-700 py-4 rounded-xl font-semibold hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-sm">
            <FiEdit2 /> Edit Profile
          </button>
          <button 
            onClick={handleLogout}
            className="w-full bg-red-50 text-red-500 py-4 rounded-xl font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
          >
            <FiLogOut /> Sign Out
          </button>
        </div>
      </motion.div>
    </div>
  );
}