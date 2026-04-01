import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  ClipboardCheck, 
  AlertTriangle, 
  BarChart3, 
  Activity,
  TrendingDown,
  X,
  History,
  MessageSquare,
  ChevronRight,
  PieChart as PieIcon,
  Search,
  ArrowLeft
} from 'lucide-react';
import api from '../api/axios';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  PieChart,
  Pie
} from 'recharts';
import Section from '../components/ui/Section';
import WorkspaceCodeCard from '../components/ui/WorkspaceCodeCard';


const AdminDashboard = () => {
  const { user, tokens } = useAuth();
  const [stats, setStats] = useState({
    total_teachers: 0,
    total_assessments: 0,
    average_burnout_score: 0,
    high_risk_count: 0
  });
  const [deptData, setDeptData] = useState([]);
  const [highRiskFaculty, setHighRiskFaculty] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Selected Faculty for History/Message
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [facultyHistory, setFacultyHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [workspaceData, setWorkspaceData] = useState(null);

  useEffect(() => {
    if (!tokens || !tokens.access) {
      console.log("⛔ Tokens not ready (AdminDashboard)");
      return;
    }

    console.log("✅ Tokens ready, calling admin API");
    fetchAdminData();
  }, [tokens]);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      console.log("DEBUG: AdminDashboard - User:", user);
      console.log("DEBUG: AdminDashboard - Role:", user?.role);
      
      const [overviewRes, deptRes, highRiskRes, facultyRes, workspaceRes] = await Promise.all([
        api.get('/admin/overview/'),
        api.get('/admin/department-analytics/'),
        api.get('/admin/high-risk/'),
        api.get('/admin/faculty/'),
        api.get('/workspaces/my-workspace/')
      ]);
      
      console.log("DEBUG: AdminDashboard - Workspace API Response:", workspaceRes.data);
      setStats(overviewRes.data);
      setDeptData(deptRes.data);
      setHighRiskFaculty(highRiskRes.data);
      setFacultyList(facultyRes.data);
      setWorkspaceData(workspaceRes.data);
    } catch (error) {
      console.error("Error fetching admin data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFacultyHistory = async (id) => {
    try {
      const res = await api.get(`/admin/faculty/${id}/history/`);
      setFacultyHistory(res.data);
      setIsHistoryOpen(true);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    setSendingMessage(true);
    try {
      await api.post('/admin/send-message/', {
        teacher_id: selectedFaculty.id,
        message: messageText
      });
      setIsMessageOpen(false);
      setMessageText("");
      alert("Message sent successfully!");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSendingMessage(false);
    }
  };

  // Distribution Data (Mock integration - theoretically would come from backend)
  const distributionData = [
    { name: 'Low Risk', value: facultyList.filter(f => f.risk_level === 'Low').length, color: '#10b981' },
    { name: 'Moderate Risk', value: facultyList.filter(f => f.risk_level === 'Moderate').length, color: '#f59e0b' },
    { name: 'High Risk', value: stats.high_risk_count, color: '#f43f5e' },
  ].filter(d => d.value > 0);

  const statCards = [
    {
      title: "Total Teachers",
      value: stats.total_teachers,
      icon: <Users className="text-blue-400" size={24} />,
      color: "from-blue-500/10 to-indigo-500/10",
      borderColor: "border-blue-500/20"
    },
    {
      title: "Total Assessments",
      value: stats.total_assessments,
      icon: <ClipboardCheck className="text-emerald-400" size={24} />,
      color: "from-emerald-500/10 to-teal-500/10",
      borderColor: "border-emerald-500/20"
    },
    {
      title: "Avg Burnout Score",
      value: `${stats.average_burnout_score}%`,
      icon: <TrendingDown className="text-orange-400" size={24} />,
      color: "from-orange-500/10 to-red-500/10",
      borderColor: "border-orange-500/20"
    },
    {
      title: "High Risk Teachers",
      value: stats.high_risk_count,
      icon: <AlertTriangle className="text-red-400" size={24} />,
      color: "from-red-500/10 to-pink-500/10",
      borderColor: "border-red-500/20"
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 min-h-screen">
      <Section className="!pt-0">
        <div className="flex items-center justify-between mb-12">
          <div className="space-y-2">
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white"
            >
              Institutional <span className="text-gradient">Insights</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-text-muted text-lg"
            >
              Monitor faculty burnout patterns across the organization.
            </motion.p>
          </div>
          <div className="flex items-center gap-4">
            {workspaceData ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="hidden md:block"
              >
                <WorkspaceCodeCard joinCode={workspaceData.join_code} />
              </motion.div>
            ) : !loading ? (
              <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 className="hidden md:block text-orange-400 text-xs font-semibold bg-orange-500/10 px-4 py-2 rounded-xl border border-orange-500/20"
              >
                 Workspace not found. Please create one.
              </motion.div>
            ) : null}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href='/admin-ai'}
              className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-primary/10 border border-primary/30 rounded-2xl text-primary font-bold hover:bg-primary/20 transition-all text-xs sm:text-base h-full"
            >
              <MessageSquare size={18} /> <span className="hidden sm:inline">Ask AI Assistant</span><span className="sm:hidden">AI</span>
            </motion.button>
          </div>
        </div>
        
        {/* Mobile Workspace Code */}
        {workspaceData ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden mb-8"
          >
            <WorkspaceCodeCard joinCode={workspaceData.join_code} />
          </motion.div>
        ) : !loading ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden mb-8 text-orange-400 text-xs font-semibold bg-orange-500/10 px-4 py-3 rounded-xl border border-orange-500/20 text-center"
          >
            Workspace not found. Please create one.
          </motion.div>
        ) : null}

        {/* Section 1: Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`glass-card p-6 border ${card.borderColor} bg-gradient-to-br ${card.color}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                  {card.icon}
                </div>
              </div>
              <div>
                <h3 className="text-text-muted text-sm font-medium mb-1">{card.title}</h3>
                <p className="text-3xl font-bold text-white tracking-tight">{card.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Section 2: Analytics Charts */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Department Comparison */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 glass-card p-8 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-8">
              <BarChart3 className="text-primary" size={24} />
              <h2 className="text-xl font-bold text-white">Department Comparison</h2>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="department" 
                    type="category" 
                    stroke="#94a3b8" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    width={120}
                  />
                  <RechartsTooltip 
                    cursor={{ fill: '#ffffff05' }}
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '12px' }}
                  />
                  <Bar dataKey="avg_score" radius={[0, 4, 4, 0]} barSize={20}>
                    {deptData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.avg_score > 60 ? '#f43f5e' : '#60a5fa'} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Risk Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card p-8 border border-white/10 flex flex-col items-center"
          >
            <div className="flex items-center gap-3 mb-8 w-full">
              <PieIcon className="text-secondary" size={24} />
              <h2 className="text-xl font-bold text-white">Risk Distribution</h2>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 w-full">
              {distributionData.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-xs text-text-muted font-medium">{d.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Section 3: High Risk Teachers */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card overflow-hidden border border-red-500/20"
          >
            <div className="p-8 border-b border-white/10 flex items-center justify-between bg-red-500/5">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-red-400" size={24} />
                <h2 className="text-2xl font-bold text-white">High Risk Faculty</h2>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5">
                    <th className="px-8 py-4 text-text-muted font-semibold text-sm">Faculty Name</th>
                    <th className="px-8 py-4 text-text-muted font-semibold text-sm">Department</th>
                    <th className="px-8 py-4 text-text-muted font-semibold text-sm">Burnout Score</th>
                    <th className="px-8 py-4 text-text-muted font-semibold text-sm">Assessment Date</th>
                    <th className="px-8 py-4 text-text-muted font-semibold text-sm text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {highRiskFaculty.length > 0 ? (
                    highRiskFaculty.map((faculty, index) => (
                      <tr key={index} className="hover:bg-white/5 transition-colors">
                        <td className="px-8 py-5 text-white font-medium">Anonymous</td>
                        <td className="px-8 py-5 text-text-muted">{faculty.department}</td>
                        <td className="px-8 py-5 text-red-400 font-bold">{faculty.burnout_score}%</td>
                        <td className="px-8 py-5 text-text-muted text-sm">{faculty.assessment_date}</td>
                        <td className="px-8 py-5 text-right">
                          <button 
                            onClick={() => { setSelectedFaculty(faculty); setIsMessageOpen(true); }}
                            className="bg-primary/20 text-primary px-4 py-2 rounded-lg text-xs font-bold hover:bg-primary/30 transition-all"
                          >
                            Reach Out
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5" className="px-8 py-10 text-center text-text-muted italic">No high risk teachers found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* Section 4: Faculty Monitoring */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass-card overflow-hidden border border-white/10"
          >
            <div className="p-8 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="text-primary" size={24} />
                <h2 className="text-2xl font-bold text-white">Faculty Monitoring</h2>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5">
                    <th className="px-8 py-4 text-text-muted font-semibold text-sm">Teacher Name</th>
                    <th className="px-8 py-4 text-text-muted font-semibold text-sm">Department</th>
                    <th className="px-8 py-4 text-text-muted font-semibold text-sm">Status</th>
                    <th className="px-8 py-4 text-text-muted font-semibold text-sm">Last Seen</th>
                    <th className="px-8 py-4 text-text-muted font-semibold text-sm text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {facultyList.map((faculty, index) => (
                    <tr key={index} className="hover:bg-white/5 transition-colors cursor-pointer group" onClick={() => fetchFacultyHistory(faculty.id)}>
                      <td className="px-8 py-5 text-white font-medium group-hover:text-primary transition-colors">Anonymous</td>
                      <td className="px-8 py-5 text-text-muted">{faculty.department}</td>
                      <td className="px-8 py-5">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold border ${
                          faculty.risk_level === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                          faculty.risk_level === 'Moderate' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                          'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {faculty.risk_level} Risk
                        </span>
                      </td>
                      <td className="px-8 py-5 text-text-muted text-xs">{faculty.last_assessment_date}</td>
                      <td className="px-8 py-5 text-right">
                        <ChevronRight size={20} className="text-primary inline group-hover:translate-x-1 transition-transform" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* Faculty History Modal */}
      <AnimatePresence>
        {isHistoryOpen && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHistoryOpen(false)}
              className="absolute inset-0 bg-bg-dark/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="relative w-full max-w-4xl bg-bg-dark border-t md:border border-white/10 rounded-t-[2.5rem] md:rounded-[2.5rem] overflow-hidden max-h-[90vh] flex flex-col shadow-2xl"
            >
              <div className="p-8 border-b border-white/10 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-extrabold text-white">Burnout History</h2>
                  <p className="text-text-muted">Viewing historical results for Anonymous</p>
                </div>
                <button onClick={() => setIsHistoryOpen(false)} className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-white">
                  <X size={24} />
                </button>
              </div>
              <div className="p-8 overflow-y-auto overflow-x-hidden">
                <div className="grid gap-6">
                  {facultyHistory.map((item, i) => (
                    <div key={i} className="glass-card p-6 border border-white/5 hover:border-primary/30 transition-all flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-white font-bold text-lg">{item.burnout_index}%</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.risk_level === 'High' ? 'bg-red-500/20 text-red-500' :
                            item.risk_level === 'Moderate' ? 'bg-yellow-500/20 text-yellow-500' :
                            'bg-emerald-500/20 text-emerald-500'
                          }`}>
                            {item.risk_level}
                          </span>
                        </div>
                        <p className="text-text-muted text-sm">{new Date(item.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                      <div className="hidden md:flex gap-4">
                         <div className="text-center px-4 border-r border-white/5">
                            <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Stress</p>
                            <p className="text-white font-bold">{item.stress_score}</p>
                         </div>
                         <div className="text-center px-4 border-r border-white/5">
                            <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Workload</p>
                            <p className="text-white font-bold">{item.workload_score}</p>
                         </div>
                         <div className="text-center px-4">
                            <p className="text-[10px] text-text-muted uppercase font-bold tracking-widest">Support</p>
                            <p className="text-white font-bold">{item.support_score}</p>
                         </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Message Modal */}
      <AnimatePresence>
        {isMessageOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMessageOpen(false)}
              className="absolute inset-0 bg-bg-dark/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-lg glass-card p-10 border border-primary/20 space-y-8"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="text-primary" size={28} />
                  <h2 className="text-2xl font-bold text-white">Send Guidance</h2>
                </div>
                <button onClick={() => setIsMessageOpen(false)} className="text-text-muted hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-bold text-text-muted">To: <span className="text-white">Anonymous</span></p>
                <textarea
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-text-muted/30"
                  rows="5"
                  placeholder="Share a supportive message or suggest a meeting..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
              </div>

              <button 
                disabled={sendingMessage || !messageText.trim()}
                onClick={handleSendMessage}
                className="w-full btn-primary justify-center py-4 text-lg disabled:opacity-50"
              >
                {sendingMessage ? "Sending..." : "Send Support Message"}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminDashboard;
