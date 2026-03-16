import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Menu, X, ArrowRight, User } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { UserButton, SignInButton, SignUpButton } from "@clerk/react";
import { useAuth } from '../../context/AuthContext.jsx';
import Show from '../auth/Show.jsx';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = user 
    ? (user.role === 'admin'
        ? [
            { name: 'Dashboard', path: '/admin-dashboard' },
            { name: 'Analytics', path: '/admin-analytics' },
            { name: 'Faculty', path: '/admin-faculty' },
          ]
        : [
            { name: 'Dashboard', path: '/dashboard' },
            { name: 'FacultyMind AI', path: '/chatbot' },
            { name: 'Assessment', path: '/assessment' },
          ]
      )
    : [
        { name: 'Home', path: '#home' },
        { name: 'Features', path: '#features' },
        { name: 'How It Works', path: '#how-it-works' },
      ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 glass-navbar transition-all duration-300 ${isScrolled ? 'backdrop-blur-2xl bg-bg-dark/80' : 'bg-transparent'}`}>
      <div className="container-1200 h-full flex items-center justify-between px-6 sm:px-8 lg:px-12">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="bg-primary/20 p-2 rounded-xl group-hover:rotate-12 transition-transform border border-primary/20">
            <Brain className="text-primary w-6 h-6" />
          </div>
          <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-white">Faculty<span className="text-primary">Mind</span></span>
        </Link>

        {/* Center: Desktop Links */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          {user?.role === 'admin' ? (
            <span className="text-white font-extrabold text-lg tracking-tight">FacultyMind <span className="text-secondary text-base">Admin</span></span>
          ) : (
            <div className="flex items-center space-x-8">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.path}
                  className="text-text-muted hover:text-white font-semibold text-sm transition-all hover:scale-105 relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Right: Buttons */}
        <div className="hidden lg:flex items-center gap-4 xl:gap-6">
          <div className="flex items-center gap-4 xl:gap-6">
            <Show when="signed-in">
              <div className="flex items-center gap-4">
                <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                  <span className="text-xs font-bold text-white">{user?.first_name || user?.username || "Faculty User"}</span>
                </div>
                <UserButton afterSignOutUrl="/" />
              </div>
            </Show>
            <Show when="signed-out">
              <div className="flex items-center gap-4">
                <SignInButton mode="modal">
                  <button className="text-text-muted hover:text-white font-semibold text-sm transition-colors border-none bg-transparent cursor-pointer">
                    Login
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="btn-primary">
                    Get Started
                  </button>
                </SignUpButton>
              </div>
            </Show>
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="flex lg:hidden items-center gap-4">
          <Show when="signed-in">
             <div className="flex items-center gap-2">
                <UserButton afterSignOutUrl="/" />
             </div>
          </Show>
          <button 
            className="p-2 text-white bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute top-[var(--nav-height)] left-0 w-full bg-bg-dark/95 backdrop-blur-3xl z-40 p-6 border-b border-white/10"
          >
            <div className="flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-xl font-bold text-white hover:text-primary transition-colors flex items-center justify-between"
                >
                  {link.name}
                  <ArrowRight size={18} className="text-primary/50" />
                </Link>
              ))}
              <div className="h-px bg-white/10 w-full" />
              <Show when="signed-in">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10">
                    <User size={20} className="text-primary" />
                    <span className="font-bold text-white">{user?.first_name || user?.username}</span>
                  </div>
                  <UserButton afterSignOutUrl="/" showName />
                </div>
              </Show>
              <Show when="signed-out">
                <div className="grid grid-cols-2 gap-4">
                  <SignInButton mode="modal">
                    <button className="btn-secondary justify-center text-sm">
                      Login
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="btn-primary justify-center text-sm">
                      Get Started
                    </button>
                  </SignUpButton>
                </div>
              </Show>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
