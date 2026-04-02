import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, RefreshCcw, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const assessmentQuestions = [
  {
    id: "workload",
    category: "Workload",
    question: "How many teaching sessions do you usually conduct per day?",
    options: ["1-2", "3-4", "5-6", "7+"]
  },
  {
    id: "stress",
    category: "Stress",
    question: "How often do you feel stressed or overwhelmed due to work?",
    options: ["Rarely", "Sometimes", "Often", "Always"]
  },
  {
    id: "sleep",
    category: "Sleep",
    question: "How would you rate your sleep quality?",
    options: ["Very good", "Good", "Poor", "Very poor"]
  },
  {
    id: "balance",
    category: "Work-Life Balance",
    question: "How well are you able to maintain work-life balance?",
    options: ["Very well", "Manageable", "Difficult", "Very difficult"]
  },
  {
    id: "satisfaction",
    category: "Job Satisfaction",
    question: "How satisfied are you with your job currently?",
    options: ["Very satisfied", "Neutral", "Dissatisfied", "Very dissatisfied"]
  },
  {
    id: "support",
    category: "Institutional Support",
    question: "Do you feel supported by your institution/colleagues?",
    options: ["Strongly supported", "Moderately supported", "Slightly supported", "Not supported"]
  }
];

import api from '../api/axios';
import { useAuth } from '../context/AuthContext';


const Assessment = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleOptionSelect = (value) => {
    setAnswers({ ...answers, [currentStep]: value });
  };

  const nextStep = () => {
    if (currentStep < assessmentQuestions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    const mapping = {
      workload: { "1-2": 1, "3-4": 2, "5-6": 3, "7+": 4 },
      stress: { "Rarely": 1, "Sometimes": 2, "Often": 3, "Always": 4 },
      sleep: { "Very good": 1, "Good": 2, "Poor": 3, "Very poor": 4 },
      balance: { "Very well": 1, "Manageable": 2, "Difficult": 3, "Very difficult": 4 },
      satisfaction: { "Very satisfied": 1, "Neutral": 2, "Dissatisfied": 3, "Very dissatisfied": 4 },
      support: { "Strongly supported": 1, "Moderately supported": 2, "Slightly supported": 3, "Not supported": 4 }
    };

    const getScore = (index) => {
      const question = assessmentQuestions[index];
      const answer = answers[index];
      return mapping[question.id][answer];
    };

    try {
      const payload = {
        workload: getScore(0),
        stress: getScore(1),
        sleep: getScore(2),
        balance: getScore(3),
        satisfaction: getScore(4),
        support: getScore(5),
        age: user?.age || 35,
        experience: user?.experience || 10
      };

      const response = await api.post('/api/predict-burnout/', payload);
      
      const resultData = {
        ...response.data,
        teaching_workload: payload.workload,
        mental_stress: payload.stress,
        sleep_physical_health: payload.sleep,
        work_life_balance: payload.balance,
        job_satisfaction: payload.satisfaction,
        institutional_support: payload.support
      };

      localStorage.setItem('last_assessment_result', JSON.stringify(resultData));
      navigate('/assessment-result');
    } catch (error) {
      console.error("Prediction failed:", error);
      alert("Something went wrong with the AI prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const progress = ((currentStep + 1) / assessmentQuestions.length) * 100;
  const currentQ = assessmentQuestions[currentStep];
  const isSelected = answers[currentStep] !== undefined;

  return (
    <div className="min-h-screen py-32 flex flex-col items-center">
      <div className="container-1200 w-full flex flex-col items-center relative">
        {/* Exit Button */}
        <button 
          onClick={() => navigate('/dashboard')}
          className="absolute top-0 right-0 md:right-8 p-2 text-text-muted hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all border border-white/10 z-20 group"
          title="Exit Assessment"
        >
          <X size={18} className="group-hover:rotate-90 transition-transform duration-300" />
        </button>

        
        {/* Progress Header */}
        <div className="w-full max-w-2xl mb-12 space-y-4">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <span className="text-primary font-bold text-sm tracking-widest uppercase">Assessment Progress</span>
              <h2 className="text-white text-2xl font-bold">Step {currentStep + 1} of {assessmentQuestions.length}</h2>
            </div>
            <span className="text-text-muted font-bold">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              className="h-full bg-gradient-to-r from-primary to-secondary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 50, damping: 15 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-2xl"
          >
            <div className="glass-card p-6 sm:p-10 md:p-12 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10 hidden sm:block">
                <AlertCircle size={80} className="text-primary" />
              </div>
              
              <div className="space-y-8 relative">
                <div className="space-y-2">
                  <span className="text-primary font-bold text-xs tracking-widest uppercase px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                    {currentQ.category}
                  </span>
                  <div className="pt-4 space-y-4">
                    <h3 className="text-2xl font-bold text-white leading-tight">
                      {currentQ.question}
                    </h3>
                  </div>
                </div>

                <div className="grid gap-3">
                  {currentQ.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleOptionSelect(opt)}
                      className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between group/opt ${
                        answers[currentStep] === opt
                        ? 'bg-primary/20 border-primary shadow-[0_0_20px_rgba(99,102,241,0.3)] scale-[1.02]'
                        : 'bg-white/5 border-white/10 hover:border-primary/50 hover:bg-white/10'
                      }`}
                    >
                      <span className={`font-semibold ${answers[currentStep] === opt ? 'text-white' : 'text-text-muted group-hover/opt:text-white'}`}>
                        {opt}
                      </span>
                      {answers[currentStep] === opt && (
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                        >
                          <CheckCircle2 size={14} className="text-white" />
                        </motion.div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="w-full max-w-2xl mt-8 flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className={`flex items-center gap-2 font-bold px-6 py-3 rounded-xl transition-all ${
              currentStep === 0 
              ? 'opacity-0 pointer-events-none' 
              : 'text-text-muted hover:text-white hover:bg-white/5'
            }`}
          >
            <ChevronLeft size={20} /> Previous
          </button>

          <button
            onClick={nextStep}
            disabled={!isSelected || loading}
            className={`btn-primary px-10 ${(!isSelected || loading) ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
          >
            {loading ? 'Calculating...' : (currentStep === assessmentQuestions.length - 1 ? 'Submit Assessment' : 'Next Question')}
            {loading ? <RefreshCcw className="animate-spin" size={20} /> : (currentStep === assessmentQuestions.length - 1 ? <CheckCircle2 size={20} /> : <ChevronRight size={20} />)}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Assessment;
