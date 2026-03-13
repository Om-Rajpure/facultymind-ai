import React from 'react';
import { motion } from 'framer-motion';
import { Brain, ShieldCheck, Zap, LineChart, Layout, Lock } from 'lucide-react';
import Section from './ui/Section';

const Features = () => {
  const list = [
    {
      icon: <Brain className="text-primary" />,
      title: "AI Burnout Prediction",
      desc: "High-precision risk assessment using Random Forest algorithms trained on academic data."
    },
    {
      icon: <Zap className="text-secondary" />,
      title: "Scenario-Based Assessment",
      desc: "Tailored questions that reflect the real-world daily life of engineering faculty members."
    },
    {
      icon: <Layout className="text-accent" />,
      title: "Institution Dashboard",
      desc: "Bird's-eye view for HODs and Principals to monitor departmental wellness trends."
    },
    {
      icon: <LineChart className="text-primary" />,
      title: "Real-Time Visualization",
      desc: "Interactive radar charts and index trackers for immediate feedback and clarity."
    },
    {
      icon: <ShieldCheck className="text-secondary" />,
      title: "Privacy-Focused",
      desc: "Industry-standard encryption ensures faculty responses remain confidential and secure."
    },
    {
      icon: <Lock className="text-accent" />,
      title: "Secure Data Handling",
      desc: "Your data is anonymized and used only for institutional growth or personal wellness."
    }
  ];

  return (
    <Section 
      id="features"
      badge="Core Platform"
      title={<span>Advanced <span className="text-gradient">Platform Features</span></span>}
      subtitle="Built with cutting-edge technology to solve the silent crisis of educator burnout."
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full max-w-none">
        {list.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="intense-glass p-8 rounded-[2rem] border-transparent hover:border-primary/20 transition-all group shadow-lg"
          >
            <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-all group-hover:rotate-6 shadow-inner">
              {React.cloneElement(f.icon, { size: 28 })}
            </div>
            <h3 className="text-xl font-bold mb-4 tracking-tight">{f.title}</h3>
            <p className="text-text-muted text-sm leading-relaxed font-medium">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </Section>
  );
};

export default Features;
