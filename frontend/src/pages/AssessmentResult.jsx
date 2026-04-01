import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight, 
  Info,
  RefreshCcw,
  LayoutDashboard,
  ClipboardList,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const AssessmentResult = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, tokens } = useAuth();
  const navigate = useNavigate();

  console.log("USER:", user);
  console.log("TOKENS:", tokens);
  console.log("LOADING:", loading);

  useEffect(() => {
    if (!tokens || !tokens.access) {
      console.log("⛔ Tokens not ready");
      return;
    }

    console.log("✅ Tokens ready, calling API");
    console.log("API URL:", import.meta.env.VITE_API_URL);

    const fetchResults = async () => {
      try {
        setLoading(true);
        const response = await api.get('/assessments/');
        console.log("✅ API RESPONSE:", response.data);
        setResults(response.data);
      } catch (error) {
        console.error("❌ API ERROR:", error);
      } finally {
        console.log("✅ Stopping loader");
        setLoading(false);
      }
    };

    fetchResults();
  }, [tokens]);

  if (loading) {
    return (
      <div className="min-h-screen py-32 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCcw className="animate-spin text-primary" size={40} />
          <p className="text-text-muted font-bold animate-pulse">Fetching your analysis...</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="min-h-screen py-32 flex items-center justify-center">
        <div className="container-1200 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl glass-card p-12 text-center space-y-8"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ClipboardList size={40} className="text-primary" />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl font-bold text-white">No Assessment Found</h2>
              <p className="text-text-muted text-lg leading-relaxed max-w-md mx-auto">
                You haven't completed a burnout assessment yet. 
                Start your first assessment to understand your burnout risk.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button 
                onClick={() => navigate('/assessment')}
                className="btn-primary w-full sm:w-auto px-10 py-4 flex items-center justify-center gap-3 text-lg"
              >
                <ClipboardList size={22} /> Start Assessment
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-3 text-lg"
              >
                <LayoutDashboard size={22} /> Back to Dashboard
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const getRiskColor = (risk) => {
    if (risk === 'Low') return 'text-green-400';
    if (risk === 'Medium') return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRiskBg = (risk) => {
    if (risk === 'Low') return 'bg-green-400/10 border-green-400/20';
    if (risk === 'Medium') return 'bg-yellow-400/10 border-yellow-400/20';
    return 'bg-red-400/10 border-red-400/20';
  };

  return (
    <div className="min-h-screen py-32">
      <div className="container-1200 space-y-12">
        
        {/* Header Area */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div className="space-y-2">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-primary font-bold tracking-widest uppercase text-sm"
            >
              Assessment History
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-extrabold text-white"
            >
              Previous <span className="text-gradient">Results</span>
            </motion.h1>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="btn-primary py-3 px-6 text-sm flex items-center gap-2"
            >
              <LayoutDashboard size={18} /> Dashboard
            </button>
          </div>
        </div>

        <div className="grid gap-8">
          {results.map((result, index) => (
            <motion.div 
              key={result.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-8 md:p-10"
            >
              <div className="flex flex-col lg:flex-row gap-12">
                
                {/* Score Summary */}
                <div className="lg:w-1/3 flex flex-col items-center justify-center text-center space-y-6">
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-white/5" />
                      <motion.circle
                        cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="10" fill="transparent"
                        strokeDasharray={452.39}
                        initial={{ strokeDashoffset: 452.39 }}
                        animate={{ strokeDashoffset: 452.39 - (452.39 * result.burnout_index) / 100 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="text-primary"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black text-white">{Math.round(result.burnout_index)}%</span>
                      <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Score</span>
                    </div>
                  </div>

                  <div className={`px-5 py-2 rounded-full border ${getRiskBg(result.risk_level)} ${getRiskColor(result.risk_level)} font-bold flex items-center gap-2 text-sm`}>
                    {result.risk_level === 'High' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
                    {result.risk_level} Risk Level
                  </div>

                  <div className="flex items-center gap-2 text-text-muted text-sm font-medium">
                    <Calendar size={16} />
                    {new Date(result.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>

                {/* Radar Chart and Factors */}
                <div className="lg:w-2/3 grid md:grid-cols-2 gap-8 items-center">
                  <div className="h-[250px] w-full">
                    <Radar 
                      data={{
                        labels: ['Workload', 'Stress', 'Sleep', 'Balance', 'Satisfaction', 'Support'],
                        datasets: [
                          {
                            label: 'Burnout Factors',
                            data: [
                              result.workload_score,
                              result.stress_score,
                              result.sleep_score,
                              result.balance_score,
                              result.satisfaction_score,
                              result.support_score
                            ],
                            backgroundColor: 'rgba(99, 102, 241, 0.4)',
                            borderColor: '#6366f1',
                            borderWidth: 2,
                            pointBackgroundColor: '#6366f1',
                          },
                        ],
                      }}
                      options={{
                        scales: {
                          r: {
                            angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            pointLabels: { color: '#94a3b8', font: { size: 10, weight: 'bold' } },
                            ticks: { display: false },
                            suggestedMin: 0,
                            suggestedMax: 4
                          }
                        },
                        plugins: { legend: { display: false } },
                        maintainAspectRatio: false
                      }}
                    />
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-white font-bold text-sm uppercase tracking-widest mb-4 opacity-50">Detailed Breakdown</h4>
                    {[
                      { label: 'Workload', score: result.workload_score },
                      { label: 'Stress', score: result.stress_score },
                      { label: 'Sleep', score: result.sleep_score },
                      { label: 'Balance', score: result.balance_score },
                      { label: 'Satisfaction', score: result.satisfaction_score },
                      { label: 'Support', score: result.support_score },
                    ].map((factor) => (
                      <div key={factor.label} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                        <span className="text-xs font-semibold text-text-muted">{factor.label}</span>
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 w-20 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${(factor.score / 4) * 100}%` }}></div>
                          </div>
                          <span className="text-xs font-black text-white">{factor.score.toFixed(1)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssessmentResult;
