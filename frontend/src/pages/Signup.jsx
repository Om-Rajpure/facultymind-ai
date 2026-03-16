import React from 'react';
import { motion } from 'framer-motion';
import { SignUp } from '@clerk/react';
import { useAuth } from '../context/AuthContext';
import AuthRedirect from '../components/auth/AuthRedirect';

const Signup = () => {
  const { user } = useAuth();

  if (user) return <AuthRedirect />;
  return (
    <section className="min-h-screen pt-24 pb-16 flex items-center justify-center">
      <div className="container-1200 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <SignUp 
            signInUrl="/login"
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
        </motion.div>
      </div>
    </section>
  );
};

export default Signup;
