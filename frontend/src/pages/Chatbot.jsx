import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Bot, Send, BellPlus, Loader2, TrendingUp, Clock, AlertCircle, CheckCircle, Info, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';


const QUICK_CHIPS = [
  'Explain my burnout score',
  'What should I improve first?',
  'Give me stress tips',
  'Set a reminder',
  'Show my last assessment summary',
];

function formatMessage(text) {
  const parts = text.split(/(\*\*[^*]+\*\*|\n)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="text-white">{part.slice(2, -2)}</strong>;
    if (part === '\n') return <br key={i} />;
    return part;
  });
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 mb-4">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
        <Bot size={16} className="text-white" />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white/5 border border-white/10 flex gap-1.5 items-center">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary/70"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ChatbotPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [chips, setChips] = useState(QUICK_CHIPS);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const { tokens } = useAuth();
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [reminderCount, setReminderCount] = useState(0);
  const bottomRef = useRef(null);

  const userEmail = user?.email || `${user?.name?.toLowerCase().replace(/ /g, '.')}@facultymind.ai`;
  const firstName = user?.name?.split(' ')[0] || 'Professor';
  const lastResult = (() => {
    try { return JSON.parse(localStorage.getItem('last_assessment_result') || 'null'); } catch { return null; }
  })();

  useEffect(() => {
    if (user) initSession();
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const initSession = async () => {
    setLoading(true);
    try {
      const [sessionRes, remindersRes] = await Promise.all([
        api.post('/api/chat/start/', {}),
        api.get('/api/reminders/list/'),
      ]);
      setSessionId(sessionRes.data.session_id);
      setMessages(sessionRes.data.messages || []);
      setReminders(remindersRes.data || []);
      setReminderCount(remindersRes.data.length);
    } catch {
      setMessages([{
        id: 0, role: 'bot',
        content: `Hello, ${firstName}! 👋 I'm your FacultyMind Wellness Assistant. How can I help you today?`,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || !sessionId) return;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: msg, timestamp: new Date().toISOString() }]);
    setTyping(true);

    try {
      const res = await api.post('/api/chat/message/', { session_id: sessionId, message: msg });
      const bot = res.data.bot_message;
      setMessages(prev => [...prev, { id: bot.id, role: 'bot', content: bot.content, timestamp: bot.timestamp }]);
      if (res.data.suggested_chips?.length) setChips(res.data.suggested_chips);
      if (res.data.reminder_created) {
        setReminderCount(c => c + 1);
        const remindersRes = await api.get('/api/reminders/list/');
        setReminders(remindersRes.data || []);
      }
    } catch {
      setMessages(prev => [...prev, { id: Date.now(), role: 'bot', content: "Connection issue. Please try again.", timestamp: new Date().toISOString() }]);
    } finally {
      setTyping(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const formatTime = (ts) => {
    try { return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return ''; }
  };

  const riskColor = {
    High: 'text-red-400', Medium: 'text-yellow-400', Low: 'text-green-400'
  }[lastResult?.risk_level] || 'text-slate-400';

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="container-1200">
        
        <div className="mb-8">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-primary font-bold tracking-widest uppercase text-sm">Your Personal Wellness AI</motion.p>
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl font-extrabold text-white mt-1">
            Hello, <span className="text-gradient">{firstName}</span> 👋
          </motion.h1>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">

          {/* Left Panel — Context */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Burnout Summary */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6 space-y-4">
              <h3 className="text-white font-bold flex items-center gap-2"><TrendingUp size={18} className="text-primary" /> Latest Assessment</h3>
              {lastResult ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Burnout Index</span>
                    <span className="text-white font-black text-2xl">{lastResult.burnout_index ?? Math.round(((lastResult.mental_stress * 0.3 + lastResult.teaching_workload * 0.25 + lastResult.sleep_physical_health * 0.2 + lastResult.work_life_balance * 0.15 + lastResult.job_satisfaction * 0.1) - 1) / 4 * 100)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Risk Level</span>
                    <span className={`font-bold text-sm ${riskColor}`}>
                      {{High: '🔴', Medium: '🟡', Low: '🟢'}[lastResult.risk_level] || '⚪'} {lastResult.risk_level} Risk
                    </span>
                  </div>
                  <div className="pt-2 border-t border-white/5 space-y-2">
                    {['teaching_workload', 'mental_stress', 'sleep_physical_health'].map(key => {
                      const labels = { teaching_workload: 'Workload', mental_stress: 'Stress', sleep_physical_health: 'Sleep' };
                      const val = lastResult[key] || 0;
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-slate-500 text-xs w-16">{labels[key]}</span>
                          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full" style={{ width: `${(val / 5) * 100}%` }} />
                          </div>
                          <span className="text-xs text-slate-400 w-6">{val?.toFixed(1)}</span>
                        </div>
                      );
                    })}
                  </div>
                  <button onClick={() => navigate('/assessment-result')} className="w-full text-xs text-primary hover:text-white transition-colors text-center pt-1">View full report →</button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <AlertCircle size={32} className="text-slate-500 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">No assessment yet</p>
                  <button onClick={() => navigate('/assessment')} className="btn-primary text-xs py-2 px-4 mt-3">Start Assessment</button>
                </div>
              )}
            </motion.div>

            {/* Active Reminders */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6 space-y-4">
              <h3 className="text-white font-bold flex items-center gap-2">
                <BellPlus size={18} className="text-primary" /> Reminders
                {reminderCount > 0 && <span className="ml-auto text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">{reminderCount}</span>}
              </h3>
              {reminders.length === 0 ? (
                <p className="text-slate-400 text-sm">No reminders yet. Try asking me to "Remind me tomorrow to retake my assessment."</p>
              ) : (
                <div className="space-y-2">
                  {reminders.slice(0, 4).map(r => (
                    <div key={r.id} className="flex gap-2 items-start p-3 rounded-xl bg-white/5 border border-white/5">
                      <Clock size={14} className="text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-white font-medium capitalize">{r.reminder_type.replace('_', ' ')}</p>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{r.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Quick Tips */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
              <h3 className="text-white font-bold mb-3 flex items-center gap-2"><Info size={18} className="text-secondary" /> Quick Actions</h3>
              <div className="flex flex-col gap-2">
                {QUICK_CHIPS.map(chip => (
                  <button key={chip} onClick={() => sendMessage(chip)} className="text-left text-xs px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-slate-300 hover:bg-primary/20 hover:border-primary/50 hover:text-white transition-all">
                    {chip}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Chat Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-8 glass-card flex flex-col h-[600px] md:h-[680px]"
          >
            {/* Chat Header */}
            <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold">FacultyMind Wellness AI</p>
                <p className="text-xs text-green-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
                  Online • Personalized for {firstName}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <MessageCircle size={16} className="text-slate-500" />
                <span className="text-xs text-slate-400">{messages.length} messages</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-1">
              {loading && (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center space-y-3">
                    <Loader2 size={36} className="text-primary animate-spin mx-auto" />
                    <p className="text-slate-400 text-sm">Loading your personalized session...</p>
                  </div>
                </div>
              )}
              {!loading && messages.map(msg => (
                <div key={msg.id} className={`flex items-end gap-3 mb-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.role === 'bot' && (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0 mb-1">
                      <Bot size={16} className="text-white" />
                    </div>
                  )}
                  {msg.role === 'user' && (
                    <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0 mb-1 text-sm font-bold text-white">
                      {firstName[0]}
                    </div>
                  )}
                  <div className={`max-w-[85%] sm:max-w-[75%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed break-words ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-primary to-secondary text-white rounded-br-sm'
                      : 'bg-white/5 border border-white/8 text-slate-300 rounded-bl-sm shadow-inner'
                  }`}>
                    {msg.role === 'bot' ? formatMessage(msg.content) : msg.content}
                    <p className="text-[10px] mt-2 opacity-40">{formatTime(msg.timestamp)}</p>
                  </div>
                </div>
              ))}
              {typing && !loading && <TypingIndicator />}
              <div ref={bottomRef} />
            </div>

            {/* Chips + Input */}
            <div className="border-t border-white/5 px-6 pt-3 pb-5 space-y-3">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {chips.slice(0, 4).map(chip => (
                  <button key={chip} onClick={() => sendMessage(chip)} className="shrink-0 text-xs px-3.5 py-2 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:bg-primary/20 hover:border-primary/50 hover:text-white transition-all whitespace-nowrap">
                    {chip}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 items-center">
                <div className="flex-1 flex items-center bg-white/5 border border-white/10 rounded-2xl px-5 py-3 focus-within:border-primary/50 transition-all">
                  <textarea
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                    rows={1}
                    placeholder="Ask me anything about your wellness..."
                    className="flex-1 bg-transparent text-sm text-white placeholder-slate-500 outline-none resize-none"
                    disabled={!sessionId || typing}
                  />
                </div>
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || !sessionId || typing}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center disabled:opacity-40 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                >
                  <Send size={18} className="text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
