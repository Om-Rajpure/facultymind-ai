import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, ShieldCheck, Activity, Brain } from 'lucide-react';

const Hero = ({ onStart }) => {
  const stats = [
    { 
      title: '18 Targeted Questions', 
      subtitle: 'Scientifically designed assessment',
      icon: <Activity className="text-primary" size={24} /> 
    },
    { 
      title: 'ML-Powered Prediction', 
      subtitle: 'Random Forest AI model',
      icon: <Brain className="text-secondary" size={24} /> 
    },
    { 
      title: 'Real-time Analysis', 
      subtitle: 'Instant burnout scoring',
      icon: <ShieldCheck className="text-accent" size={24} /> 
    },
  ];

  return (
    <section id="home" className="hero-padding overflow-hidden flex items-center min-h-[90vh]">
      <div className="container-1200 items-center">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Left Side: Text Content */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex-1 text-center lg:text-left space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold tracking-wide">
              <Sparkles size={16} /> AI-Powered Early Detection
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.1]">
              AI-Powered Early <br className="hidden sm:block" /> Detection for <br className="hidden sm:block" />
              <span className="text-gradient">Engineering Faculty Burnout</span>
            </h1>

            <p className="text-text-muted text-base sm:text-lg lg:text-xl max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Our machine learning platform analyzes academic workload, stress levels, and work-life balance to detect burnout risks early and provide actionable insights.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <button 
                onClick={onStart}
                className="btn-primary hover-glow w-full sm:w-auto"
              >
                Start Your Assessment <ArrowRight size={20} />
              </button>
              <button className="btn-secondary w-full sm:w-auto">
                Learn More
              </button>
            </div>

            {/* Hero Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-10">
              {stats.map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + (i * 0.1) }}
                  className="hero-stats-card group"
                >
                  <div className="mb-2 transition-transform group-hover:scale-110">
                    {stat.icon}
                  </div>
                  <h4 className="text-sm font-bold text-white">{stat.title}</h4>
                  <p className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
                    {stat.subtitle}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Side: Illustration */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex-1 hero-image-container"
          >
            <div className="relative group p-4 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl animate-floating">
              <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2.5rem]"></div>
              <img 
                src="/ai-teacher-hero.png" 
                alt="FacultyMind AI Analysis" 
                className="max-w-[500px] w-full h-auto rounded-[20px] shadow-inner"
              />
              
              {/* Floating Indicator */}
              <div className="absolute -top-6 -right-6 bg-bg-dark border border-white/10 p-4 rounded-2xl shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                  <span className="text-xs font-bold font-mono tracking-tight text-accent">STRESS DETECTED</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
