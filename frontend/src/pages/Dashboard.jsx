import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { ClipboardList, History, ArrowRight, Bot } from 'lucide-react';
import Section from '../components/ui/Section';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const actions = [
    {
      title: "Start Burnout Assessment",
      description: "Complete the ML-powered questionnaire to predict your burnout risk.",
      icon: <ClipboardList className="text-primary" size={32} />,
      btnText: "Start Now",
      color: "from-blue-500/20 to-indigo-500/20",
      borderColor: "border-primary/30",
      onClick: () => navigate('/assessment')
    },
    {
      title: "View Previous Results",
      description: "Analyze your historical stress patterns and departmental insights.",
      icon: <History className="text-secondary" size={32} />,
      btnText: "View History",
      color: "from-sky-500/20 to-blue-500/20",
      borderColor: "border-secondary/30",
      onClick: () => navigate('/assessment-result')
    },
    {
      title: "Chat with Wellness AI",
      description: "Get personalized guidance based on your burnout score and top stress factors.",
      icon: <Bot className="text-purple-400" size={32} />,
      btnText: "Open Chat",
      color: "from-purple-500/20 to-pink-500/20",
      borderColor: "border-purple-400/30",
      onClick: () => navigate('/chatbot')
    }
  ];

  return (
    <div className="pt-32 pb-24 min-h-screen">
      <Section className="!pt-0">
        <div className="space-y-2 mb-12">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl md:text-5xl font-extrabold text-white"
          >
            Welcome back, <span className="text-gradient">{user?.name?.split(' ')[1] || user?.name}</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-text-muted text-lg"
          >
            Your faculty wellness insights start here.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {actions.map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              onClick={action.onClick}
              className={`glass-card p-8 md:p-10 group cursor-pointer border ${action.borderColor} relative overflow-hidden`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative space-y-6">
                <div className="bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                  {action.icon}
                </div>
                
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold text-white">{action.title}</h2>
                  <p className="text-text-muted text-base leading-relaxed">{action.description}</p>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={action.onClick}
                    className="flex items-center gap-2 text-white font-bold group-hover:gap-3 transition-all"
                  >
                    {action.btnText} <ArrowRight size={20} className="text-primary" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>
    </div>
  );
};

export default Dashboard;
