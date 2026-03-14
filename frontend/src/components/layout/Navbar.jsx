import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Menu, X, ArrowRight, LayoutDashboard, ClipboardList, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = user 
    ? [
        { name: 'Dashboard', path: '/dashboard' },
        { name: 'FacultyMind AI', path: '/chatbot' },
        { name: 'Assessment', path: '/assessment' },
      ]
    : [
        { name: 'Home', path: '/' },
        { name: 'Features', path: '/#features' },
        { name: 'How It Works', path: '/#how-it-works' },
      ];

  const handleAuthAction = () => {
    if (user) {
      logout();
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 glass-navbar transition-all duration-300 ${isScrolled ? 'backdrop-blur-2xl bg-bg-dark/80' : 'bg-transparent'}`}>
      <div className="container-1200 h-full flex items-center justify-between">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="bg-primary/20 p-2 rounded-xl group-hover:rotate-12 transition-transform border border-primary/20">
            <Brain className="text-primary w-6 h-6" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white">Faculty<span className="text-primary">Mind</span></span>
        </Link>

        {/* Center: Desktop Links */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name}
              to={link.path}
              className="text-text-muted hover:text-white font-semibold text-sm transition-all hover:scale-105 relative group"
            >
              {link.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
            </Link>
          ))}
        </div>

        {/* Right: Buttons */}
        <div className="hidden lg:flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                {user.profilePicture ? (
                  <img src={user.profilePicture} alt={user.name} className="w-6 h-6 rounded-full" />
                ) : (
                  <User size={16} className="text-primary" />
                )}
                <span className="text-xs font-bold text-white">{user.name}</span>
              </div>
              <button 
                onClick={handleAuthAction}
                className="text-text-muted hover:text-white font-semibold text-sm transition-colors border-none bg-transparent cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <button 
                onClick={() => navigate('/login')}
                className="text-text-muted hover:text-white font-semibold text-sm transition-colors border-none bg-transparent cursor-pointer"
              >
                Login
              </button>
              <button 
                onClick={() => navigate('/login')} 
                className="btn-primary"
              >
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="lg:hidden p-2 text-white bg-white/5 rounded-xl border border-white/10"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="lg:hidden fixed inset-0 bg-bg-dark/98 backdrop-blur-2xl z-40 p-8 pt-24"
          >
            <div className="flex flex-col gap-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-4xl font-bold text-white hover:text-primary transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              <div className="h-px bg-white/10 w-full" />
              {user ? (
                <button 
                  onClick={() => { logout(); navigate('/'); setIsMenuOpen(false); }}
                  className="w-full text-left font-bold text-2xl text-text-muted"
                >
                  Logout
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => { navigate('/login'); setIsMenuOpen(false); }}
                    className="w-full text-left font-bold text-2xl text-text-muted"
                  >
                    Login
                  </button>
                  <button 
                    onClick={() => { navigate('/login'); setIsMenuOpen(false); }}
                    className="btn-primary w-full justify-center text-xl py-4"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
