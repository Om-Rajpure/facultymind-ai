import React from 'react';
import { Brain, Twitter, Github, Linkedin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="pt-24 pb-12 border-t border-glass-border">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="md:col-span-1 space-y-6">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <Brain className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl">Faculty<span className="text-secondary">Mind</span></span>
          </div>
          <p className="text-text-muted text-sm leading-relaxed">
            AI-powered mental wellness platform designed specifically for engineering faculty. Early detection for academic sustainability.
          </p>
          <div className="flex gap-4">
            <a href="#" className="p-2 glass-card rounded-lg text-text-muted hover:text-primary transition-colors"><Twitter size={18} /></a>
            <a href="#" className="p-2 glass-card rounded-lg text-text-muted hover:text-primary transition-colors"><Linkedin size={18} /></a>
            <a href="#" className="p-2 glass-card rounded-lg text-text-muted hover:text-primary transition-colors"><Github size={18} /></a>
          </div>
        </div>

        <div>
          <h4 className="font-bold mb-6">Platform</h4>
          <ul className="space-y-4 text-text-muted text-sm">
            <li><Link to="/assessment" className="hover:text-white transition-colors">Assessment</Link></li>
            <li><Link to="/admin-dashboard" className="hover:text-white transition-colors">Admin Dashboard</Link></li>
            <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-white transition-colors">Term of Service</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6">Resources</h4>
          <ul className="space-y-4 text-text-muted text-sm">
            <li><Link to="/whitepaper" className="hover:text-white transition-colors">ML Whitepaper</Link></li>
            <li><Link to="/accreditation" className="hover:text-white transition-colors">Accreditation Info</Link></li>
            <li><Link to="/tips" className="hover:text-white transition-colors">Mental Health Tips</Link></li>
            <li><Link to="/support" className="hover:text-white transition-colors">Institution Support</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6">Contact</h4>
          <ul className="space-y-4 text-text-muted text-sm">
            <li className="flex items-center gap-2"><Mail size={16} /> support@facultymind.io</li>
            <li>Bengaluru, India</li>
            <li className="mt-6 border border-glass-border p-4 rounded-xl text-[10px] font-mono leading-tight">
              FacultyMind v1.0.4<br />
              Status: <span className="text-green-400">System Functional</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div className="text-center pt-12 border-t border-glass-border">
        <p className="text-text-muted text-xs">
          © 2026 FacultyMind. Built with advanced AI for the academic community.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
