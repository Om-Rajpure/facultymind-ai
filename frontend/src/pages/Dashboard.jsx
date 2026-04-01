import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { ClipboardList, History, ArrowRight, Bot, Bell, X, MessageCircle } from 'lucide-react';
import Section from '../components/ui/Section';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';


const Dashboard = () => {
  const { user, tokens } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  console.log("USER:", user);
  console.log("TOKENS:", tokens);
  console.log("API URL:", API_BASE_URL);

  useEffect(() => {
    if (!tokens || !tokens.access) {
      console.log("⛔ Tokens not ready (Dashboard)");
      return;
    }
    
    console.log("✅ Tokens ready, calling notifications API");
    fetchNotifications();
  }, [tokens]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/');
      setNotifications(res.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read/`, {});
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-2">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl md:text-5xl font-extrabold text-white"
            >
              Welcome back, <span className="text-gradient">{user?.first_name || user?.username}</span>
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

          {/* Notification Bell */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-4 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all"
            >
              <Bell size={24} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-bg-dark">
                  {unreadCount}
                </span>
              )}
            </motion.button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-80 md:w-96 glass-card border border-white/10 shadow-2xl z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Notifications</h3>
                    <button onClick={() => setShowNotifications(false)} className="text-text-muted hover:text-white">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div 
                          key={n.id} 
                          className={`p-4 hover:bg-white/5 transition-colors cursor-pointer ${!n.is_read ? 'bg-primary/5' : ''}`}
                          onClick={() => markAsRead(n.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg mt-1 ${n.type === 'message' ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'}`}>
                              <MessageCircle size={16} />
                            </div>
                            <div className="space-y-1">
                              <p className={`text-sm leading-relaxed ${!n.is_read ? 'text-white font-medium' : 'text-text-muted'}`}>{n.message}</p>
                              <p className="text-[10px] text-text-muted/60">{n.created_at}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-text-muted italic text-sm">No new notifications.</div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {actions.map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
              onClick={action.onClick}
              className={`glass-card p-8 md:p-10 group cursor-pointer border ${action.borderColor} relative overflow-hidden h-full flex flex-col`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative space-y-6 flex-1 flex flex-col">
                <div className="bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                  {action.icon}
                </div>
                
                <div className="space-y-3 flex-1">
                  <h2 className="text-2xl font-bold text-white">{action.title}</h2>
                  <p className="text-text-muted text-sm leading-relaxed">{action.description}</p>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={(e) => { e.stopPropagation(); action.onClick(); }}
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
