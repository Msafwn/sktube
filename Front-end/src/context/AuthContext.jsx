import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Pure In-Memory State: Never store sensitive user or auth data in localStorage
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Initial mount: verify httpOnly session cookie with backend
  useEffect(() => {
    let isMounted = true;

    // Purge everything from localStorage (Zero LocalStorage Policy)
    try {
      localStorage.clear();
    } catch {}

    const verifySession = async () => {
      try {
        const res = await authService.getCurrentUser();
        if (isMounted && res?.data) {
          setUser(res.data);
        }
      } catch (err) {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsAuthLoading(false);
        }
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  // Login: Store user strictly in React in-memory state
  const login = (userData) => {
    setUser(userData);
  };

  // Update profile details in React in-memory state
  const updateUser = (updatedData) => {
    setUser((prev) => (prev ? { ...prev, ...updatedData } : updatedData));
  };

  // Logout: Call backend to clear httpOnly cookies and wipe memory state
  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, updateUser, logout, isAuthLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;


