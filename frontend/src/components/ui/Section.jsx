import React from 'react';
import { motion } from 'framer-motion';

const Section = ({ id, children, className = "", title, subtitle, badge }) => {
  return (
    <section id={id} className={`section-spacing scroll-mt-20 ${className}`}>
      <div className="container-1200">
        {(title || badge || subtitle) && (
          <div className="text-center space-y-4 mb-20 overflow-hidden">
            {badge && (
              <motion.span 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold tracking-wider uppercase mb-2"
              >
                {badge}
              </motion.span>
            )}
            {title && (
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-5xl font-extrabold max-w-3xl mx-auto leading-tight"
              >
                {title}
              </motion.h2>
            )}
            {subtitle && (
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="max-w-2xl mx-auto text-lg text-text-muted mt-6"
              >
                {subtitle}
              </motion.p>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
};

export default Section;
