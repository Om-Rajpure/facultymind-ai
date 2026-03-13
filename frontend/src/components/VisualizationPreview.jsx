import React from 'react';
import { motion } from 'framer-motion';
import RadarChart from './RadarChart';
import Section from './ui/Section';

const VisualizationPreview = () => {
  const mockValues = [4.2, 4.5, 2.1, 1.8, 3.2, 2.5];

  return (
    <Section
      id="visualization"
      badge="Real-time Insights"
      title={<span>Visualizing the <br /><span className="text-gradient">Silent Stressors</span></span>}
    >
      <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24 w-full">
        <div className="flex-1 order-2 lg:order-1 relative w-full flex justify-center">
          <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full animate-pulse-glow"></div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative intense-glass p-8 md:p-12 rounded-[3.5rem] border-white/5 shadow-2xl flex flex-col items-center w-full max-w-xl"
          >
            <h4 className="font-extrabold mb-8 text-[10px] md:text-xs text-text-muted uppercase tracking-[0.3em] opacity-60">Factor Analysis Algorithm</h4>
            <div className="h-64 sm:h-80 md:h-96 w-full flex justify-center items-center overflow-hidden">
              <RadarChart data={mockValues} />
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-6 md:gap-8">
              <div className="flex items-center gap-3 text-[10px] md:text-xs font-black text-text-muted uppercase tracking-widest">
                <div className="w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/50"></div> Risk Factors
              </div>
              <div className="flex items-center gap-3 text-[10px] md:text-xs font-black text-text-muted uppercase tracking-widest">
                <div className="w-3 h-3 rounded-full bg-secondary shadow-lg shadow-secondary/50"></div> Stability
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex-1 order-1 lg:order-2 space-y-8 text-center lg:text-left">
          <p className="text-text-muted text-base md:text-lg lg:text-xl leading-relaxed font-medium">
            Our adaptive radar factors provide a clear mathematical representation of your burnout risk. By decoupling workload from job satisfaction, we show exactly where your energy is being drained.
          </p>
          <div className="space-y-4 max-w-lg mx-auto lg:mx-0">
            {[
              { label: 'Workload Metric', value: '4.2 / 5.0', color: 'text-red-400', bg: 'bg-red-400/10' },
              { label: 'Wellness Index', value: 'STABLE', color: 'text-green-400', bg: 'bg-green-400/10' }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                whileHover={{ x: 15 }}
                className="flex justify-between items-center intense-glass p-6 rounded-2xl border-white/5 group shadow-lg"
              >
                <span className="font-black text-white group-hover:text-primary transition-colors uppercase tracking-tight">{stat.label}</span>
                <span className={`${stat.color} font-black font-mono ${stat.bg} px-4 py-2 rounded-xl text-xs md:text-sm`}>{stat.value}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
};

export default VisualizationPreview;
