import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Facebook } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAuth = async (provider) => {
    try {
      // In a real app, this would be the result of a Google OAuth flow
      const mockGoogleData = {
        email: "professor.doe@university.edu",
        name: "Professor John Doe",
      };

      const response = await axios.post(`${API_BASE_URL}/accounts/google/login/`, mockGoogleData);
      
      const { user, access, refresh } = response.data;
      login(user, { access, refresh });
      
      // Redirect based on role and workspace status
      if (user.role === 'admin' && !user.workspace) {
        navigate('/create-workspace');
      } else if (user.role === 'teacher' && !user.workspace) {
        navigate('/join-workspace');
      } else if (user.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Authentication failed. Please try again.');
    }
  };

  const GoogleIcon = () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );

  return (
    <section className="min-h-screen pt-24 pb-16 flex items-center">
      <div className="container-1200 items-center">
        <div className="flex flex-col lg:flex-row items-center gap-16 md:gap-24">
          {/* Left: Login Card */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 w-full max-w-md"
          >
            <div className="glass-card p-10 md:p-12 space-y-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="text-center space-y-2 relative">
                <h1 className="text-3xl font-extrabold text-white">Sign in to FacultyMind</h1>
                <p className="text-text-muted">Secure access to your faculty wellness dashboard</p>
              </div>

              <div className="space-y-4 relative">
                <button 
                  onClick={() => handleAuth('Google')}
                  className="w-full btn-primary justify-center py-4 bg-white text-bg-dark hover:bg-slate-100 hover-glow"
                >
                  <GoogleIcon />
                  Continue with Google
                </button>
                
                <button 
                  onClick={() => handleAuth('Facebook')}
                  className="w-full btn-secondary justify-center py-4 hover-glow"
                >
                  <Facebook size={20} className="text-[#1877F2]" />
                  Continue with Facebook
                </button>
              </div>

              <p className="text-center text-xs text-text-muted pt-4 relative">
                By signing in you agree to our <span className="text-primary hover:underline cursor-pointer">privacy policy</span>.
              </p>
            </div>
          </motion.div>

          {/* Right: Illustration */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 hero-image-container hidden lg:flex"
          >
            <div className="relative p-4 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl animate-floating">
              <img 
                src="/ai-teacher-hero.png" 
                alt="FacultyMind Auth" 
                className="max-w-[450px] w-full rounded-[20px]"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Login;
