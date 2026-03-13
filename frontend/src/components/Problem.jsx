import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, FlaskConical, Users, BrainCircuit } from 'lucide-react';
import Section from './ui/Section';

const Problem = () => {
  const problems = [
    {
      icon: <Briefcase className="text-primary" size={28} />,
      title: "Heavy Workload",
      desc: "Endless lectures, lab sessions, and evaluation cycles lead to physical and mental exhaustion."
    },
    {
      icon: <FlaskConical className="text-secondary" size={28} />,
      title: "Research Pressure",
      desc: "The constant demand for publications and student project guidance adds significant cognitive load."
    },
    {
      icon: <Users className="text-accent" size={28} />,
      title: "Administrative Tasks",
      desc: "Non-academic responsibilities and documentation often overshadow core teaching duties."
    },
    {
      icon: <BrainCircuit className="text-primary" size={28} />,
      title: "Mental Stress",
      desc: "Balancing multiple roles causes chronic stress, impacting health and teaching quality."
    }
  ];

  return (
    <Section 
      id="problem" 
      badge="Academic Crisis"
      title={<span>Why Faculty <span className="text-gradient">Burnout Matters</span></span>}
      subtitle="Engineering educators face unique pressures that traditional wellness surveys often fail to capture accurately."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 w-full max-w-none">
        {problems.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1 }}
            className="intense-glass p-8 rounded-[2rem] hover-glow group transition-all duration-300"
          >
            <div className="bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors shadow-inner">
              {item.icon}
            </div>
            <h3 className="text-xl font-bold mb-4 tracking-tight">{item.title}</h3>
            <p className="text-text-muted text-sm leading-relaxed font-medium">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
};

export default Problem;
