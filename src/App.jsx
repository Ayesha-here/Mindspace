import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"

import Login from "./pages/Login"
import Home from "./pages/Home"
import Analytics from "./pages/Analytics"
import Profile from "./pages/Profile"
import Notes from "./pages/Notes"
import Sidebar from "./components/Sidebar"
import { useAuth } from "./context/AuthContext"

function AppLayout({ children }) {
  const { currentUser } = useAuth();
  
  return (
    <div className="flex h-screen bg-background overflow-hidden relative">
      {/* Animated blob background */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-light/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-pink-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-purple-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      {currentUser && <Sidebar />}
      <div className="flex-1 w-full relative z-10 overflow-y-auto overflow-x-hidden p-6 md:p-10">
        {children}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/add-journal"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notes"
              element={
                <ProtectedRoute>
                  <Notes />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AppLayout>
      </Router>
    </AuthProvider>
  )
}

export default App
