import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Submission {
  id: string;
  studentName: string;
  enrollmentId: string;
  examId: string;
  examTitle: string;
  progress: number;
  state: 'FOCUSED' | 'WARNING' | 'UNFOCUSED';
  risk: string;
  level: 'Low' | 'Medium' | 'High';
  content: string; // The descriptive answer or a summary
  timestamp: string;
  violationsCount: number;
  violations?: {
    type: string;
    details: string;
    timestamp: string;
  }[];
}

export interface Student {
  id: string; // Enrollment ID
  name: string;
  email: string;
  examsTaken: number;
  avgIntegrity: string;
}

interface StudentContextType {
  students: Student[];
  submissions: Submission[];
  addStudent: (student: Student) => void;
  addSubmission: (submission: Submission) => void;
  updateSubmission: (submission: Submission) => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export const StudentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('viswam_students');
    return saved ? JSON.parse(saved) : [];
  });

  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const saved = localStorage.getItem('viswam_submissions');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('viswam_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('viswam_submissions', JSON.stringify(submissions));
  }, [submissions]);

  const addStudent = (student: Student) => {
    setStudents(prev => {
      // Avoid duplicates by ID
      if (prev.find(s => s.id === student.id)) return prev;
      return [...prev, student];
    });
  };

  const addSubmission = (submission: Submission) => {
    setSubmissions(prev => [...prev, submission]);
    
    // Update student stats
    setStudents(prev => prev.map(s => {
      if (s.id === submission.enrollmentId) {
        const newExamsTaken = s.examsTaken + 1;
        // Simple logic for avg integrity update
        return { ...s, examsTaken: newExamsTaken };
      }
      return s;
    }));
  };

  const updateSubmission = (updated: Submission) => {
    setSubmissions(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  return (
    <StudentContext.Provider value={{ students, submissions, addStudent, addSubmission, updateSubmission }}>
      {children}
    </StudentContext.Provider>
  );
};

export const useStudents = () => {
  const context = useContext(StudentContext);
  if (!context) throw new Error('useStudents must be used within StudentProvider');
  return context;
};
