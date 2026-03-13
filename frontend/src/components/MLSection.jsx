import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Database, Cpu, Activity } from 'lucide-react';
import Section from './ui/Section';

const MLSection = () => {
  return (
    <Section 
      id="ml-spec"
      badge="Technical Specification"
      title={<span>How Our <span className="text-gradient">AI Model</span> Analyzes Burnout</span>}
      className="bg-primary/5"
    >
      <div className="flex flex-col lg:flex-row items-center gap-16 md:gap-24">
        <div className="flex-1 space-y-8">
          <p className="text-text-muted text-lg leading-relaxed">
            FacultyMind leverages a **Random Forest Classifier** trained on high-dimensional datasets. By analyzing nonlinear relationships between workload, stress, and institutional support, we provide 89% accuracy in early risk detection.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="intense-glass p-6 rounded-2xl space-y-2">
              <h4 className="font-bold flex items-center gap-2"><Database size={18} className="text-primary" /> Multi-Factor Input</h4>
              <p className="text-text-muted text-sm">18+ scenario parameters mapped to psychological indices.</p>
            </div>
            <div className="intense-glass p-6 rounded-2xl space-y-2">
              <h4 className="font-bold flex items-center gap-2"><Activity size={18} className="text-secondary" /> Dynamic Weighting</h4>
              <p className="text-text-muted text-sm">Weights adjust based on institutional and department norms.</p>
            </div>
          </div>
        </div>

        <div className="flex-1 relative flex justify-center w-full">
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 blur-3xl rounded-full opacity-50"></div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative intense-glass p-12 rounded-[3.5rem] border-primary/20 animate-pulse-glow"
          >
            <Brain size={120} className="text-primary opacity-80" />
            <div className="absolute -top-4 -right-4 bg-secondary p-4 rounded-2xl shadow-2xl animate-float">
              <Activity className="text-white" size={24} />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-accent p-4 rounded-2xl shadow-2xl animate-float" style={{ animationDelay: '1s' }}>
              <Cpu className="text-white" size={24} />
            </div>
          </motion.div>
          
          {/* Mock Analytics UI Overlay */}
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="absolute top-0 left-0 bg-bg-darker/80 border border-glass-border p-5 rounded-2xl translate-x-12 translate-y-12 backdrop-blur-md hidden md:block shadow-2xl"
          >
            <div className="flex gap-2">
              <div className="w-8 h-2 bg-primary rounded-full"></div>
              <div className="w-12 h-2 bg-glass rounded-full"></div>
            </div>
            <div className="mt-4 text-[10px] font-mono text-text-muted tracking-tighter uppercase">Analyzing dataset...</div>
            <div className="mt-1 text-sm font-bold text-white">ACCURACY: 91.4%</div>
          </motion.div>
        </div>
      </div>
    </Section>
  );
};

export default MLSection;
