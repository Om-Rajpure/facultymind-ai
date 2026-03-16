import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AuthRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (!user.role) {
        navigate('/select-role');
      } else if (user.role === 'admin') {
        if (!user.workspace) {
          navigate('/create-workspace');
        } else {
          navigate('/admin-dashboard');
        }
      } else if (user.role === 'teacher') {
        if (!user.workspace) {
          navigate('/join-workspace');
        } else {
          navigate('/dashboard');
        }
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="text-text-muted animate-pulse">Redirecting you...</p>
      </div>
    );
  }

  return null;
};

export default AuthRedirect;
