import React from 'react';
import { motion } from 'framer-motion';
import { UserCheck, MessageSquareText, Cpu, BarChart3 } from 'lucide-react';
import Section from './ui/Section';

const HowItWorks = () => {
  const steps = [
    {
      icon: <UserCheck className="text-primary" />,
      title: "Secure Login",
      desc: "Fast authentication via Google or Facebook with academic profile setup."
    },
    {
      icon: <MessageSquareText className="text-secondary" />,
      title: "Scenario Assessment",
      desc: "Respond to 18 specific engineering faculty scenarios in a multi-step form."
    },
    {
      icon: <Cpu className="text-primary" />,
      title: "AI Model Analysis",
      desc: "Our Random Forest model processes your inputs against historical datasets."
    },
    {
      icon: <BarChart3 className="text-secondary" />,
      title: "Insights Dashboard",
      desc: "Receive your Burnout Index, radar factor analysis, and suggestions."
    }
  ];

  return (
    <Section 
      id="how-it-works"
      badge="Process"
      title={<span>How It <span className="text-gradient">Works</span></span>}
      subtitle="A seamless four-step process powered by advanced machine learning."
    >
      <div className="relative pt-10">
        <div className="timeline-line hidden lg:block opacity-20"></div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-16 lg:gap-8 w-full max-w-none">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.15 }}
              className="flex flex-col items-center text-center space-y-6 relative z-10 group"
            >
              <div className="w-24 h-24 rounded-[2.5rem] bg-bg-darker border border-white/10 flex items-center justify-center text-2xl group-hover:border-primary/50 group-hover:scale-110 transition-all duration-500 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-10 transition-opacity"></div>
                {React.cloneElement(step.icon, { size: 40, className: "group-hover:rotate-12 transition-transform duration-500" })}
              </div>
              <div className="space-y-4">
                <div className="text-primary font-black text-[10px] md:text-xs tracking-[0.3em] uppercase opacity-60 leading-none">Step 0{idx + 1}</div>
                <h3 className="text-xl md:text-2xl font-black text-white">{step.title}</h3>
                <p className="text-text-muted text-sm md:text-base px-4 leading-relaxed font-medium">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
};

export default HowItWorks;
