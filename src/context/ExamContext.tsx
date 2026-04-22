import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Question {
  id: string;
  type: 'mcq' | 'descriptive';
  text: string;
  options?: string[];
  correctAnswer: string;
}

export interface Exam {
  id: string;
  title: string;
  questions: Question[];
  status: 'Active' | 'Draft' | 'Archived';
  submissions: number;
}

interface ExamContextType {
  exams: Exam[];
  updateExam: (exam: Exam) => void;
  addExam: (title: string) => void;
  publishExam: (id: string) => void;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

const INITIAL_DATA: Exam[] = [
  { 
    id: '1', 
    title: 'Ethics in Computing - B', 
    status: 'Active',
    submissions: 42,
    questions: [
      { id: 'q1', type: 'mcq', text: 'Which of the following is an example of an Ethical Computer Use policy?', options: ['Allowing illegal data mining', 'Requiring users to give up their password', 'Prohibiting cyberbullying', 'Sharing public data without consent'], correctAnswer: 'Prohibiting cyberbullying' },
      { id: 'q2', type: 'descriptive', text: 'Explain the importance of Digital Sovereignty in the modern age.', correctAnswer: '' }
    ]
  },
  { 
    id: '2', 
    title: 'Network Security Fundamentals', 
    status: 'Archived',
    submissions: 128,
    questions: []
  },
  { 
    id: '3', 
    title: 'Database Systems Midterm', 
    status: 'Draft',
    submissions: 0,
    questions: []
  },
];

export const ExamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem('viswam_exams');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  useEffect(() => {
    localStorage.setItem('viswam_exams', JSON.stringify(exams));
  }, [exams]);

  const updateExam = (updated: Exam) => {
    setExams(prev => prev.map(e => e.id === updated.id ? updated : e));
  };

  const addExam = (title: string) => {
    const newExam: Exam = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      questions: [],
      submissions: 0,
      status: 'Draft'
    };
    setExams([...exams, newExam]);
  };

  const publishExam = (id: string) => {
    setExams(prev => prev.map(e => e.id === id ? { ...e, status: 'Active' } : e));
  };

  return (
    <ExamContext.Provider value={{ exams, updateExam, addExam, publishExam }}>
      {children}
    </ExamContext.Provider>
  );
};

export const useExams = () => {
  const context = useContext(ExamContext);
  if (!context) throw new Error('useExams must be used within ExamProvider');
  return context;
};
