import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import JournalCard from '../components/JournalCard';
import { FiClipboard, FiCalendar } from 'react-icons/fi';

export default function Notes() {
  const { currentUser } = useAuth();
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'users', currentUser.uid, 'journals'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = [];
      snapshot.forEach((entry) => {
        data.push({ id: entry.id, ...entry.data() });
      });
      setJournals(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        await deleteDoc(doc(db, 'users', currentUser.uid, 'journals', id));
      } catch (error) {
        console.error('Error deleting note:', error);
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-24 md:pb-10 pt-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Journal</h1>
          <p className="text-text-muted mt-1">All your journal entries in one place</p>
        </div>
        <div className="flex items-center gap-3 bg-white/70 border border-white/60 rounded-2xl px-4 py-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <FiClipboard />
          </div>
          <div>
            <p className="text-xs text-text-muted">Total Journal</p>
            <p className="text-lg font-bold text-gray-900">{journals.length}</p>
          </div>
        </div>
      </motion.div>

      <div className="glass p-5 rounded-3xl shadow-sm mb-6">
        <div className="flex items-center gap-3 text-sm text-text-muted">
          <FiCalendar className="text-primary" />
          <span>Sorted by newest first</span>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="glass rounded-2xl p-6 h-32 animate-pulse flex items-center justify-center text-text-muted">Loading notes...</div>
        ) : journals.length > 0 ? (
          journals.map((journal, index) => (
            <motion.div
              key={journal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <JournalCard
                journal={journal}
                showActions={false}
                onEdit={() => {}}
                onDelete={() => handleDelete(journal.id)}
              />
            </motion.div>
          ))
        ) : (
          <div className="glass rounded-2xl p-8 text-center text-text-muted">
            <p>No notes yet. Start writing your daily journals!</p>
          </div>
        )}
      </div>
    </div>
  );
}
