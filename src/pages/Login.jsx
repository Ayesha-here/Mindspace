import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiPhone } from 'react-icons/fi';

export default function Login() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      if (!name.trim() || !phone.trim()) {
        setError('Please enter your name and mobile number');
        return;
      }
      await login(name, phone);
      navigate('/');
    } catch (err) {
      setError('Failed to log in: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass max-w-md w-full p-8 md:p-10 rounded-3xl shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-purple-400 rounded-2xl shadow-lg mx-auto flex items-center justify-center text-white font-bold text-3xl mb-4 rotate-12">
            M
          </div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">Welcome Back</h2>
          <p className="text-text-muted mt-2 font-medium">Login with your name and mobile number</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  className="w-full pl-11 p-4 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-400 font-medium text-gray-700"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiPhone className="text-gray-400" />
                </div>
                <input
                  type="tel"
                  required
                  inputMode="numeric"
                  className="w-full pl-11 p-4 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-400 font-medium text-gray-700"
                  placeholder="10-digit number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-primary-light text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02] transition-all disabled:opacity-70 disabled:scale-100 uppercase tracking-wide"
          >
            {loading ? 'Logging in...' : 'Continue'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}