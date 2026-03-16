import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CTA = () => {
  const navigate = useNavigate();
  return (
    <section className="py-20 md:py-32">
      <div className="container-custom">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="intense-glass p-12 md:p-24 rounded-[4rem] relative overflow-hidden text-center space-y-10"
        >
          {/* Animated Glows */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-secondary/20 blur-[100px] rounded-full translate-x-1/2 translate-y-1/2"></div>
          
          <div className="absolute top-10 right-10 opacity-10 hidden md:block">
            <Sparkles size={160} className="text-primary rotate-12" />
          </div>

          <h2 className="text-4xl md:text-6xl font-black relative z-10 leading-[1.1]">
            Start Your Faculty <br /><span className="text-gradient">Burnout Assessment</span> Today
          </h2>
          <p className="text-text-muted text-lg md:text-xl max-w-2xl mx-auto relative z-10 leading-relaxed font-medium">
            Join hundreds of engineering educators who are prioritizing their mental wellness with data-driven insights.
          </p>
          
          <div className="pt-6 relative z-10">
            <button 
              onClick={() => navigate("/assessment")}
              className="btn-primary text-xl px-12 py-6 rounded-[2rem] shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 group"
            >
              Start Your Assessment <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          
          <div className="flex justify-center items-center gap-6 relative z-10 pt-4">
            <span className="text-text-muted text-xs font-bold tracking-widest uppercase opacity-60 italic">Free for educators</span>
            <div className="w-1 h-1 rounded-full bg-glass-border"></div>
            <span className="text-text-muted text-xs font-bold tracking-widest uppercase opacity-60 italic">Completely Anonymous</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
