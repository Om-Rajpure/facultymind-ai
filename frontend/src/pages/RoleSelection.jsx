import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserCircle, ShieldCheck } from 'lucide-react';

const RoleSelection = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    login({ role });
    navigate('/profile-setup');
  };

  const roles = [
    {
      id: 'teacher',
      title: 'Teacher',
      description: 'Take burnout assessments and monitor your mental workload.',
      icon: <UserCircle size={40} className="text-primary" />,
    },
    {
      id: 'admin',
      title: 'Admin',
      description: 'Monitor faculty burnout trends and department insights.',
      icon: <ShieldCheck size={40} className="text-secondary" />,
    }
  ];

  return (
    <section className="min-h-screen pt-32 pb-16 flex items-center justify-center">
      <div className="container-1200">
        <div className="text-center space-y-4 mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-extrabold text-white"
          >
            Choose Your <span className="text-gradient">Role</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-text-muted text-lg max-w-2xl mx-auto"
          >
            Select how you will be using FacultyMind to ensure a personalized experience.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {roles.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              onClick={() => handleRoleSelect(role.id)}
              className="glass-card p-10 cursor-pointer group hover:border-primary/50 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative space-y-6">
                <div className="bg-white/5 w-20 h-20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border border-white/10 group-hover:border-primary/30">
                  {role.icon}
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-white group-hover:text-primary transition-colors">{role.title}</h3>
                  <p className="text-text-muted leading-relaxed">{role.description}</p>
                </div>

                <div className="pt-4">
                  <span className="text-primary font-bold inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                    Select Role <span className="text-xl">→</span>
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RoleSelection;
