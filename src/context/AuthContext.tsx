import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (firstName: string, lastName: string, email: string, password: string) => Promise<boolean>;
  signOut: () => void;
  validateSecretCode: (code: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('metaking-user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });
      } catch {
        localStorage.removeItem('metaking-user');
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const validateSecretCode = (code: string): boolean => {
    return code === 'ZUBORAJ';
  };

  const signUp = async (firstName: string, lastName: string, email: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('metaking-users') || '[]');
      const userExists = existingUsers.some((user: any) => user.email === email);
      
      if (userExists) {
        return false;
      }

      // Create new user
      const newUser: User = {
        id: crypto.randomUUID(),
        email,
        firstName,
        lastName,
        createdAt: new Date().toISOString()
      };

      // Store user credentials (in production, this would be handled by a backend)
      const userWithPassword = { ...newUser, password: btoa(password) }; // Simple encoding for demo
      existingUsers.push(userWithPassword);
      localStorage.setItem('metaking-users', JSON.stringify(existingUsers));

      // Set current user
      setAuthState({
        user: newUser,
        isAuthenticated: true,
        isLoading: false
      });

      localStorage.setItem('metaking-user', JSON.stringify(newUser));
      return true;
    } catch {
      return false;
    }
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const existingUsers = JSON.parse(localStorage.getItem('metaking-users') || '[]');
      const user = existingUsers.find((u: any) => u.email === email && atob(u.password) === password);

      if (user) {
        const { password: _, ...userWithoutPassword } = user;
        setAuthState({
          user: userWithoutPassword,
          isAuthenticated: true,
          isLoading: false
        });

        localStorage.setItem('metaking-user', JSON.stringify(userWithoutPassword));
        return true;
      }

      return false;
    } catch {
      return false;
    }
  };

  const signOut = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
    localStorage.removeItem('metaking-user');
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      signIn,
      signUp,
      signOut,
      validateSecretCode
    }}>
      {children}
    </AuthContext.Provider>
  );
};