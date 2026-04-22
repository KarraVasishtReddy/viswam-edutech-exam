import React, { useState } from 'react';
import { LayoutDashboard, Library, Users, ShieldAlert, LogOut, RefreshCw, Eye, AlertCircle, ShieldCheck, Plus, Trash2, Save, Send, ArrowLeft, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useExams, Exam, Question } from '../context/ExamContext';
import { useStudents, Submission, Student } from '../context/StudentContext';

export const AdminMonitor: React.FC = () => {
  const [currentView, setCurrentView] = useState<'monitor' | 'library' | 'students' | 'logs' | 'editor'>('monitor');
  const { exams, addExam: addExamToContext, updateExam, publishExam } = useExams();
  const { students, submissions, addStudent, updateSubmission } = useStudents();
  
  const [selectedStudent, setSelectedStudent] = useState<Submission | null>(null);
  const [selectedExamForEdit, setSelectedExamForEdit] = useState<Exam | null>(null);
  
  // Modal states
  const [showExamModal, setShowExamModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  
  // New entry states
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newStudent, setNewStudent] = useState({ id: '', name: '', email: '' });

  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const onAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamTitle) return;
    addExamToContext(newExamTitle);
    setShowExamModal(false);
    setNewExamTitle('');
    // Note: Since we don't have the newly created ID easily here 
    // without returning it from addExam, we'll just return to library
    setCurrentView('library');
  };

  const onUpdateQuestions = (q: Question[]) => {
    if (!selectedExamForEdit) return;
    const updated = { ...selectedExamForEdit, questions: q };
    setSelectedExamForEdit(updated);
    updateExam(updated);
  };

  const onAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.id || !newStudent.name) return;
    const student: Student = {
      id: newStudent.id,
      name: newStudent.name,
      email: newStudent.email,
      examsTaken: 0,
      avgIntegrity: 'N/A'
    };
    addStudent(student);
    setShowStudentModal(false);
    setNewStudent({ id: '', name: '', email: '' });
  };

  const renderContent = () => {
    switch (currentView) {
      case 'monitor':
        return (
          <div className="flex-1 p-8 grid grid-cols-12 gap-6 overflow-hidden">
            <div className="col-span-8 space-y-6 overflow-y-auto pr-4">
              <div className="grid grid-cols-3 gap-4">
                <StatCard label="Active Students" value={`${submissions.filter(s => s.state === 'FOCUSED').length} / ${submissions.length || 0}`} />
                <StatCard label="Security Alerts" value={submissions.filter(s => s.state !== 'FOCUSED').length.toString()} color="text-red-500" />
                <StatCard label="Avg. Integrity" value="Check Log" color="text-green-600" />
              </div>

              <div className="pro-card overflow-hidden">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
                  <h3 className="font-bold text-slate-700">Student Live Activity</h3>
                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <RefreshCw size={12} className="animate-spin" />
                    <span>Polling Real-time</span>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="text-[10px] uppercase tracking-widest text-slate-400 bg-white">
                      <tr className="border-b border-slate-100">
                        <th className="px-6 py-4">Student Name</th>
                        <th className="px-6 py-4">Exam</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Score</th>
                        <th className="px-6 py-4">AI Risk</th>
                        <th className="px-6 py-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm font-medium">
                      {submissions.map((s) => (
                        <tr key={s.id} className={cn("border-b border-slate-50 hover:bg-blue-50/10 transition-colors cursor-pointer", selectedStudent?.id === s.id && "bg-blue-50/30")}>
                          <td className="px-6 py-4">{s.studentName}</td>
                          <td className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{s.examTitle}</td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[9px] font-black tracking-tight uppercase",
                              s.state === 'FOCUSED' ? 'bg-green-100 text-green-700' :
                              s.state === 'WARNING' ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                            )}>
                              {s.state}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono text-xs font-bold text-slate-700">
                            {s.score ?? 0} / {s.totalQuestions ?? 0}
                          </td>
                          <td className={cn("px-6 py-4", s.level === 'High' ? 'text-red-500' : 'text-slate-400')}>
                            <span className="font-mono text-xs">{s.risk}</span>
                            <span className="ml-2 text-[10px] font-bold opacity-70">({s.level})</span>
                          </td>
                          <td className="px-6 py-4">
                            <button 
                              onClick={() => setSelectedStudent(s)}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded-lg hover:bg-blue-50 transition-colors"
                            >
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {submissions.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                            No active exam sessions or recent submissions discovered.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Plagiarism Detail Sidebar */}
            <div className="col-span-4 flex flex-col space-y-6">
              <AnimatePresence mode="wait">
                {selectedStudent ? (
                  <motion.div
                    key={selectedStudent.id}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: 20, opacity: 0 }}
                    className="pro-card flex-1 flex flex-col overflow-hidden border-blue-200 ring-2 ring-blue-500/10 ring-offset-0"
                  >
                    <div className="p-5 border-b border-slate-200 bg-slate-50/50">
                      <div className="flex items-center justify-between mb-4">
                         <h3 className="font-bold text-slate-800">Review Submission</h3>
                         <button onClick={() => setSelectedStudent(null)} className="text-slate-400 hover:text-slate-600">×</button>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                          {selectedStudent.studentName[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{selectedStudent.studentName}</p>
                          <p className="text-[10px] text-slate-500 font-mono">ID: {selectedStudent.enrollmentId} • {selectedStudent.examId}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 p-5 overflow-y-auto space-y-6">
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">AI Integrity Report</h4>
                        <div className={cn(
                          "p-4 rounded-xl border flex items-center space-x-4",
                          selectedStudent.level === 'High' ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100"
                        )}>
                          <div className={cn(
                            "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
                            selectedStudent.level === 'High' ? "bg-red-200 text-red-600" : "bg-green-200 text-green-600"
                          )}>
                            <ShieldAlert size={20} />
                          </div>
                          <div>
                            <p className={cn("text-lg font-bold font-mono", selectedStudent.level === 'High' ? "text-red-600" : "text-green-600")}>
                              {selectedStudent.risk} Similar
                            </p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase">Suspicion: {selectedStudent.level}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Descriptive Answer (Q3)</h4>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs leading-relaxed text-slate-700 font-medium">
                          "{selectedStudent.content}"
                        </div>
                      </div>

                      {selectedStudent.level === 'High' && (
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Flagged Keywords</h4>
                          <div className="flex flex-wrap gap-2">
                             {['network of networks', 'TCP/IP protocol', 'distributed system'].map(k => (
                               <span key={k} className="bg-red-100 text-red-600 px-2 py-1 rounded text-[9px] font-bold border border-red-200">{k}</span>
                             ))}
                          </div>
                        </div>
                      )}

                      {selectedStudent.violations && selectedStudent.violations.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Security Violation Log</h4>
                          <div className="space-y-2">
                             {selectedStudent.violations.map((v, i) => (
                               <div key={i} className="flex items-start space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-100 italic text-[10px] text-slate-600">
                                 <AlertCircle size={12} className="text-red-500 shrink-0 mt-0.5" />
                                 <span>{v.details}</span>
                               </div>
                             ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-5 border-t border-slate-100 bg-slate-50/30">
                      <div className="grid grid-cols-2 gap-3">
                         <button className="pro-btn-secondary text-xs">Flag as Spam</button>
                         <button className="pro-btn-primary text-xs bg-red-600 hover:bg-red-700">Invalidate Exam</button>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="pro-card flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-100/30 border-dashed">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-300 mb-4 shadow-sm">
                      <ShieldCheck size={32} />
                    </div>
                     <h3 className="font-bold text-slate-400">Select a student</h3>
                     <p className="text-xs text-slate-400 mt-2 max-w-[150px]">Click the view icon to review AI integrity reports</p>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        );
      case 'library':
        return (
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Programs & Exams Library</h3>
                <p className="text-sm text-slate-500">Manage and create examination content</p>
              </div>
              <button 
                onClick={() => setShowExamModal(true)}
                className="pro-btn-primary"
              >
                + Create New Program
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exams.map(exam => (
                <div key={exam.id} className="pro-card p-6 border-slate-200 hover:border-blue-300 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className={cn(
                      "px-2 py-1 rounded text-[10px] font-bold uppercase",
                      exam.status === 'Active' ? 'bg-green-100 text-green-700' :
                      exam.status === 'Draft' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                    )}>
                      {exam.status}
                    </div>
                    <button className="text-slate-400 hover:text-slate-600">
                      <AlertCircle size={16} />
                    </button>
                  </div>
                  <h4 className="font-bold text-slate-800 mb-2">{exam.title}</h4>
                  <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Total Questions:</span>
                      <span className="font-bold text-slate-700">{exam.questions.length}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Submissions:</span>
                      <span className="font-bold text-slate-700">{exam.submissions}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => {
                        setSelectedExamForEdit(exam);
                        setCurrentView('editor');
                      }}
                      className="flex-1 pro-btn-secondary text-xs group-hover:bg-slate-900 group-hover:text-white transition-all"
                    >
                      Edit Questions
                    </button>
                    {exam.status !== 'Active' && (
                      <button 
                        onClick={() => publishExam(exam.id)}
                        className="pro-btn-primary p-2 flex items-center justify-center bg-green-600 hover:bg-green-700" 
                        title="Publish Exam"
                      >
                        <Send size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Exam Modal */}
            <AnimatePresence>
              {showExamModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="pro-card p-8 max-w-lg w-full shadow-2xl"
                  >
                    <h3 className="text-xl font-bold text-slate-800 mb-6">Create New Examination Program</h3>
                    <form onSubmit={onAddExam} className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Program Title</label>
                        <input 
                          type="text" 
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-blue-400 outline-none transition-all"
                          placeholder="e.g. Data Structures Advanced"
                          value={newExamTitle}
                          onChange={e => setNewExamTitle(e.target.value)}
                        />
                      </div>
                      <div className="flex space-x-3 pt-6">
                        <button type="button" onClick={() => setShowExamModal(false)} className="flex-1 pro-btn-secondary">Cancel</button>
                        <button type="submit" className="flex-1 pro-btn-primary">Create Program</button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        );
      case 'editor':
        if (!selectedExamForEdit) return null;
        return (
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="flex items-center space-x-4 mb-8">
              <button 
                onClick={() => setCurrentView('library')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Editing: <span className="text-blue-600">{selectedExamForEdit.title}</span></h3>
                <p className="text-sm text-slate-500">Add, remove, or modify assessment questions</p>
              </div>
              <div className="ml-auto flex space-x-3">
                 {selectedExamForEdit.status !== 'Active' && (
                   <button 
                    onClick={() => publishExam(selectedExamForEdit.id)}
                    className="pro-btn-primary bg-green-600 hover:bg-green-700 flex items-center space-x-2"
                   >
                     <Send size={16} />
                     <span>Publish Now</span>
                   </button>
                 )}
                 <button 
                  onClick={() => setCurrentView('library')}
                  className="pro-btn-secondary"
                 >
                   Return to Library
                 </button>
              </div>
            </div>

            <div className="space-y-6 max-w-4xl">
              {selectedExamForEdit.questions.map((q, qIdx) => (
                <div key={q.id} className="pro-card p-6 border-slate-200">
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-1 rounded">Question {qIdx + 1}</span>
                    <button 
                      onClick={() => onUpdateQuestions(selectedExamForEdit.questions.filter((_, i) => i !== qIdx))}
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Question Text</label>
                      <textarea 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-blue-400 outline-none h-24"
                        value={q.text}
                        onChange={(e) => {
                          const newQs = [...selectedExamForEdit.questions];
                          newQs[qIdx].text = e.target.value;
                          onUpdateQuestions(newQs);
                        }}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Type</label>
                          <select 
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-blue-400 outline-none"
                            value={q.type}
                            onChange={(e) => {
                              const newQs = [...selectedExamForEdit.questions];
                              newQs[qIdx].type = e.target.value as any;
                              if (newQs[qIdx].type === 'mcq') newQs[qIdx].options = ['', '', '', ''];
                              else delete newQs[qIdx].options;
                              onUpdateQuestions(newQs);
                            }}
                          >
                            <option value="mcq">Multiple Choice</option>
                            <option value="descriptive">Long Form / Descriptive</option>
                          </select>
                       </div>
                    </div>

                    {q.type === 'mcq' && q.options && (
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx}>
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Option {oIdx + 1}</label>
                            <div className="flex items-center space-x-2">
                              <input 
                                type="text"
                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:border-blue-400 outline-none"
                                value={opt}
                                onChange={(e) => {
                                  const newQs = [...selectedExamForEdit.questions];
                                  const opts = [...(newQs[qIdx].options || [])];
                                  opts[oIdx] = e.target.value;
                                  newQs[qIdx].options = opts;
                                  onUpdateQuestions(newQs);
                                }}
                              />
                               <input 
                                type="radio" 
                                name={`correct-${q.id}`}
                                checked={q.correctAnswer === opt && opt !== ''}
                                onChange={() => {
                                  const newQs = [...selectedExamForEdit.questions];
                                  newQs[qIdx].correctAnswer = opt;
                                  onUpdateQuestions(newQs);
                                }}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <button 
                onClick={() => {
                  const newQ: Question = {
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'mcq',
                    text: '',
                    options: ['', '', '', ''],
                    correctAnswer: ''
                  };
                  onUpdateQuestions([...selectedExamForEdit.questions, newQ]);
                }}
                className="w-full py-6 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-600 transition-all group"
              >
                <Plus size={24} className="mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-widest">Append New Question</span>
              </button>
            </div>
          </div>
        );
      case 'students':
        return (
          <div className="flex-1 p-8 overflow-y-auto">
             <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Student Profiles</h3>
                <p className="text-sm text-slate-500">Monitor academic performance and integrity history</p>
              </div>
              <div className="flex space-x-3">
                <input type="text" placeholder="Search by Enrollment ID..." className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs outline-none focus:border-blue-400 w-64" />
                <button 
                  onClick={() => setShowStudentModal(true)}
                  className="pro-btn-primary"
                >
                  Add Student
                </button>
              </div>
            </div>
            <div className="pro-card overflow-hidden">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <tr className="border-b border-slate-200">
                      <th className="px-6 py-4">Student ID</th>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Email</th>
                      <th className="px-6 py-4">Exams Taken</th>
                      <th className="px-6 py-4">Avg. Score</th>
                      <th className="px-6 py-4">Avg. Integrity</th>
                      <th className="px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {students.map(student => (
                      <tr key={student.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs font-bold text-blue-600">{student.id}</td>
                        <td className="px-6 py-4 font-bold text-slate-800">{student.name}</td>
                        <td className="px-6 py-4 text-slate-500">{student.email}</td>
                        <td className="px-6 py-4 font-medium">{student.examsTaken}</td>
                        <td className="px-6 py-4 font-bold text-blue-600">{student.avgScore || '0%'}</td>
                        <td className="px-6 py-4">
                           <span className={cn(
                             "px-2 py-0.5 rounded text-[10px] font-black",
                             student.avgIntegrity === 'N/A' ? 'text-slate-400 bg-slate-50' : 
                             parseInt(student.avgIntegrity) > 90 ? 'text-green-600 bg-green-50' : 'text-amber-600 bg-amber-50'
                           )}>
                             {student.avgIntegrity}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-slate-400 hover:text-blue-600 transition-colors">
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>

            {/* Student Modal */}
            <AnimatePresence>
              {showStudentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                  <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="pro-card p-8 max-w-lg w-full shadow-2xl"
                  >
                    <h3 className="text-xl font-bold text-slate-800 mb-6">Register New Student</h3>
                    <form onSubmit={onAddStudent} className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Enrollment ID</label>
                        <input 
                          type="text" 
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-blue-400 outline-none transition-all font-mono"
                          placeholder="e.g. ENR-2026-001"
                          value={newStudent.id}
                          onChange={e => setNewStudent({...newStudent, id: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Full Name</label>
                        <input 
                          type="text" 
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-blue-400 outline-none transition-all"
                          placeholder="John Doe"
                          value={newStudent.name}
                          onChange={e => setNewStudent({...newStudent, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Institutional Email</label>
                        <input 
                          type="email" 
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-blue-400 outline-none transition-all"
                          placeholder="student@viswam.edu"
                          value={newStudent.email}
                          onChange={e => setNewStudent({...newStudent, email: e.target.value})}
                        />
                      </div>
                      <div className="flex space-x-3 pt-6">
                        <button type="button" onClick={() => setShowStudentModal(false)} className="flex-1 pro-btn-secondary">Cancel</button>
                        <button type="submit" className="flex-1 pro-btn-primary">Register Student</button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        );
      case 'logs':
        const allViolations = submissions.flatMap(s => (s.violations || []).map(v => ({ ...v, studentName: s.studentName, enrollmentId: s.enrollmentId, examTitle: s.examTitle })));
        return (
          <div className="flex-1 p-8 overflow-y-auto">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-slate-800">Intrusion & Violation Logs</h3>
              <p className="text-sm text-slate-500">Security audit trail for all examination sessions</p>
            </div>
            
            <div className="pro-card overflow-hidden">
               <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <tr className="border-b border-slate-200">
                      <th className="px-6 py-4">Timestamp</th>
                      <th className="px-6 py-4">Student</th>
                      <th className="px-6 py-4">Program</th>
                      <th className="px-6 py-4">Violation Type</th>
                      <th className="px-6 py-4">Context Details</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {allViolations.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((v, idx) => (
                      <tr key={idx} className="border-b border-slate-50 hover:bg-red-50/30 transition-colors">
                        <td className="px-6 py-4 font-mono text-[10px] text-slate-400">
                          {new Date(v.timestamp).toLocaleTimeString()}
                        </td>
                        <td className="px-6 py-4">
                           <p className="font-bold text-slate-800">{v.studentName}</p>
                           <p className="text-[10px] text-slate-500 uppercase tracking-tight">{v.enrollmentId}</p>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-600">{v.examTitle}</td>
                        <td className="px-6 py-4">
                           <span className={cn(
                             "px-2 py-0.5 rounded text-[9px] font-black uppercase",
                             v.type === 'tab_switch' ? "bg-red-100 text-red-700" :
                             v.type === 'blur' ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"
                           )}>
                             {v.type.replace('_', ' ')}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs italic">"{v.details}"</td>
                      </tr>
                    ))}
                    {allViolations.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                          No security violations recorded in current audit cycle.
                        </td>
                      </tr>
                    )}
                  </tbody>
               </table>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900">
      <aside className="w-64 bg-slate-900 flex flex-col border-r border-slate-800">
        <div className="p-6 flex items-center space-x-3 text-white">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-lg">V</div>
          <span className="font-semibold tracking-tight text-xl">Viswam Pro</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4 text-sm font-medium">
          <NavItem 
            icon={<LayoutDashboard size={18}/>} 
            label="Admin Monitor" 
            active={currentView === 'monitor'} 
            onClick={() => setCurrentView('monitor')} 
          />
          <NavItem 
            icon={<Library size={18}/>} 
            label="Exams Library" 
            active={currentView === 'library'} 
            onClick={() => setCurrentView('library')} 
          />
          <NavItem 
            icon={<Users size={18}/>} 
            label="Students" 
            active={currentView === 'students'} 
            onClick={() => setCurrentView('students')} 
          />
          <NavItem 
            icon={<ShieldAlert size={18}/>} 
            label="Anti-Cheat Logs" 
            active={currentView === 'logs'} 
            onClick={() => setCurrentView('logs')} 
          />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between group">
            <div className="flex items-center space-x-3 text-slate-300">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] uppercase font-bold">
                {user?.[0]}
              </div>
              <div className="max-w-[120px] overflow-hidden">
                <p className="text-xs font-bold truncate">{user || 'Admin'}</p>
                <p className="text-[10px] text-slate-500">Controller</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-8 shadow-sm shrink-0">
          <h2 className="text-lg font-bold text-slate-800 uppercase tracking-tight">
            {currentView === 'monitor' && <>Exam Control: <span className="text-blue-600">Ethics in Computing - B</span></>}
            {currentView === 'library' && "Programs & Exams Library"}
            {currentView === 'editor' && "Content Designer"}
            {currentView === 'students' && "Academic Registry"}
            {currentView === 'logs' && "Intrusion & Violation Logs"}
          </h2>
          <div className="flex items-center space-x-6">
            {currentView === 'monitor' && (
              <>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Time Remaining</span>
                  <span className="text-lg font-mono font-bold text-slate-700">00:28:42</span>
                </div>
                <button className="pro-btn-secondary">End Session</button>
              </>
            )}
          </div>
        </header>

        {renderContent()}
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full flex items-center space-x-3 p-3 rounded-xl transition-all cursor-pointer",
      active ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
    )}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const StatCard = ({ label, value, color = "text-slate-900" }: { label: string, value: string, color?: string }) => (
  <div className="pro-card p-5">
    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className={cn("text-2xl font-bold font-mono tracking-tight", color)}>{value}</p>
  </div>
);
