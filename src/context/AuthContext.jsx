import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('mindspace_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  function login(name, phone) {
    const safePhone = String(phone).replace(/\D/g, '').slice(-10);
    const user = {
      uid: `user_${safePhone || Date.now()}`,
      displayName: name.trim(),
      phone: safePhone,
    };
    localStorage.setItem('mindspace_user', JSON.stringify(user));
    setCurrentUser(user);
    return Promise.resolve();
  }

  function signup() {
    return Promise.resolve();
  }

  function logout() {
    localStorage.removeItem('mindspace_user');
    setCurrentUser(null);
    return Promise.resolve();
  }

  const value = {
    currentUser,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
