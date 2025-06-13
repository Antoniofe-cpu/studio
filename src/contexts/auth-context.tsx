
'use client';

import type { User, AuthError } from 'firebase/auth';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { auth } from '@/lib/firebase/config';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  type UserCredential
} from 'firebase/auth';
import type { z } from 'zod';
import type { loginSchema, signupSchema } from '@/lib/schemas/auth-schemas'; // We'll create this schema file

type LoginInput = z.infer<typeof loginSchema>;
type SignupInput = z.infer<typeof signupSchema>;

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: (data: LoginInput) => Promise<UserCredential | AuthError>;
  signup: (data: SignupInput) => Promise<UserCredential | AuthError>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async (data: LoginInput) => {
    try {
      return await signInWithEmailAndPassword(auth, data.email, data.password);
    } catch (error) {
      return error as AuthError;
    }
  };

  const signup = async (data: SignupInput) => {
     try {
      return await createUserWithEmailAndPassword(auth, data.email, data.password);
    } catch (error) {
      return error as AuthError;
    }
  };

  const logout = async () => {
    return firebaseSignOut(auth);
  };

  const value = {
    currentUser,
    loading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
