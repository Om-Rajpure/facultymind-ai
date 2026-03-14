import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, CheckCircle2, AlertCircle, RefreshCcw, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const assessmentQuestions = [
  {
    category: "Teaching Workload",
    scenario: "On a typical day, you may conduct several theory lectures, lab sessions, and tutorials with minimal breaks between them.",
    question: "How many teaching sessions (lectures/labs) do you usually conduct per day?",
    options: [
      { label: "1–2 sessions", value: 1 },
      { label: "3–4 sessions", value: 2 },
      { label: "5–6 sessions", value: 4 },
      { label: "7+ sessions", value: 5 }
    ]
  },
  {
    category: "Teaching Workload",
    scenario: "Beyond classroom teaching, you are often responsible for evaluating hundreds of assignments, lab records, and project reports every week.",
    question: "How often do you find yourself taking evaluation work home to meet deadlines?",
    options: [
      { label: "Never", value: 1 },
      { label: "Rarely", value: 2 },
      { label: "Sometimes", value: 3 },
      { label: "Often", value: 4 },
      { label: "Always", value: 5 }
    ]
  },
  {
    category: "Teaching Workload",
    scenario: "Engineering faculty are expected to mentor students, guide final year projects, and handle administrative duties alongside teaching.",
    question: "How frequently do you feel that administrative tasks interfere with your primary teaching responsibilities?",
    options: [
      { label: "Never", value: 1 },
      { label: "Rarely", value: 2 },
      { label: "Sometimes", value: 3 },
      { label: "Often", value: 4 },
      { label: "Always", value: 5 }
    ]
  },
  {
    category: "Mental Stress",
    scenario: "During semester exams or project vivas, the pressure to maintain academic standards while managing large groups of students can be intense.",
    question: "How often do you feel mentally drained or 'empty' at the end of a college day?",
    options: [
      { label: "Never", value: 1 },
      { label: "Rarely", value: 2 },
      { label: "Sometimes", value: 3 },
      { label: "Often", value: 4 },
      { label: "Always", value: 5 }
    ]
  },
  {
    category: "Mental Stress",
    scenario: "Preparing for new subjects, staying updated with technology, and meeting research expectations requires constant mental effort.",
    question: "How frequently do you feel anxious about your ability to meet the department's performance expectations?",
    options: [
      { label: "Never", value: 1 },
      { label: "Rarely", value: 2 },
      { label: "Sometimes", value: 3 },
      { label: "Often", value: 4 },
      { label: "Always", value: 5 }
    ]
  },
  {
    category: "Mental Stress",
    scenario: "Some students may show lack of interest, while others may require constant support, which can be emotionally taxing for educators.",
    question: "How often do you feel frustrated or impatient when dealing with student-related issues?",
    options: [
      { label: "Never", value: 1 },
      { label: "Rarely", value: 2 },
      { label: "Sometimes", value: 3 },
      { label: "Often", value: 4 },
      { label: "Always", value: 5 }
    ]
  },
  {
    category: "Sleep & Physical Health",
    scenario: "Late-night preparation for the next day's 8 AM class or grading papers often cuts into your rest time.",
    question: "How many hours of quality sleep do you get on an average workday?",
    options: [
      { label: "8+ hours", value: 1 },
      { label: "7 hours", value: 2 },
      { label: "5-6 hours", value: 4 },
      { label: "Less than 5 hours", value: 5 }
    ]
  },
  {
    category: "Sleep & Physical Health",
    scenario: "Standing for long hours in labs and classrooms can lead to physical fatigue or chronic issues like back pain.",
    question: "How often do you experience physical symptoms like headaches or muscle tension due to work stress?",
    options: [
      { label: "Never", value: 1 },
      { label: "Rarely", value: 2 },
      { label: "Sometimes", value: 3 },
      { label: "Often", value: 4 },
      { label: "Always", value: 5 }
    ]
  },
  {
    category: "Sleep & Physical Health",
    scenario: "Busy schedules often lead to skipped meals or relying on canteen food instead of balanced nutrition.",
    question: "Do you feel that your physical energy levels are sufficient to perform your academic duties effectively?",
    options: [
      { label: "Always Energetic", value: 1 },
      { label: "Usually Fine", value: 2 },
      { label: "Often Tired", value: 4 },
      { label: "Chronically Fatigued", value: 5 }
    ]
  },
  {
    category: "Work-Life Balance",
    scenario: "Academic work often follows you home through WhatsApp groups, emails, and student queries even on weekends.",
    question: "How frequently do work-related notifications interrupt your personal or family time?",
    options: [
      { label: "Never", value: 1 },
      { label: "Rarely", value: 2 },
      { label: "Sometimes", value: 3 },
      { label: "Often", value: 4 },
      { label: "Always", value: 5 }
    ]
  },
  {
    category: "Work-Life Balance",
    scenario: "Major events like college fests, accreditation visits, or extra classes may require you to sacrifice personal holidays.",
    question: "How often have you had to miss important family events or social gatherings due to college work?",
    options: [
      { label: "Never", value: 1 },
      { label: "Rarely", value: 2 },
      { label: "Sometimes", value: 3 },
      { label: "Often", value: 4 },
      { label: "Always", value: 5 }
    ]
  },
  {
    category: "Work-Life Balance",
    scenario: "Finding time for hobbies or relaxation seems difficult when the semester is in full swing.",
    question: "How many hours per week do you dedicate to self-care or personal relaxation?",
    options: [
      { label: "10+ hours", value: 1 },
      { label: "5-10 hours", value: 2 },
      { label: "2-5 hours", value: 4 },
      { label: "Less than 2 hours", value: 5 }
    ]
  },
  {
    category: "Job Satisfaction",
    scenario: "You put in hard work to deliver quality education, but sometimes feel the salary and appraisals don't match the effort.",
    question: "How satisfied are you with your current salary and institutional recognition?",
    options: [
      { label: "Very Satisfied", value: 1 },
      { label: "Satisfied", value: 2 },
      { label: "Neutral", value: 3 },
      { label: "Dissatisfied", value: 4 },
      { label: "Very Dissatisfied", value: 5 }
    ]
  },
  {
    category: "Job Satisfaction",
    scenario: "After years in the same role, the repetitive nature of the curriculum might make the job feel stagnant.",
    question: "How often do you feel enthusiastic and excited about teaching your subjects?",
    options: [
      { label: "Always", value: 1 },
      { label: "Often", value: 2 },
      { label: "Sometimes", value: 3 },
      { label: "Rarely", value: 4 },
      { label: "Never", value: 5 }
    ]
  },
  {
    category: "Job Satisfaction",
    scenario: "The competitive nature of academia often creates pressure to constantly publish papers or get grants.",
    question: "How often do you feel that your work as an educator has a meaningful impact on students' lives?",
    options: [
      { label: "Always", value: 1 },
      { label: "Usually", value: 2 },
      { label: "Sometimes", value: 4 },
      { label: "Rarely/Never", value: 5 }
    ]
  },
  {
    category: "Institutional Support",
    scenario: "Dealing with departmental politics or lack of transparency in administration can add unnecessary hidden stress.",
    question: "How would you rate the level of transparency and support from your HOD or Management?",
    options: [
      { label: "Excellent", value: 1 },
      { label: "Good", value: 2 },
      { label: "Average", value: 3 },
      { label: "Poor", value: 4 },
      { label: "Very Polarized", value: 5 }
    ]
  },
  {
    category: "Institutional Support",
    scenario: "Conducting research or innovative labs requires proper infrastructure, funding, and timely approvals.",
    question: "How frequently do you feel that lack of resources (lab equipment/funding) hinders your work?",
    options: [
      { label: "Never", value: 1 },
      { label: "Rarely", value: 2 },
      { label: "Sometimes", value: 3 },
      { label: "Often", value: 4 },
      { label: "Always", value: 5 }
    ]
  },
  {
    category: "Institutional Support",
    scenario: "In times of personal emergency or work crisis, having supportive colleagues and clear policies makes a difference.",
    question: "How often do you feel that your institution cares about your mental and physical well-being?",
    options: [
      { label: "Always", value: 1 },
      { label: "Often", value: 2 },
      { label: "Sometimes", value: 3 },
      { label: "Rarely", value: 4 },
      { label: "Never", value: 5 }
    ]
  }
];

import axios from 'axios';
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
    // Generate feature scores
    const categories = [
      "Teaching Workload",
      "Mental Stress",
      "Sleep & Physical Health",
      "Work-Life Balance",
      "Job Satisfaction",
      "Institutional Support"
    ];

    const categoryScores = {};
    categories.forEach((cat, index) => {
      const catStartIndex = index * 3;
      const q1 = answers[catStartIndex] || 3;
      const q2 = answers[catStartIndex + 1] || 3;
      const q3 = answers[catStartIndex + 2] || 3;
      
      const avg = (q1 + q2 + q3) / 3;
      categoryScores[cat] = avg;
    });

    try {
      // Input for API:
      // { workload, stress, sleep, balance, satisfaction, support, age, experience, email }
      const payload = {
        workload: categoryScores["Teaching Workload"],
        stress: categoryScores["Mental Stress"],
        sleep: categoryScores["Sleep & Physical Health"],
        balance: categoryScores["Work-Life Balance"],
        satisfaction: categoryScores["Job Satisfaction"],
        support: categoryScores["Institutional Support"],
        age: user?.age || 35,
        experience: user?.experience || 10,
        email: user?.email
      };

      const response = await axios.post('http://localhost:8000/api/predict-burnout/', payload);
      
      // Store raw scores + prediction metadata in localStorage for results page
      const resultData = {
        ...response.data, // burnout_index, risk_level, factors
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
            <div className="glass-card p-10 md:p-12 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <AlertCircle size={80} className="text-primary" />
              </div>
              
              <div className="space-y-8 relative">
                <div className="space-y-2">
                  <span className="text-primary font-bold text-xs tracking-widest uppercase px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                    {currentQ.category}
                  </span>
                  <div className="pt-4 space-y-4">
                    <p className="text-text-muted italic leading-relaxed text-lg border-l-2 border-primary/30 pl-4">
                      "{currentQ.scenario}"
                    </p>
                    <h3 className="text-2xl font-bold text-white leading-tight">
                      {currentQ.question}
                    </h3>
                  </div>
                </div>

                <div className="grid gap-3">
                  {currentQ.options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleOptionSelect(opt.value)}
                      className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between group/opt ${
                        answers[currentStep] === opt.value
                        ? 'bg-primary/20 border-primary shadow-[0_0_20px_rgba(99,102,241,0.3)] scale-[1.02]'
                        : 'bg-white/5 border-white/10 hover:border-primary/50 hover:bg-white/10'
                      }`}
                    >
                      <span className={`font-semibold ${answers[currentStep] === opt.value ? 'text-white' : 'text-text-muted group-hover/opt:text-white'}`}>
                        {opt.label}
                      </span>
                      {answers[currentStep] === opt.value && (
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
