import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, useAuth as useClerkAuth } from "@clerk/react";
import api, { setClerkTokenGetter } from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { isLoaded: isClerkLoaded, user: clerkUser, isSignedIn } = useUser();
  const { getToken } = useClerkAuth();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Wire Clerk's getToken into the axios interceptor so EVERY
  // request automatically gets a fresh token (no caching).
  useEffect(() => {
    if (getToken) {
      setClerkTokenGetter(getToken);
      console.log("[AuthContext] Clerk getToken wired into axios interceptor");
    }
  }, [getToken]);

  // Sync with backend when Clerk user is loaded and signed in
  useEffect(() => {
    const syncWithBackend = async () => {
      console.log("[AuthContext] isClerkLoaded:", isClerkLoaded);
      console.log("[AuthContext] isSignedIn:", isSignedIn);

      if (isClerkLoaded && isSignedIn && clerkUser) {
        try {
          setLoading(true);
          console.log("[AuthContext] Syncing with backend...");

          // Fetch a fresh Clerk token with skipCache: true
          const freshToken = await getToken({ skipCache: true });
          
          if (!freshToken) {
            console.error("[AuthContext] No Clerk token available — cannot sync");
            setLoading(false);
            return;
          }
          
          console.log("[AuthContext] Fresh Clerk token obtained, length:", freshToken.length);

          // The interceptor will also attach a fresh token, but we pass
          // one explicitly here as a safety measure for the sync call.
          const response = await api.post("/api/accounts/sync-user/", {
            clerk_id: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress,
            name: clerkUser.fullName || clerkUser.username || '',
          }, {
            headers: {
              Authorization: `Bearer ${freshToken}`,
            },
          });

          console.log("[AuthContext] Backend sync response:", response.data);
          const { user: backendUser } = response.data;
          
          if (backendUser) {
            console.log("[AuthContext] Backend user synced:", backendUser);
            setUser(backendUser);
          } else {
            console.error("[AuthContext] No user data in backend response");
          }
        } catch (error) {
          console.error("[AuthContext] Backend sync failed:", error);
        } finally {
          setLoading(false);
          console.log("[AuthContext] Loading set to false");
        }
      } else if (isClerkLoaded && !isSignedIn) {
        console.log("[AuthContext] User not signed in, clearing state");
        setUser(null);
        setLoading(false);
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
    <AuthContext.Provider value={{ user, loading, setUser, updateProfile, setWorkspace }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
