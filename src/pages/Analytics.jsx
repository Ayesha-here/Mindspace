import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../firebase/firebaseConfig';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { FiCalendar } from 'react-icons/fi';

const MOOD_COLORS = {
  'Happy': '#fef08a', // yellow-200
  'Calm': '#bfdbfe',  // blue-200
  'Sad': '#c7d2fe',   // indigo-200
  'Angry': '#fecaca', // red-200
  'Stressed': '#fed7aa', // orange-200
};

const MOOD_EMOJIS = {
  'Happy': '😊',
  'Calm': '😌',
  'Sad': '😔',
  'Angry': '😡',
  'Stressed': '😣'
};

export default function Analytics() {
  const { currentUser } = useAuth();
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    const q = query(collection(db, 'users', currentUser.uid, 'journals'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = [];
      snapshot.forEach((doc) => {
        data.push(doc.data());
      });
      setJournals(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const getJournalDate = (journal) => {
    if (journal.entryDate) return new Date(journal.entryDate);
    if (journal.createdAt) return journal.createdAt.toDate();
    return null;
  };

  const moodCounts = journals.reduce((acc, journal) => {
    if (!journal.mood) return acc;
    acc[journal.mood] = (acc[journal.mood] || 0) + 1;
    return acc;
  }, {});

  const totalEntries = journals.length;
  const pieData = Object.keys(MOOD_EMOJIS).map(key => ({
    name: key,
    value: moodCounts[key] || 0,
  }));

  const getPercent = (value) => {
    if (!totalEntries) return 0;
    return Math.round((value / totalEntries) * 1000) / 10;
  };

  // Find Most Common
  let mostCommon = 'N/A';
  let maxCount = 0;
  Object.keys(moodCounts).forEach(key => {
    if (moodCounts[key] > maxCount) {
      maxCount = moodCounts[key];
      mostCommon = key;
    }
  });

  // Calculate Trend Data (Last 7 Days)
  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      dateObj: d,
      name: d.toLocaleDateString('en-US', { weekday: 'short' }),
      total: 0
    };
  });

  journals.forEach(j => {
    const jDate = getJournalDate(j);
    if (!jDate) return;
    const dayMatch = last7Days.find(d => d.dateObj.toDateString() === jDate.toDateString());
    if (dayMatch) {
      dayMatch.total += 1;
    }
  });

  const positiveCount = (moodCounts.Happy || 0) + (moodCounts.Calm || 0);
  const negativeCount = (moodCounts.Sad || 0) + (moodCounts.Angry || 0) + (moodCounts.Stressed || 0);
  const balanceScore = totalEntries ? Math.round(((positiveCount - negativeCount) / totalEntries) * 100) : 0;
  const balanceLabel = balanceScore >= 15 ? 'Good' : balanceScore <= -15 ? 'Needs Care' : 'Balanced';

  const getDateKey = (date) => date.toISOString().slice(0, 10);
  const moodByDate = journals.reduce((acc, journal) => {
    const jDate = getJournalDate(journal);
    if (!jDate || !journal.mood) return acc;
    acc[getDateKey(jDate)] = journal.mood;
    return acc;
  }, {});

  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const daysInMonth = monthEnd.getDate();
  const startDay = monthStart.getDay();
  const calendarCells = Array.from({ length: startDay + daysInMonth }, (_, i) => {
    if (i < startDay) return null;
    const day = i - startDay + 1;
    const date = new Date(today.getFullYear(), today.getMonth(), day);
    const key = getDateKey(date);
    return {
      day,
      mood: moodByDate[key] || null,
    };
  });

  if (loading) {
    return <div className="h-full flex items-center justify-center text-text-muted">Loading Analytics...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto pb-24 md:pb-10 pt-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-5 mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Stats & Insights</h1>
            <p className="text-text-muted mt-1">Track your mood patterns and emotional well-being</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/80 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-600 shadow-sm">
              <FiCalendar className="text-primary" />
              <span>1 May 2025 - 7 May 2025</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {['This Week', 'Last 7 Days', 'This Month'].map((label) => (
            <span key={label} className={`px-3 py-1 rounded-full text-xs font-semibold ${label === 'This Week' ? 'bg-primary text-white' : 'bg-white/70 text-text-muted border border-gray-200'}`}>
              {label}
            </span>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass p-6 rounded-3xl shadow-sm md:col-span-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center text-xl">📒</div>
            <div>
              <p className="text-2xl font-bold">{totalEntries}</p>
              <p className="text-sm text-text-muted">Total Journals</p>
              <p className="text-xs text-green-600 mt-1">+3 from last week</p>
            </div>
          </div>
          <div className="mt-4 h-2 rounded-full bg-primary/10 overflow-hidden">
            <div className="h-full w-2/3 bg-primary rounded-full"></div>
          </div>
        </motion.div>

        <div className="col-span-1 md:col-span-4 grid grid-cols-4 gap-2">
          {pieData.map((data, idx) => (
            <motion.div
              key={data.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * idx }}
              className="glass p-2 md:p-4 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center"
            >
              <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-white/80 flex items-center justify-center text-xl md:text-2xl mb-1">
                {MOOD_EMOJIS[data.name]}
              </div>
              <div className="text-[12px] md:text-lg font-bold leading-tight">{data.value}</div>
              <div className="text-[10px] md:text-xs text-text-muted leading-tight truncate w-full">{data.name}</div>
              <div className="mt-1 text-[9px] md:text-[11px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                {getPercent(data.value)}%
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass p-6 rounded-3xl shadow-sm lg:col-span-5"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Mood Distribution</h2>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">This Week</span>
          </div>
          {totalEntries === 0 ? (
            <div className="h-64 flex items-center justify-center text-text-muted bg-white/30 rounded-2xl">No data available</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={MOOD_COLORS[entry.name] || '#ccc'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3">
                {pieData.map((data) => (
                  <div key={data.name} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: MOOD_COLORS[data.name] }} />
                      {data.name}
                    </span>
                    <span className="text-text-muted">{data.value} ({getPercent(data.value)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass p-6 rounded-3xl shadow-sm lg:col-span-7"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold">Mood Trend (This Week)</h2>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Daily</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={last7Days}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dx={-10} />
                <Tooltip cursor={{ stroke: '#a78bfa', strokeWidth: 1 }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-text-muted">
            {pieData.map((data) => (
              <span key={data.name} className="flex items-center gap-1">
                {MOOD_EMOJIS[data.name]}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass p-5 rounded-3xl shadow-sm lg:col-span-4">
          <h3 className="text-sm font-semibold text-text-muted">Most Common Mood</h3>
          <div className="mt-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-yellow-100 flex items-center justify-center text-3xl">
              {mostCommon !== 'N/A' ? MOOD_EMOJIS[mostCommon] : '—'}
            </div>
            <div>
              <p className="text-lg font-bold">{mostCommon}</p>
              <p className="text-xs text-text-muted">{getPercent(maxCount)}% of your mood</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass p-5 rounded-3xl shadow-sm lg:col-span-4">
          <h3 className="text-sm font-semibold text-text-muted">Mood Streak</h3>
          <div className="mt-4 flex items-center gap-3">
            <div className="text-3xl">🔥</div>
            <div>
              <p className="text-2xl font-bold">3</p>
              <p className="text-xs text-text-muted">Days</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2 text-xs text-text-muted">
            {['M','T','W','T','F','S','S'].map((d, i) => (
              <span key={d + i} className={`w-6 h-6 rounded-full flex items-center justify-center ${i < 3 ? 'bg-primary text-white' : 'bg-gray-100'}`}>{d}</span>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-5 rounded-3xl shadow-sm lg:col-span-4">
          <h3 className="text-sm font-semibold text-text-muted">Emotional Balance</h3>
          <div className="mt-4 flex items-center justify-between">
            <div className="text-4xl">💜</div>
            <div className="text-right">
              <p className="text-lg font-bold" style={{ color: balanceScore >= 0 ? '#22c55e' : '#f97316' }}>{balanceLabel}</p>
              <p className="text-xs text-text-muted">Balance score {balanceScore}</p>
            </div>
          </div>
          <p className="text-xs text-text-muted mt-3">Keep tracking daily to improve your balance.</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass p-6 rounded-3xl shadow-sm lg:col-span-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Mood Calendar</h3>
            <span className="text-xs text-text-muted">{today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>
          <div className="grid grid-cols-7 gap-2 text-xs text-gray-500 mb-2">
            {['S','M','T','W','T','F','S'].map((day) => (
              <div key={day} className="text-center">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {calendarCells.map((cell, idx) => (
              <div key={idx} className="h-9 rounded-lg bg-white/60 flex items-center justify-center text-xs text-gray-600">
                {cell ? (
                  <span className="flex items-center gap-1">
                    {cell.day}
                    {cell.mood ? <span className="text-sm">{MOOD_EMOJIS[cell.mood]}</span> : null}
                  </span>
                ) : ''}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-3xl shadow-sm lg:col-span-4 p-6 bg-gradient-to-b from-primary/20 via-primary/10 to-white/50 border border-white/60">
          <div className="text-sm font-semibold text-primary mb-3">Daily Reflection</div>
          <p className="text-lg font-semibold text-gray-800">"Small steps every day lead to big changes."</p>
          <p className="text-xs text-text-muted mt-4">Believe in yourself 💜</p>
          <div className="mt-6 h-28 rounded-2xl bg-white/60 flex items-end justify-end p-4">
            <span className="text-4xl">🌙</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}