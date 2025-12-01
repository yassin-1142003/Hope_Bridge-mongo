import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TaskDetail from './pages/TaskDetail';
import ChatSystem from './components/ChatSystem';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { ChatProvider } from './contexts/ChatContext';
import './App.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
}

function AuthRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  return !user ? children : <Navigate to="/dashboard" />;
}

function AppContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Router>
        <AuthProvider>
          <SocketProvider>
            <ChatProvider>
              <Navbar />
              <main className="container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
                  <Route path="/register" element={<AuthRoute><Register /></AuthRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/task/:id" element={<ProtectedRoute><TaskDetail /></ProtectedRoute>} />
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
              </main>
              <ChatSystem />
              <Toaster position="top-right" />
            </ChatProvider>
          </SocketProvider>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default AppContent;
