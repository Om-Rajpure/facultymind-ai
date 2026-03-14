import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, Loader2, BellPlus, Maximize2, Minimize2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
const API = API_BASE_URL;

// Format bot messages: bold **text**, newlines
function formatMessage(text) {
  if (!text) return '';
  const parts = text.split(/(\*\*[^*]+\*\*|\n)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="text-white">{part.slice(2, -2)}</strong>;
    }
    if (part === '\n') return <br key={i} />;
    return part;
  });
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-3">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
        <Bot size={12} className="text-white" />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white/5 border border-white/10 flex gap-2 items-center">
        <span className="text-xs text-slate-400 italic">FacultyMind AI is typing...</span>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-1 h-1 rounded-full bg-primary/70"
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const QUICK_CHIPS = [
  'Explain my burnout score',
  'What should I improve first?',
  'Give me stress tips',
  'Show my last assessment',
];

export default function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chips, setChips] = useState(QUICK_CHIPS);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [typing, setTyping] = useState(false);
  const { tokens } = useAuth();
  const bottomRef = useRef(null);

  // Detect if user has assessment data (enriches responses)
  const hasAssessmentData = !!localStorage.getItem('last_assessment_result');
  const userEmail = user?.email || `${user?.name?.toLowerCase().replace(/ /g, '.')}@facultymind.ai`;

  // Start session when widget opens for the first time
  useEffect(() => {
    if (open && user && !sessionId) {
      initSession();
    }
  }, [open, user]);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const initSession = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${tokens.access}` } };
      const res = await axios.post(`${API}/chat/start/`, {}, config);
      setSessionId(res.data.session_id);
      setMessages(res.data.messages || []);
    } catch {
      // Offline fallback welcome
      const lastResult = (() => { try { return JSON.parse(localStorage.getItem('last_assessment_result') || 'null'); } catch { return null; } })();
      const fallbackMsg = lastResult
        ? `Hello, **${user?.name || 'Professor'}**! 👋 I can see your burnout index is **${lastResult.burnout_index ?? '?'}%**. Ask me anything about your results or how to improve.`
        : `Hello, **${user?.name || 'Professor'}**! 👋 I'm your FacultyMind Wellness Assistant. How can I help you today?`;
      setMessages([{ id: 0, role: 'bot', content: fallbackMsg, timestamp: new Date().toISOString() }]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;

    setInput('');
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: msg, timestamp: new Date().toISOString() }]);
    setTyping(true);

    try {
      let botContent, newChips;
      const config = { headers: { Authorization: `Bearer ${tokens.access}` } };

      // Unified Gemini-powered chat API
      const res = await axios.post(`${API}/chat/`, { 
        message: msg 
      }, config);
      
      botContent = res.data.reply;
      newChips = res.data.suggestions;
      if (res.data.session_id) setSessionId(res.data.session_id);

      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'bot', content: botContent, timestamp: new Date().toISOString() }]);
      if (newChips?.length) setChips(newChips);
    } catch (err) {
      const errorMsg = err.response?.data?.reply || "I'm here to help with faculty burnout insights and workload management. Could you please rephrase your question?";
      setMessages(prev => [...prev, { id: Date.now(), role: 'bot', content: errorMsg, timestamp: new Date().toISOString() }]);
    } finally {
      setTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (ts) => {
    try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
    catch { return ''; }
  };

  if (!user) return null;

  return (
    <>
      {/* Floating Button */}
      <motion.button
        onClick={() => {
          setOpen(o => !o);
          if (open) setIsExpanded(false);
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all"
        aria-label="Open wellness assistant"
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X size={22} className="text-white" /></motion.div>
            : <motion.div key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                <MessageCircle size={22} className="text-white" />
              </motion.div>
          }
        </AnimatePresence>
        {/* Pulse ring */}
        {!open && (
          <span className="absolute inset-0 rounded-full bg-primary/40 animate-ping" />
        )}
      </motion.button>

      {/* Chat Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              width: isExpanded ? '720px' : '360px',
              height: isExpanded ? '80vh' : '500px',
            }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`fixed bottom-28 right-8 z-50 flex flex-col rounded-3xl overflow-hidden`}
            style={{
              background: 'rgba(11, 15, 42, 0.92)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 25px 60px -10px rgba(0,0,0,0.8), 0 0 0 1px rgba(99,102,241,0.1)',
            }}
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-white/5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">FacultyMind AI</p>
                <p className="text-xs text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                  Wellness Assistant
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                {hasAssessmentData && (
                  <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold">🧠 Personalised</span>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-thin">
              {loading && <div className="flex justify-center py-8"><Loader2 className="text-primary animate-spin" size={24} /></div>}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex items-end gap-2 mb-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.role === 'bot' && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                      <Bot size={12} className="text-white" />
                    </div>
                  )}
                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-primary to-secondary text-white rounded-br-sm'
                      : 'bg-white/5 border border-white/10 text-slate-300 rounded-bl-sm'
                  }`}>
                    {msg.role === 'bot' ? formatMessage(msg.content) : msg.content}
                    <p className="text-[10px] mt-1.5 opacity-40">{formatTime(msg.timestamp)}</p>
                  </div>
                </div>
              ))}
              {typing && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>

            {/* Quick Chips */}
            {!loading && (
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-thin">
                {chips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => sendMessage(chip)}
                    className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:bg-primary/20 hover:border-primary/50 hover:text-white transition-all whitespace-nowrap"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="px-4 pb-4 pt-2 border-t border-white/5">
              <div className="flex gap-2 items-center bg-white/5 rounded-2xl border border-white/10 px-4 py-2 focus-within:border-primary/50 transition-all">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none"
                  disabled={typing}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || typing}
                  className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center disabled:opacity-40 hover:scale-110 transition-transform"
                >
                  <Send size={14} className="text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
