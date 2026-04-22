import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminMonitor } from './components/AdminMonitor';
import { StudentExam } from './components/StudentExam';
import { Login } from './components/Login';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children, role }: { children: React.ReactNode, role: string }) => {
  const { role: userRole } = useAuth();
  if (userRole !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const AppContent = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute role="admin">
              <AdminMonitor />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/exam" 
          element={
            <ProtectedRoute role="student">
              <StudentExam />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

import { ExamProvider } from './context/ExamContext';
import { StudentProvider } from './context/StudentContext';

export default function App() {
  return (
    <AuthProvider>
      <ExamProvider>
        <StudentProvider>
          <AppContent />
        </StudentProvider>
      </ExamProvider>
    </AuthProvider>
  );
}
