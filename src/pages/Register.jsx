import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters long');
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to create an account: ' + err.message);
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
          <div className="w-16 h-16 bg-gradient-to-bl from-pink-400 to-primary-light rounded-2xl shadow-lg mx-auto flex items-center justify-center text-white font-bold text-3xl mb-4 -rotate-12">
            M
          </div>
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">Create Account</h2>
          <p className="text-text-muted mt-2 font-medium">Start your emotional wellness journey</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiMail className="text-gray-400" />
              </div>
              <input
                type="email"
                required
                className="w-full pl-11 p-4 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-400 font-medium text-gray-700"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiLock className="text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full pl-11 pr-11 p-4 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-400 font-medium text-gray-700"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-primary transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FiLock className="text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full pl-11 p-4 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder-gray-400 font-medium text-gray-700"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-primary-light text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-primary/30 hover:scale-[1.02] transition-all disabled:opacity-70 disabled:scale-100 uppercase tracking-wide mt-2"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-8 text-center text-gray-600 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-purple-600 font-bold hover:underline underline-offset-4">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}