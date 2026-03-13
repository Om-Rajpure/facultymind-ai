import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
  LayoutDashboard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AssessmentResult = () => {
  const [data, setData] = useState(null);
  const [burnoutIndex, setBurnoutIndex] = useState(0);
  const [risk, setRisk] = useState({ level: '', color: '', icon: null });
  const navigate = useNavigate();

  useEffect(() => {
    const rawData = localStorage.getItem('last_assessment_result');
    if (!rawData) {
      navigate('/assessment');
      return;
    }

    const featureVector = JSON.parse(rawData);
    setData(featureVector);

    // Weighted Burnout Index Calculation
    // stress (30%) + workload (25%) + sleep (20%) + balance (15%) + satisfaction (10%)
    // Since support is an inverse factor for wellbeing, we use it for insights but not directly in the simple weighted burnout index for now, 
    // or we can subtract it if values were 1-5 (good-bad). 
    // Actually, in my questions 1 is good, 5 is bad for most.
    
    const index = (
      (featureVector.mental_stress * 0.30) +
      (featureVector.teaching_workload * 0.25) +
      (featureVector.sleep_physical_health * 0.20) +
      (featureVector.work_life_balance * 0.15) +
      (featureVector.job_satisfaction * 0.10)
    );

    // Normalize index from 1-5 scale to 0-100
    const normalizedIndex = ((index - 1) / 4) * 100;
    setBurnoutIndex(Math.round(normalizedIndex));

    if (normalizedIndex <= 30) {
      setRisk({ level: 'Low Risk', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20', icon: <CheckCircle className="text-green-400" /> });
    } else if (normalizedIndex <= 60) {
      setRisk({ level: 'Medium Risk', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20', icon: <Info className="text-yellow-400" /> });
    } else {
      setRisk({ level: 'High Risk', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20', icon: <AlertTriangle className="text-red-400" /> });
    }
  }, [navigate]);

  if (!data) return null;

  const chartData = [
    { subject: 'Workload', A: data.teaching_workload, fullMark: 5 },
    { subject: 'Stress', A: data.mental_stress, fullMark: 5 },
    { subject: 'Sleep', A: data.sleep_physical_health, fullMark: 5 },
    { subject: 'Balance', A: data.work_life_balance, fullMark: 5 },
    { subject: 'Satisfaction', A: data.job_satisfaction, fullMark: 5 },
    { subject: 'Support', A: data.institutional_support, fullMark: 5 },
  ];

  const getRecommendations = () => {
    const recommendations = [];
    if (data.mental_stress > 3.5) recommendations.push("Prioritize mindfulness sessions and consider discussing workload management with your HOD.");
    if (data.teaching_workload > 3.5) recommendations.push("Look for opportunities to automate grading or laboratory evaluation using digital tools.");
    if (data.sleep_physical_health > 3.5) recommendations.push("Establish a 'hard stop' time for academic work to ensure at least 7 hours of sleep.");
    if (data.work_life_balance > 3.5) recommendations.push("Set clear boundaries for WhatsApp/Email communication after college hours.");
    if (data.job_satisfaction > 3.5) recommendations.push("Seek new research collaborations or inter-departmental projects to regain enthusiasm.");
    
    if (recommendations.length === 0) recommendations.push("Maintain your current work-life balance and continue practicing healthy academic habits.");
    return recommendations;
  };

  return (
    <div className="min-h-screen py-32">
      <div className="container-1200 space-y-12">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <motion.span 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-primary font-bold tracking-widest uppercase text-sm"
            >
              Analysis Complete
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-extrabold text-white"
            >
              Your Burnout <span className="text-gradient">Report</span>
            </motion.h1>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/assessment')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all text-sm"
            >
              <RefreshCcw size={18} /> Retake
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="btn-primary py-3 px-6 text-sm"
            >
              <LayoutDashboard size={18} /> Dashboard
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Main Score Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-5 glass-card p-10 flex flex-col items-center justify-center text-center space-y-8"
          >
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-white/5"
                />
                <motion.circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  strokeDasharray={553}
                  initial={{ strokeDashoffset: 553 }}
                  animate={{ strokeDashoffset: 553 - (553 * burnoutIndex) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="text-primary"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-white">{burnoutIndex}%</span>
                <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Burnout Index</span>
              </div>
            </div>

            <div className={`px-6 py-3 rounded-2xl border ${risk.border} ${risk.bg} flex items-center gap-3`}>
              {risk.icon}
              <span className={`text-xl font-black uppercase tracking-tight ${risk.color}`}>{risk.level}</span>
            </div>

            <p className="text-text-muted text-sm leading-relaxed max-w-xs">
              This index represents your overall burnout vulnerability based on current teaching pressures and psychological stress.
            </p>
          </motion.div>

          {/* Radar Chart */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-7 glass-card p-8 md:p-10"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <TrendingUp className="text-primary" /> Stress Factors Radar
              </h3>
            </div>
            
            <div className="h-[400px] w-full flex items-center justify-center">
              <Radar 
                data={{
                  labels: ['Workload', 'Stress', 'Sleep', 'Balance', 'Satisfaction', 'Support'],
                  datasets: [
                    {
                      label: 'Burnout Factors',
                      data: [
                        data.teaching_workload,
                        data.mental_stress,
                        data.sleep_physical_health,
                        data.work_life_balance,
                        data.job_satisfaction,
                        data.institutional_support
                      ],
                      backgroundColor: 'rgba(99, 102, 241, 0.4)',
                      borderColor: '#6366f1',
                      borderWidth: 2,
                      pointBackgroundColor: '#6366f1',
                      pointBorderColor: '#fff',
                      pointHoverBackgroundColor: '#fff',
                      pointHoverBorderColor: '#6366f1',
                    },
                  ],
                }}
                options={{
                  scales: {
                    r: {
                      angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                      grid: { color: 'rgba(255, 255, 255, 0.1)' },
                      pointLabels: {
                        color: '#94a3b8',
                        font: { size: 13, weight: 'bold' }
                      },
                      ticks: { display: false },
                      suggestedMin: 0,
                      suggestedMax: 5
                    }
                  },
                  plugins: {
                    legend: { display: false },
                  },
                  maintainAspectRatio: false
                }}
              />
            </div>
          </motion.div>

          {/* Recommendations */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-12 glass-card p-10"
          >
            <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
              <CheckCircle className="text-primary" /> Personalized Recommendations
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getRecommendations().map((rec, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/5 flex gap-4 hover:border-primary/30 transition-all group">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <ArrowRight size={20} />
                  </div>
                  <p className="text-text-muted text-sm leading-relaxed font-medium group-hover:text-white transition-colors">
                    {rec}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default AssessmentResult;
