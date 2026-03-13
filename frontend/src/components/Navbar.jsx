import React from 'react';
import { Brain, LayoutDashboard, ClipboardList, User } from 'lucide-react';

const Navbar = ({ setView }) => {
  return (
    <nav className="fixed top-0 left-0 w-full z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center glass-card px-8 py-3">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => setView('landing')}
        >
          <div className="bg-primary p-2 rounded-lg group-hover:scale-110 transition-transform">
            <Brain className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight">Faculty<span className="text-secondary">Mind</span></span>
        </div>
        
        <div className="flex items-center gap-8">
          <button onClick={() => setView('landing')} className="text-text-muted hover:text-white transition-colors">Home</button>
          <a href="#features" className="text-text-muted hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="text-text-muted hover:text-white transition-colors">How It Works</a>
          <button onClick={() => setView('assessment')} className="text-text-muted hover:text-white transition-colors">Assessment</button>
          
          <div className="flex items-center gap-4 ml-4">
            <button className="text-white font-medium hover:text-primary transition-colors">Login</button>
            <button onClick={() => setView('assessment')} className="btn-primary">
              Get Started
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
