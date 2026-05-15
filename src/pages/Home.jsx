import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../firebase/firebaseConfig';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import MoodCard from '../components/MoodCard';
import JournalCard from '../components/JournalCard';
import { FiEdit3, FiX, FiCalendar, FiTag, FiCheck, FiSave, FiClipboard } from 'react-icons/fi';
import confetti from 'canvas-confetti';

const MOODS = [
  { emoji: '😊', label: 'Happy', color: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700' },
  { emoji: '😌', label: 'Calm', color: 'bg-blue-100 hover:bg-blue-200 text-blue-700' },
  { emoji: '😔', label: 'Sad', color: 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700' },
  { emoji: '😡', label: 'Angry', color: 'bg-red-100 hover:bg-red-200 text-red-700' },
  { emoji: '😣', label: 'Stressed', color: 'bg-orange-100 hover:bg-orange-200 text-orange-700' }
];

export default function Home() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [journals, setJournals] = useState([]);
  const [selectedMood, setSelectedMood] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [entryDate, setEntryDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [tagsInput, setTagsInput] = useState('');
  const [showTagsInput, setShowTagsInput] = useState(false);
  const [loading, setLoading] = useState(true);

  // Add date formatting
  const today = new Date();
  const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString('en-US', dateOptions);
  const todayIso = new Date().toISOString().split('T')[0];
  const isNotesPage = location.pathname === '/notes';

  const totalEntries = journals.length;
  const moodCounts = journals.reduce((acc, journal) => {
    if (!journal.mood) return acc;
    acc[journal.mood] = (acc[journal.mood] || 0) + 1;
    return acc;
  }, {});
  const mostCommonMood = Object.keys(moodCounts).reduce((top, mood) => {
    if (!top) return mood;
    return moodCounts[mood] > moodCounts[top] ? mood : top;
  }, '');
  const recentEntries = isNotesPage ? journals : journals.slice(0, 2);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'users', currentUser.uid, 'journals'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const journalData = [];
      snapshot.forEach((doc) => {
        journalData.push({ id: doc.id, ...doc.data() });
      });
      setJournals(journalData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    if (location.pathname === '/add-journal' && !isModalOpen) {
      handleOpenModal(selectedMood);
    }
  }, [location.pathname, isModalOpen, selectedMood]);

  const handleOpenModal = (mood = null, journal = null) => {
    if (journal) {
      setEditId(journal.id);
      setSelectedMood(MOODS.find(m => m.label === journal.mood));
      setFormData({ title: journal.title, description: journal.description });
      setEntryDate(journal.entryDate || todayIso);
      setTagsInput((journal.tags || []).join(', '));
      setShowTagsInput(Boolean(journal.tags && journal.tags.length));
    } else {
      setEditId(null);
      if (mood) setSelectedMood(mood);
      setFormData({ title: '', description: '' });
      setEntryDate(todayIso);
      setTagsInput('');
      setShowTagsInput(false);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditId(null);
    setFormData({ title: '', description: '' });
    setEntryDate(todayIso);
    setTagsInput('');
    setShowTagsInput(false);
    if (location.pathname === '/add-journal') {
      navigate('/');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMood || !formData.title || !formData.description) return;

    // Save state values before resetting
    const parseTags = (value) => value.split(',').map(tag => tag.trim()).filter(Boolean);
    const dataToSave = {
      mood: selectedMood.label,
      title: formData.title,
      description: formData.description,
      entryDate,
      tags: parseTags(tagsInput),
      isEdit: editId,
      idToEdit: editId
    };

    // Close Modal immediately for snappy UI
    handleCloseModal();

    // Show Confetti immediately
    confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.1 },
        colors: ['#8b5cf6', '#a78bfa', '#fcd34d', '#fdf4ff'],
        shapes: ['square']
    });

    try {
      // 1. Data Save in Firebase
      if (dataToSave.isEdit) {
        const docRef = doc(db, 'users', currentUser.uid, 'journals', dataToSave.idToEdit);
        await updateDoc(docRef, {
          mood: dataToSave.mood,
          title: dataToSave.title,
          description: dataToSave.description,
          entryDate: dataToSave.entryDate,
          tags: dataToSave.tags,
        });
      } else {
        await addDoc(collection(db, 'users', currentUser.uid, 'journals'), {
          mood: dataToSave.mood,
          title: dataToSave.title,
          description: dataToSave.description,
          entryDate: dataToSave.entryDate,
          tags: dataToSave.tags,
          createdAt: serverTimestamp()
        });
      }

      // 2. MongoDB env backend saving (Background - not awaited so it doesn't block UI)
      const mongoApiUrl = import.meta.env.VITE_MONGODB_API_URL;
      if (mongoApiUrl) {
         fetch(mongoApiUrl, {
             method: dataToSave.isEdit ? 'PUT' : 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
                 mood: dataToSave.mood,
                 title: dataToSave.title,
                 description: dataToSave.description,
                 entryDate: dataToSave.entryDate,
                 tags: dataToSave.tags,
                 userId: currentUser.uid,
                 journalId: dataToSave.idToEdit 
             })
         }).catch(mongoError => console.error("Error saving to MongoDB:", mongoError));
      }
    } catch (error) {
      console.error("Error saving journal:", error);
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this journal?')) {
        try {
            await deleteDoc(doc(db, 'users', currentUser.uid, 'journals', id));
        } catch (error) {
            console.error("Error deleting journal:", error);
        }
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-24 md:pb-10 pt-4">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-lg md:text-2xl font-semibold flex items-center flex-wrap gap-x-1.5">
            <span className="text-gray-900">Good Morning,</span>
            <span className="text-primary font-bold">{currentUser?.displayName || 'Friend'}</span>
            <span className="text-sm md:text-base mb-1">👋</span>
          </h1>
          <p className="text-text-muted mt-1">{formattedDate}</p>
        </div>
        <div className="hidden md:block w-12 h-12 rounded-full border-2 border-primary overflow-hidden shadow-md">
          <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${currentUser?.email}`} alt="avatar" />
        </div>
      </motion.div>

      {/* Mood Selector */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-3xl p-6 mb-8 shadow-sm"
      >
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">How are you feeling today?</h2>
        </div>
        <div className="grid grid-cols-4 gap-2 md:gap-4">
          {MOODS.map((mood) => (
            <MoodCard 
              key={mood.label} 
              mood={mood} 
              isSelected={selectedMood?.label === mood.label}
              onClick={() => setSelectedMood(mood)}
            />
          ))}
        </div>
      </motion.div>

      {/* Add Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleOpenModal(selectedMood)}
        className="w-full bg-gradient-to-r from-primary to-primary-light text-white rounded-2xl py-4 font-semibold text-lg flex items-center justify-center gap-3 shadow-lg hover:shadow-primary/30 transition-shadow mb-10"
      >
         <div className="bg-white/20 p-2 rounded-xl">
             <FiEdit3 className="text-xl"/>
         </div>
         + Write Today's Journal
      </motion.button>

      {/* Journal */}
      <div className="mb-4 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Journal</h2>
          <p className="text-sm text-text-muted">{isNotesPage ? 'All entries' : 'Latest 2 entries'}</p>
        </div>
        <div className="flex items-center gap-3 bg-white/70 border border-white/60 rounded-2xl px-4 py-3 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <FiClipboard />
          </div>
          <div>
            <p className="text-xs text-text-muted">Total Journal</p>
            <p className="text-lg font-bold text-gray-900">{totalEntries}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
             <div className="glass rounded-2xl p-6 h-32 animate-pulse flex items-center justify-center text-text-muted">Loading...</div>
        ) : recentEntries.length > 0 ? (
          recentEntries.map((journal, index) => (
            <motion.div
              key={journal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <JournalCard journal={journal} onEdit={() => handleOpenModal(null, journal)} onDelete={() => handleDelete(journal.id)} />
            </motion.div>
          ))
        ) : (
          <div className="glass rounded-2xl p-8 text-center text-text-muted">
            <p>No journals yet. Start writing your daily journals!</p>
          </div>
        )}
      </div>

      {/* Stats Snapshot */}
      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Stats Snapshot</h2>
          <span className="text-xs text-text-muted bg-white/70 px-3 py-1 rounded-full">This Week</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass p-5 rounded-2xl shadow-sm">
            <p className="text-xs text-text-muted">Total Entries</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{totalEntries}</p>
          </div>
          <div className="glass p-5 rounded-2xl shadow-sm">
            <p className="text-xs text-text-muted">Most Common Mood</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{mostCommonMood || '—'}</p>
          </div>
          <div className="glass p-5 rounded-2xl shadow-sm">
            <p className="text-xs text-text-muted">Happy Moments</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{moodCounts.Happy || 0}</p>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl shadow-sm mt-6">
          <h3 className="text-lg font-bold mb-4">Mood Breakdown</h3>
          <div className="space-y-3">
            {MOODS.map((mood) => {
              const count = moodCounts[mood.label] || 0;
              const percent = totalEntries ? Math.round((count / totalEntries) * 100) : 0;
              return (
                <div key={mood.label} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${mood.color}`}>{mood.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm font-medium text-gray-700">
                      <span>{mood.label}</span>
                      <span>{count} ({percent}%)</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full bg-primary/70" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              className="glass bg-white/95 w-full md:max-w-lg max-h-[85vh] md:max-h-[90vh] overflow-y-auto rounded-t-3xl md:rounded-3xl p-5 md:p-6 z-10 shadow-2xl relative pb-10"
            >
              <button 
                onClick={handleCloseModal}
                className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"  
              >
                <FiX />
              </button>
              
              <h2 className="text-2xl font-bold">Add Journal</h2>
              <p className="text-sm text-text-muted mt-1 mb-6">Capture your thoughts and how you're feeling 💜</p>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <p className="text-sm font-semibold text-text-main mb-3">1. How are you feeling today?</p>
                  <div className="grid grid-cols-4 gap-2">
                     {MOODS.map((mood) => {
                        const isActive = selectedMood?.label === mood.label;
                        const colorMap = {
                          Happy: 'from-purple-50 to-purple-100 border-purple-200',
                          Calm: 'from-blue-50 to-blue-100 border-blue-200',
                          Sad: 'from-indigo-50 to-indigo-100 border-indigo-200',
                          Angry: 'from-red-50 to-red-100 border-red-200',
                          Stressed: 'from-amber-50 to-amber-100 border-amber-200'
                        };

                        return (
                          <button
                            key={mood.label}
                            type="button"
                            onClick={() => setSelectedMood(mood)}
                            className={`relative rounded-xl border bg-gradient-to-b p-2 transition-all ${colorMap[mood.label] || 'from-gray-50 to-gray-100 border-gray-200'} ${isActive ? 'ring-2 ring-primary shadow-lg scale-105' : 'hover:shadow-md'}`}
                          >
                            {isActive && (
                              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-white flex items-center justify-center text-[10px]">
                                <FiCheck />
                              </span>
                            )}
                            <div className="text-xl md:text-2xl mb-0.5">{mood.emoji}</div>
                            <div className="text-[10px] font-semibold text-gray-700 truncate">{mood.label}</div>
                          </button>
                        );
                     })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-main mb-2">2. Journal Title</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Give your journal a title..."
                      className="w-full p-4 pr-12 rounded-xl border border-gray-200 bg-white/60 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded-lg">Aa</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-main mb-2">3. What's on your mind?</label>
                  <div className="relative">
                    <textarea 
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Write your thoughts, feelings, and anything you want to express..."
                      rows="4"
                      className="w-full p-4 rounded-xl border border-gray-200 bg-white/60 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                      required
                    ></textarea>
                    <FiEdit3 className="absolute bottom-3 right-3 text-primary" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-text-main mb-2">4. Date</label>
                  <div className="flex items-center gap-3 bg-white/70 border border-gray-200 rounded-xl px-3 py-2">
                    <FiCalendar className="text-primary" />
                    <input
                      type="date"
                      value={entryDate}
                      onChange={e => setEntryDate(e.target.value)}
                      className="w-full bg-transparent outline-none text-sm text-gray-700"
                      required
                    />
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setShowTagsInput(!showTagsInput)}
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary bg-primary/10 px-3 py-2 rounded-xl hover:bg-primary/20 transition-colors"
                  >
                    <FiTag /> Add Tags
                  </button>
                  {showTagsInput && (
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={e => setTagsInput(e.target.value)}
                      placeholder="e.g. work, family, health"
                      className="mt-3 w-full p-3 rounded-xl border border-gray-200 bg-white/60 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    />
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary-light transition-colors"
                  >
                    <FiSave /> Save Journal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}