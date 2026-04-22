import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck, AlertTriangle, ChevronRight, CheckCircle2, LogOut, ArrowRight, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAntiCheat } from '../hooks/useAntiCheat';
import { cn, formatTime } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useExams, Exam, Question } from '../context/ExamContext';
import { useStudents, Submission } from '../context/StudentContext';

export const StudentExam: React.FC = () => {
  const { exams } = useExams();
  const { addSubmission } = useStudents();
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour
  const [isFocused, setIsFocused] = useState(true);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  const [violations, setViolations] = useState<any[]>([]);
  const [showWarning, setShowWarning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [terminationReason, setTerminationReason] = useState<string | null>(null);

  const VIOLATION_LIMIT = 5;

  const handleLogout = () => {
    if (window.confirm("Logging out will submit your current progress and end the examination. Do you wish to proceed?")) {
      finalizeExam(violations.length);
      logout();
      navigate('/');
    }
  };

  const finalizeExam = (vCount: number) => {
    if (!selectedExam) return;
    
    const submission: Submission = {
      id: Math.random().toString(36).substr(2, 9),
      studentName: user || 'Anonymous',
      enrollmentId: user || 'N/A',
      examId: selectedExam.id,
      examTitle: selectedExam.title,
      progress: 100,
      state: vCount > 2 ? 'UNFOCUSED' : vCount > 0 ? 'WARNING' : 'FOCUSED',
      risk: vCount > 0 ? `${(vCount * 15).toFixed(1)}%` : '0%',
      level: vCount > 3 ? 'High' : vCount > 1 ? 'Medium' : 'Low',
      content: Object.values(answers).join(' | '),
      timestamp: new Date().toISOString(),
      violationsCount: vCount,
      violations: violations.map(v => ({
        type: v.type,
        details: v.details,
        timestamp: v.timestamp
      }))
    };
    
    addSubmission(submission);
    setCompleted(true);
  };

  // Anti-Cheat Hook
  useAntiCheat(
    !!selectedExam && !completed,
    (v) => {
      setViolations(prev => {
        const updated = [...prev, v];
        if (updated.length >= VIOLATION_LIMIT) {
          setTerminationReason('Extreme security violations detected. Your session has been automatically invalidated.');
          finalizeExam(updated.length);
        } else {
          setShowWarning(true);
          setTimeout(() => setShowWarning(false), 5000);
        }
        return updated;
      });
    },
    (focused) => setIsFocused(focused)
  );

  useEffect(() => {
    if (!selectedExam || completed || timeLeft <= 0 || !isFocused) {
      if (timeLeft === 0 && !completed) finalizeExam(violations.length);
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, completed, isFocused, selectedExam]);

  const handleSubmit = () => {
    finalizeExam(violations.length);
  };

  if (!selectedExam) {
    const activeExams = exams.filter(e => e.status === 'Active');
    return (
      <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-4xl w-full"
        >
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Welcome, {user}</h1>
            <p className="text-slate-500">Please select an assigned examination program to begin</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeExams.map(exam => (
              <button 
                key={exam.id}
                onClick={() => setSelectedExam(exam)}
                className="pro-card p-8 text-left hover:border-blue-400 group transition-all relative overflow-hidden"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{exam.title}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{exam.questions.length} Questions • 60 Mins</p>
                  </div>
                </div>
                <div className="flex items-center text-blue-600 text-xs font-bold uppercase tracking-widest">
                  <span>Begin Assessment</span>
                  <ArrowRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>
            ))}
          </div>

          <button 
            onClick={logout}
            className="mt-12 text-slate-400 hover:text-slate-600 flex items-center mx-auto text-xs font-bold uppercase tracking-widest"
          >
            <LogOut size={16} className="mr-2" />
            Logout from Student Portal
          </button>
        </motion.div>
      </div>
    );
  }

  const QUESTIONS = selectedExam.questions;

  if (completed) {
    // ... (Completed UI remains same)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn("pro-card p-12 max-w-md w-full text-center shadow-2xl border-t-4 transition-all", terminationReason ? "border-t-red-500" : "border-t-green-500")}
        >
          {terminationReason ? (
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
               <AlertTriangle size={48} />
            </div>
          ) : (
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={48} />
            </div>
          )}
          
          <h1 className={cn("text-2xl font-bold mb-2", terminationReason ? "text-red-700" : "text-slate-800")}>
            {terminationReason ? "Exam Terminated" : "Exam Submitted"}
          </h1>
          <p className="text-slate-500 mb-8 text-sm leading-relaxed px-4">
            {terminationReason || "Your response has been securely transmitted. You may now close this tab safely."}
          </p>
          
          <div className={cn("p-5 rounded-2xl border text-left mx-auto max-w-[280px] mb-8", terminationReason ? "bg-red-50 border-red-100" : "bg-slate-50 border-slate-100")}>
            <p className="text-[10px] uppercase font-black text-slate-400 tracking-[0.1em] mb-3">Integrity Audit Log</p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Security Invariants:</span>
                <span className={cn("font-bold", terminationReason ? "text-red-600" : "text-green-600")}>
                  {terminationReason ? "COMPROMISED" : "VERIFIED"}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                 <span className="text-slate-500">Focus Deviations:</span>
                 <span className="font-bold text-slate-700">{violations.length} / {VIOLATION_LIMIT}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="w-full pro-btn-primary flex items-center justify-center space-x-2"
          >
            <LogOut size={18} />
            <span>Logout & Return to Login</span>
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <ShieldCheck className="text-blue-600" />
          <h1 className="font-bold text-slate-800 tracking-tight">EduGuard Secure Browser</h1>
        </div>
        
        <div className="flex items-center space-x-8">
          <div className={cn(
            "flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors border",
            isFocused ? "bg-green-50 border-green-100 text-green-700" : "bg-red-50 border-red-100 text-red-700 animate-pulse"
          )}>
            <div className={cn("w-2 h-2 rounded-full", isFocused ? "bg-green-500" : "bg-red-500")} />
            <span className="text-xs font-bold uppercase tracking-widest">
              {isFocused ? "Focused & Secured" : "Security Alert: Focus Lost"}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 text-slate-600 font-mono font-bold tabular-nums">
            <Clock size={18} />
            <span className={cn(timeLeft < 300 && "text-red-500")}>{formatTime(timeLeft)}</span>
          </div>

          <button 
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
            title="Logout and End Exam"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Warning Overlay */}
      <AnimatePresence>
        {(!isFocused || showWarning) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-6 bg-red-900/10 backdrop-blur-[2px]"
          >
            <motion.div 
               initial={{ y: 20 }}
               animate={{ y: 0 }}
               className="bg-white border-2 border-red-500 p-6 rounded-2xl shadow-2xl flex items-center space-x-4 max-w-lg"
            >
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <p className="font-bold text-red-600">Security Violation Detected</p>
                <p className="text-sm text-slate-600">Switching tabs or loss of focus is strictly prohibited. Your activity is being logged for review.</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 max-w-4xl w-full mx-auto p-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-1">Current Question {currentIdx + 1} of {QUESTIONS.length}</h2>
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{selectedExam.title}</h3>
          </div>
          <div className="flex items-center space-x-2">
             {QUESTIONS.map((_, idx) => (
               <div key={idx} className={cn(
                 "w-8 h-1 rounded-full",
                 idx === currentIdx ? "bg-blue-600" : idx < currentIdx ? "bg-slate-300" : "bg-slate-200"
               )} />
             ))}
          </div>
        </div>

        <motion.div 
          key={currentIdx}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="pro-card p-10 min-h-[400px] flex flex-col"
        >
          <div className="flex-1">
            <p className="text-lg font-medium text-slate-700 leading-relaxed mb-8">
              {QUESTIONS[currentIdx].text}
            </p>

            {QUESTIONS[currentIdx].type === 'mcq' ? (
              <div className="space-y-4">
                {QUESTIONS[currentIdx].options?.map((opt, i) => (
                  <label key={i} className="flex items-center p-5 border-2 border-slate-100 rounded-2xl cursor-pointer hover:border-blue-100 hover:bg-blue-50/30 transition-all group active:scale-[0.99]">
                    <input 
                      type="radio" 
                      name="mcq" 
                      checked={answers[QUESTIONS[currentIdx].id] === opt}
                      onChange={() => setAnswers(prev => ({ ...prev, [QUESTIONS[currentIdx].id]: opt }))}
                      className="w-5 h-5 text-blue-600 border-slate-300 focus:ring-blue-500" 
                    />
                    <span className="ml-4 text-slate-700 font-medium">{opt}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <textarea 
                  className="w-full h-48 p-6 border-2 border-slate-100 rounded-2xl focus:border-blue-200 focus:ring-0 bg-slate-50/50 text-slate-700 resize-none transition-all placeholder:text-slate-300" 
                  placeholder="Type your detailed answer here..."
                  value={answers[QUESTIONS[currentIdx].id] || ''}
                  onChange={(e) => setAnswers(prev => ({ ...prev, [QUESTIONS[currentIdx].id]: e.target.value }))}
                  onPaste={(e) => {
                    e.preventDefault();
                    setViolations(prev => [...prev, { type: 'paste', details: 'Paste attempt detected', timestamp: new Date().toISOString() }]);
                  }}
                />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  Auto-saving active • Copy/Paste disabled
                </p>
              </div>
            )}
          </div>

          <div className="mt-12 flex items-center justify-between pt-8 border-t border-slate-100">
            <button 
              onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="pro-btn-secondary disabled:opacity-30 flex items-center space-x-2"
            >
              Previous
            </button>
            
            {currentIdx < QUESTIONS.length - 1 ? (
              <button 
                onClick={() => setCurrentIdx(prev => prev + 1)}
                className="pro-btn-primary flex items-center space-x-2 px-8"
              >
                <span>Save & Continue</span>
                <ChevronRight size={18} />
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all shadow-xl shadow-slate-900/20 active:scale-95"
              >
                Final Submit Exam
              </button>
            )}
          </div>
        </motion.div>
      </main>

      <footer className="bg-white border-t border-slate-200 p-4 text-center">
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
          Certified Secure Assessment Engine • Built by Viswam Edutech
        </p>
      </footer>
    </div>
  );
};
