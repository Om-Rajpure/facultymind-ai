import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Send, User, Bot, Sparkles, ArrowLeft, Info, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Section from '../components/ui/Section';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const AdminAI = () => {
  const navigate = useNavigate();
  const { tokens } = useAuth();
  const [messages, setMessages] = useState([
    { role: 'bot', content: "Hello Admin. I've analyzed the latest faculty burnout trends. How can I assist you with institutional wellness monitoring today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [institutionalContext, setInstitutionalContext] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchContext();
  }, []);

  const fetchContext = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/ai-context/`, {
        headers: { Authorization: `Bearer ${tokens.access}` }
      });
      setInstitutionalContext(res.data.context);
    } catch (error) {
      console.error("Error fetching context:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      // We'll use the existing chat endpoint but prepend the institutional context
      const fullPrompt = `INSTITUTIONAL DATA CONTEXT:\n${institutionalContext}\n\nUSER QUESTION: ${userMsg}`;
      
      const res = await axios.post(`${API_BASE_URL}/chat/`, {
        message: fullPrompt
      }, {
        headers: { Authorization: `Bearer ${tokens.access}` }
      });

      setMessages(prev => [...prev, { role: 'bot', content: res.data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', content: "I'm sorry, I'm having trouble accessing the analysis engine right now. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-12 min-h-screen flex flex-col">
      <Section className="!pt-0 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/admin-dashboard')}
              className="p-2 bg-white/5 rounded-xl border border-white/10 text-white hover:bg-white/10 transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
                Admin <span className="text-secondary">Insight AI</span>
                <Sparkles className="text-secondary" size={24} />
              </h1>
              <p className="text-text-muted text-sm">Strategic institutional wellness support</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full">
            <Activity className="text-secondary" size={16} />
            <span className="text-secondary text-xs font-bold uppercase tracking-wider">Context Active</span>
          </div>
        </div>

        <div className="flex-1 glass-card border border-white/10 flex flex-col overflow-hidden max-h-[600px] relative">
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-bg-dark/50 to-transparent pointer-events-none z-10" />
          
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 scrollbar-hide">
            {messages.map((msg, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex gap-4 max-w-[85%] md:max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                    msg.role === 'user' ? 'bg-primary/20 border-primary/30' : 'bg-secondary/20 border-secondary/30'
                  }`}>
                    {msg.role === 'user' ? <User size={18} className="text-primary" /> : <Bot size={18} className="text-secondary" />}
                  </div>
                  <div className={`p-5 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user' ? 'bg-primary text-white font-medium' : 'bg-white/5 text-slate-200 border border-white/10'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center animate-pulse">
                    <Bot size={18} className="text-secondary" />
                  </div>
                  <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex gap-1">
                    <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-bounce" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-6 md:p-8 border-t border-white/10 bg-white/5">
            <form onSubmit={handleSend} className="relative">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about faculty burnout trends or department stress..."
                className="w-full bg-bg-dark border border-white/10 rounded-2xl py-5 pl-8 pr-16 text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all placeholder:text-text-muted/50 shadow-inner"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-secondary text-white rounded-xl hover:bg-secondary/80 disabled:opacity-50 transition-all shadow-lg"
              >
                <Send size={20} />
              </button>
            </form>
            <div className="mt-4 flex items-center gap-2 text-[10px] text-text-muted/60 justify-center">
              <Info size={12} />
              <span>Responses are based on live institutional data aggregates.</span>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default AdminAI;
