import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiPlusSquare, FiPieChart, FiUser, FiBookOpen, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

export default function Sidebar() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const navLinks = [
    { to: '/', icon: <FiHome className="text-2xl" />, label: 'Home' },
    { to: '/notes', icon: <FiBookOpen className="text-2xl" />, label: 'Journal' },
    { to: '/add-journal', icon: <FiPlusSquare className="text-2xl" />, label: 'Add' },
    { to: '/analytics', icon: <FiPieChart className="text-2xl" />, label: 'Stats' },
    { to: '/profile', icon: <FiUser className="text-2xl" />, label: 'Profile' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.nav 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden md:flex flex-col h-full w-64 glass shadow-2xl relative z-50 p-6 m-4 rounded-3xl"
      >
        <div className="flex items-center gap-2 mb-12 px-4 shadow-sm pb-4 border-b border-primary/10">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-400 rounded-full shadow-lg shadow-primary/30 flex items-center justify-center text-white font-bold text-xl">
            M
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 tracking-tight">MindSpace</span>
        </div>
        
        <div className="flex-1 space-y-4">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-4 px-6 py-4 rounded-2xl font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-105 filter drop-shadow-md'
                    : 'text-text-muted hover:bg-white/50 hover:text-primary hover:scale-105 backdrop-blur-md'
                }`
              }
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-4 px-6 py-4 rounded-2xl font-medium text-red-500 hover:bg-red-50 hover:scale-105 transition-all duration-300 mt-auto backdrop-blur-md"
        >
          <FiLogOut className="text-2xl" />
          Logout
        </button>
      </motion.nav>

      {/* Mobile Bottom Navigation */}
      <motion.nav 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="md:hidden fixed bottom-0 left-0 right-0 glass shadow-2xl z-50 border-t border-white/40 pb-safe rounded-t-3xl backdrop-blur-xl bg-white/70"
      >
        <div className="flex justify-around items-center p-4">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${
                  isActive ? 'text-primary scale-110' : 'text-gray-400 hover:text-primary'
                }`
              }
            >
              <div className={`p-2 rounded-2xl ${link.to === '/add-journal' ? 'bg-primary text-white shadow-lg shadow-primary/30 -mt-8 w-14 h-14 flex items-center justify-center border-4 border-background' : ''}`}>
                 {link.icon}
              </div>
              {link.to !== '/add-journal' && <span className="text-xs font-medium">{link.label}</span>}
            </NavLink>
          ))}
        </div>
      </motion.nav>
    </>
  );
}