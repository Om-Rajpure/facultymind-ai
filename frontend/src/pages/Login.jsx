import React from 'react';
import { motion } from 'framer-motion';
import { SignIn } from "@clerk/react";
import { useAuth } from '../context/AuthContext';
import AuthRedirect from '../components/auth/AuthRedirect';

const Login = () => {
  const { user } = useAuth();

  if (user) return <AuthRedirect />;
  return (
    <section className="min-h-screen pt-24 pb-16 flex items-center justify-center">
      <div className="container-1200 flex items-center justify-center">
        <div className="flex flex-col lg:flex-row items-center gap-16 md:gap-24">
          {/* Left: Login Card */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-1 w-full max-w-md"
          >
            <div className="glass-card p-0 relative overflow-hidden group border-none shadow-none">
              <SignIn 
                signUpUrl="/signup"
                clerkJSVersion="6"
                appearance={{
                  elements: {
                    rootBox: "w-full",
                    card: "bg-transparent shadow-none border-none p-0",
                    headerTitle: "text-white text-3xl font-extrabold",
                    headerSubtitle: "text-text-muted",
                    socialButtonsBlockButton: "bg-white text-bg-dark hover:bg-slate-100 hover:scale-[1.02] transition-all",
                    formButtonPrimary: "bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl hover-glow",
                    formFieldLabel: "text-text-muted font-medium",
                    formFieldInput: "bg-bg-dark border-white/10 text-white rounded-xl focus:ring-1 focus:ring-primary/50",
                    footerActionText: "text-text-muted",
                    footerActionLink: "text-primary hover:underline font-semibold",
                    dividerText: "text-text-muted",
                    dividerLine: "bg-white/10"
                  }
                }}
              />
            </div>
          </motion.div>

          {/* Right: Illustration */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 hero-image-container hidden lg:flex"
          >
            <div className="relative p-4 bg-white/5 border border-white/10 rounded-[2.5rem] backdrop-blur-xl shadow-2xl animate-floating">
              <img 
                src="/ai-teacher-hero.png" 
                alt="FacultyMind Auth" 
                className="max-w-[450px] w-full rounded-[20px]"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Login;
