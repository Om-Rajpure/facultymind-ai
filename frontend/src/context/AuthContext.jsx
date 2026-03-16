import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useAuth as useClerkAuth } from "@clerk/react";
import axios from 'axios';

const AuthContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const AuthProvider = ({ children }) => {
  const { isLoaded: isClerkLoaded, user: clerkUser, isSignedIn } = useUser();
  const { getToken } = useClerkAuth();
  
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync with backend when Clerk user is loaded and signed in
  useEffect(() => {
    const syncWithBackend = async () => {
      if (isClerkLoaded && isSignedIn && clerkUser) {
        try {
          setLoading(true);
          const response = await axios.post(`${API_BASE_URL}/accounts/sync-user/`, {
            clerk_id: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress,
            name: clerkUser.fullName || clerkUser.username || '',
          });

          const { user: backendUser, access, refresh } = response.data;
          setUser(backendUser);
          setTokens({ access, refresh });
          
          // Store tokens in localStorage for axios interceptors if needed
          localStorage.setItem('facultymind_access', access);
          localStorage.setItem('facultymind_refresh', refresh);
        } catch (error) {
          console.error('Backend sync failed:', error);
        } finally {
          setLoading(false);
        }
      } else if (isClerkLoaded && !isSignedIn) {
        setUser(null);
        setTokens(null);
        setLoading(false);
        localStorage.removeItem('facultymind_access');
        localStorage.removeItem('facultymind_refresh');
      }
    };

    syncWithBackend();
  }, [isClerkLoaded, isSignedIn, clerkUser]);

  const updateProfile = (data) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  const setWorkspace = (workspace) => {
    setUser(prev => prev ? { ...prev, workspace } : null);
  };

  return (
    <AuthContext.Provider value={{ user, tokens, loading, setUser, updateProfile, setWorkspace }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
