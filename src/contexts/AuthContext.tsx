
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
});

// Mock users for development
const mockUsers: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@observerai.com', role: 'admin' },
  { id: '2', name: 'Observer User', email: 'observer@observerai.com', role: 'observer' },
  { id: '3', name: 'Parent User', email: 'parent@observerai.com', role: 'parent' },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // For development, we're using mock authentication
    const foundUser = mockUsers.find(u => u.email === email);
    
    if (!foundUser) {
      throw new Error('Invalid email or password');
    }
    
    // In a real app, we would verify the password here
    // For now, we'll just accept any non-empty password
    if (!password) {
      throw new Error('Password is required');
    }
    
    setUser(foundUser);
    localStorage.setItem('user', JSON.stringify(foundUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
