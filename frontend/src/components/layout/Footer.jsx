import React from 'react';
import { Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaInstagram, FaYoutube } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="mt-24 pt-16 pb-10 border-t border-white/10 glass-card !rounded-none !border-x-0 !border-b-0">
      <div className="container-1200 mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16 items-start">
          {/* Column 1: Logo & Description */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="bg-primary/20 p-2 rounded-xl">
                <Brain className="text-primary w-6 h-6" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">Faculty<span className="text-primary">Mind</span></span>
            </div>
            <p className="text-text-muted text-sm leading-relaxed max-w-xs">
              AI-powered mental wellness platform designed specifically for engineering faculty. Early detection for academic sustainability.
            </p>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-white font-bold text-lg mb-2">Quick Links</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <a href="#home" className="block text-text-muted hover:text-primary transition-colors text-sm font-medium">Home</a>
                <a href="#features" className="block text-text-muted hover:text-primary transition-colors text-sm font-medium">Features</a>
                <a href="#how-it-works" className="block text-text-muted hover:text-primary transition-colors text-sm font-medium">How It Works</a>
              </div>
              <div className="space-y-3">
                <Link to="/login" className="block text-text-muted hover:text-primary transition-colors text-sm font-medium">Login</Link>
                <Link to="/signup" className="block text-text-muted hover:text-primary transition-colors text-sm font-medium">Signup</Link>
                <Link to="/assessment" className="block text-text-muted hover:text-primary transition-colors text-sm font-medium">Assessment</Link>
              </div>
            </div>
          </div>

          {/* Column 3: Social Media Icons */}
          <div className="space-y-6 md:text-right">
            <h4 className="text-white font-bold text-lg mb-2">Connect With Us</h4>
            <div className="flex items-center gap-6 md:justify-end">
              <a href="https://github.com/Om-Rajpure" target="_blank" rel="noopener noreferrer" className="text-2xl text-white hover:text-primary transition-all duration-300 hover:scale-110">
                <FaGithub />
              </a>
              <a href="https://www.linkedin.com/in/om-rajpure" target="_blank" rel="noopener noreferrer" className="text-2xl text-white hover:text-primary transition-all duration-300 hover:scale-110">
                <FaLinkedin />
              </a>
              <a href="https://www.instagram.com/conceptsin5" target="_blank" rel="noopener noreferrer" className="text-2xl text-white hover:text-primary transition-all duration-300 hover:scale-110">
                <FaInstagram />
              </a>
              <a href="https://www.youtube.com/@conceptsin5" target="_blank" rel="noopener noreferrer" className="text-2xl text-white hover:text-primary transition-all duration-300 hover:scale-110">
                <FaYoutube />
              </a>
            </div>
            <p className="text-text-muted text-xs">
              Stay updated with our latest wellness insights and platform features.
            </p>
          </div>
        </div>

        {/* Bottom Bar: Copyright */}
        <div className="pt-8 border-t border-white/5 text-center">
          <p className="text-text-muted text-sm">
            © 2026 FacultyMind AI. Built with ❤️ by Om Rajpure.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
