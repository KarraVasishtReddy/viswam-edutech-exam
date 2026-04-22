import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Settings, ArrowRight, Mail, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

import { useExams } from '../context/ExamContext';
import { useStudents } from '../context/StudentContext';

export const Login: React.FC = () => {
  const { exams } = useExams();
  const activeExamNames = exams.filter(e => e.status === 'Active').map(e => e.title).join(', ') || 'General Assessment';
  
  const [activeRole, setActiveRole] = useState<'student' | 'admin'>('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const { students, addStudent } = useStudents();
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    if (activeRole === 'admin') {
      if (identifier === 'admin' && password === '12345678') {
        login('admin', 'Administrator');
        navigate('/admin');
      } else {
        setError('Invalid admin credentials');
      }
      return;
    }

    // Student Logic - Auto detect/register
    const existingStudent = students.find(s => s.id === identifier);
    if (!existingStudent) {
      addStudent({
        id: identifier,
        name: identifier, // Generic name for auto-registration
        email: `${identifier.toLowerCase()}@viswam.edu`,
        examsTaken: 0,
        avgIntegrity: 'N/A'
      });
    }

    login('student', identifier);
    navigate('/exam');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 relative overflow-hidden">
      {/* ... (Background remains same) */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600 rounded-full blur-[160px]" />
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/20"
          >
            <Shield size={32} className="text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Viswam Assessment</h1>
          <AnimatePresence mode="wait">
            <motion.p 
              key={activeRole}
              initial={{ y: 5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -5, opacity: 0 }}
              className="text-blue-500 text-sm mt-2 font-black uppercase tracking-widest"
            >
              {activeRole === 'student' ? `Subject: ${activeExamNames}` : 'Enterprise Secure Examination Portal'}
            </motion.p>
          </AnimatePresence>
        </div>

        <div className="pro-card bg-slate-900 border-slate-800 p-8 shadow-2xl relative overflow-hidden">
          {/* Role Toggle */}
          <div className="flex p-1 bg-slate-800 rounded-xl mb-8 relative">
            <motion.div 
              className="absolute h-[calc(100%-8px)] w-[calc(50%-4px)] bg-blue-600 rounded-lg"
              animate={{ x: activeRole === 'student' ? '0%' : '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
            <button 
              type="button"
              onClick={() => { setActiveRole('student'); setError(null); }}
              className={cn(
                "relative z-10 flex-1 py-2 text-xs font-bold uppercase tracking-widest transition-colors",
                activeRole === 'student' ? "text-white" : "text-slate-400"
              )}
            >
              Student Login
            </button>
            <button 
              type="button"
              onClick={() => { setActiveRole('admin'); setError(null); }}
              className={cn(
                "relative z-10 flex-1 py-2 text-xs font-bold uppercase tracking-widest transition-colors",
                activeRole === 'admin' ? "text-white" : "text-slate-400"
              )}
            >
              Admin Login
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-xs font-bold text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="text" 
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={activeRole === 'admin' ? "Admin Username" : "Enrollment ID"}
                  className="w-full bg-slate-800 border-2 border-transparent focus:border-blue-500/50 rounded-xl py-3 pl-12 pr-4 text-white text-sm transition-all focus:ring-0 placeholder:text-slate-600 outline-none"
                  required
                />
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Access Password"
                  className="w-full bg-slate-800 border-2 border-transparent focus:border-blue-500/50 rounded-xl py-3 pl-12 pr-4 text-white text-sm transition-all focus:ring-0 placeholder:text-slate-600 outline-none"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/20 hover:bg-blue-700 transition-all flex items-center justify-center space-x-2 group active:scale-95"
            >
              <span>Verify & Access</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="mt-8 text-center text-slate-600 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
            Authorized Personnel Only <br />
            Continuous Proctoring Recording Active
          </p>
        </div>
        
        <p className="text-center mt-6 text-slate-700 text-xs font-medium">
          Forgot your credentials? <a href="#" className="text-blue-500 hover:underline">Contact System Admin</a>
        </p>
      </div>
    </div>
  );
};
