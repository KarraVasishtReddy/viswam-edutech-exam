import React, { createContext, useContext, useState, ReactNode } from 'react';

type Role = 'student' | 'admin' | null;

interface AuthContextType {
  role: Role;
  user: string | null;
  login: (role: Role, identifier: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>(() => localStorage.getItem('userRole') as Role);
  const [user, setUser] = useState<string | null>(() => localStorage.getItem('userId'));

  const login = (newRole: Role, identifier: string) => {
    setRole(newRole);
    setUser(identifier);
    localStorage.setItem('userRole', newRole || '');
    localStorage.setItem('userId', identifier);
  };

  const logout = () => {
    setRole(null);
    setUser(null);
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
  };

  return (
    <AuthContext.Provider value={{ role, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
