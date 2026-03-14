import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('facultymind_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [tokens, setTokens] = useState(() => {
    const access = localStorage.getItem('facultymind_access');
    const refresh = localStorage.getItem('facultymind_refresh');
    return access ? { access, refresh } : null;
  });
  const [loading, setLoading] = useState(false);

  const login = (userData, authTokens) => {
    setUser(userData);
    setTokens(authTokens);
    localStorage.setItem('facultymind_user', JSON.stringify(userData));
    localStorage.setItem('facultymind_access', authTokens.access);
    localStorage.setItem('facultymind_refresh', authTokens.refresh);
  };

  const logout = () => {
    setUser(null);
    setTokens(null);
    localStorage.removeItem('facultymind_user');
    localStorage.removeItem('facultymind_access');
    localStorage.removeItem('facultymind_refresh');
  };

  const updateProfile = (profileData) => {
    const updatedUser = { ...user, ...profileData };
    setUser(updatedUser);
    localStorage.setItem('facultymind_user', JSON.stringify(updatedUser));
  };

  const setWorkspace = (workspaceData) => {
    const updatedUser = { ...user, workspace: workspaceData.id, workspace_name: workspaceData.name };
    setUser(updatedUser);
    localStorage.setItem('facultymind_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, tokens, login, logout, updateProfile, setWorkspace, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
