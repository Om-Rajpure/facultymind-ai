import React from 'react';
import { motion } from 'framer-motion';

const AuthLoadingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-dark text-white relative overflow-hidden">
      {/* Subtle floating particles background */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/20 rounded-full"
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: Math.random() * 100 + "%",
              opacity: 0 
            }}
            animate={{ 
              y: [null, "-200px"],
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: Math.random() * 10 + 5, 
              repeat: Infinity, 
              ease: "linear",
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col items-center space-y-6 relative z-10"
      >
        <div className="relative">
          {/* Outer glow ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
            className="w-20 h-20 border-2 border-primary/20 rounded-full absolute -inset-2"
          />
          
          {/* Main loader ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center"
        >
          <p className="text-xl font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            FacultyMind AI
          </p>
          <p className="text-text-muted font-medium tracking-wide">
            Preparing your workspace...
          </p>
        </motion.div>
      </motion.div>
      
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--primary-rgb),0.05)_0%,transparent_70%)] pointer-events-none"></div>
    </div>
  );
};

export default AuthLoadingScreen;
