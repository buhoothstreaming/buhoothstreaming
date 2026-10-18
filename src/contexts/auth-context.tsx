"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';

// Mock user type
interface User {
  name: string;
  email: string;
  avatar?: string;
  country?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (name: string, email: string, pass: string) => Promise<void>;
  signOut: () => void;
  updateAvatar: (avatar: string) => void;
  updateName: (name: string) => void;
  updateCountry: (country: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock check for a logged-in user from localStorage
    try {
      const storedUser = window.localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.warn("localStorage access denied or malformed data in AuthProvider:", error);
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, pass: string) => {
    setLoading(true);
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockUser = { name: "Hamody365", email: email };
    setUser(mockUser);
    try {
      window.localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (e) {}
    setLoading(false);
  };
  
  const signUp = async (name: string, email: string, pass: string) => {
    setLoading(true);
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockUser = { name, email };
    setUser(mockUser);
    try {
      window.localStorage.setItem('user', JSON.stringify(mockUser));
    } catch (e) {}
    setLoading(false);
  };

  const signOut = () => {
    setUser(null);
    try {
      window.localStorage.removeItem('user');
      window.localStorage.removeItem('playlist'); // Also clear playlist on sign out
    } catch (e) {}
  };

  const updateAvatar = (avatar: string) => {
    if (user) {
      const updatedUser = { ...user, avatar };
      setUser(updatedUser);
      try {
        window.localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (e) {}
    }
  };

  const updateName = (name: string) => {
    if (user) {
      const updatedUser = { ...user, name };
      setUser(updatedUser);
      try {
        window.localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (e) {}
    }
  };

  const updateCountry = (country: string) => {
    if (user) {
      const updatedUser = { ...user, country };
      setUser(updatedUser);
      try {
        window.localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (e) {}
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, updateAvatar, updateName, updateCountry }}>
      {children}
    </AuthContext.Provider>
  );
};
