import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, RefreshCw, Download } from 'lucide-react';
import RadarChart from './RadarChart';

const Dashboard = ({ assessmentData }) => {
  // Mock data if none provided
  const data = assessmentData || {
    burnout_index: 74.5,
    risk_level: 'High',
    factors: {
      workload: 4.2,
      stress: 4.5,
      sleep: 2.1,
      work_life_balance: 1.8,
      job_satisfaction: 3.2,
      institutional_support: 2.5
    }
  };

  const factorValues = [
    data.factors.workload,
    data.factors.stress,
    data.factors.sleep,
    data.factors.work_life_balance,
    data.factors.job_satisfaction,
    data.factors.institutional_support
  ];

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
    <div className="space-y-12 py-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-gradient">Your Burnout Analysis</h1>
          <p className="text-text-muted mt-2">Personalized insights based on your recent assessment.</p>
        </div>
        <div className="flex gap-4">
          <button className="text-text-muted hover:text-white transition-colors flex items-center gap-2 px-4 py-2 border border-glass-border rounded-xl">
            <Download size={18} /> Export PDF
          </button>
          <button onClick={() => window.location.reload()} className="btn-primary">
            <RefreshCw size={18} /> Retake Test
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-1 glass-card p-8 flex flex-col items-center justify-center text-center space-y-6"
        >
          <h3 className="text-xl font-semibold">Burnout Index</h3>
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96" cy="96" r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                className="text-glass"
              />
              <motion.circle
                cx="96" cy="96" r="88"
                stroke="currentColor"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={552.92}
                initial={{ strokeDashoffset: 552.92 }}
                animate={{ strokeDashoffset: 552.92 - (552.92 * data.burnout_index) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="text-primary"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold">{Math.round(data.burnout_index)}</span>
              <span className="text-text-muted text-sm">/ 100</span>
            </div>
          </div>
          
          <div className={`px-6 py-2 rounded-full border ${getRiskBg(data.risk_level)} ${getRiskColor(data.risk_level)} font-bold flex items-center gap-2`}>
            {data.risk_level === 'High' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
            {data.risk_level} Risk Level
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 glass-card p-8"
        >
          <h3 className="text-xl font-semibold mb-6">Factor Visualization</h3>
          <div className="h-80">
            <RadarChart data={factorValues} />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-8"
        >
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2 italic">
            <Info className="text-secondary" /> Key Contributing Factors
          </h3>
          <div className="space-y-4">
            {Object.entries(data.factors)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 3)
              .map(([key, value], idx) => (
                <div key={key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                  <span className="capitalize">{key.replace(/_/g, ' ')}</span>
                  <div className="flex items-center gap-4">
                    <div className="h-2 w-32 bg-glass rounded-full overflow-hidden">
                      <div className="h-full bg-accent" style={{ width: `${(value/5)*100}%` }}></div>
                    </div>
                    <span className="font-bold">{value.toFixed(1)}</span>
                  </div>
                </div>
              ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-8"
        >
          <h3 className="text-xl font-semibold mb-6">Personalized Recommendations</h3>
          <ul className="space-y-4">
            <li className="flex gap-4 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="bg-primary/20 p-2 rounded-lg h-10 w-10 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-primary">01</span>
              </div>
              <p className="text-sm">Consider delegating non-academic administrative tasks to focus on research and student engagement.</p>
            </li>
            <li className="flex gap-4 p-4 rounded-xl bg-secondary/5 border border-secondary/10">
              <div className="bg-secondary/20 p-2 rounded-lg h-10 w-10 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-secondary">02</span>
              </div>
              <p className="text-sm">Implement a 'no-work' zone after 7 PM to improve your overall sleep quality and mental recovery.</p>
            </li>
            <li className="flex gap-4 p-4 rounded-xl bg-accent/5 border border-accent/10">
              <div className="bg-accent/20 p-2 rounded-lg h-10 w-10 flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-accent">03</span>
              </div>
              <p className="text-sm">Schedule a meeting with your HOD to discuss lab resource requirements and workload distribution.</p>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
