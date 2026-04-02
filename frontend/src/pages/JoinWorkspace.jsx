import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { UserPlus, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const JoinWorkspace = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const { setWorkspace } = useAuth();
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    // 4. FRONTEND FIX: Normalize input before sending
    const cleanedCode = code.trim().toUpperCase();
    
    try {
      // 4. FRONTEND FIX: Send request with normalized code and correct endpoint
      const response = await api.post('/api/workspaces/join/', 
        { join_code: cleanedCode }
      );
      
      console.log("JOIN SUCCESS:", response.data);
      
      // Update workspace state with the response data
      setWorkspace({ name: response.data.workspace });
      
      // Trigger success UI
      setSuccess(true);
      
      // 6. SMOOTH REDIRECT UX: Delay redirect by 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      // 5. ERROR HANDLING: Console log the error response
      console.error("JOIN ERROR:", err.response?.data || err.message);
      setErrorMsg('Invalid workspace code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4 py-12 pt-24">
      <div className="max-w-md w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 text-center"
        >
          {success ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center justify-center space-y-6 py-12"
            >
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
                className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center"
              >
                <span className="text-green-400 text-3xl">✓</span>
              </motion.div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white">
                  Joined Successfully!
                </h2>
                <p className="text-slate-400 text-center max-w-md">
                  You are now part of the workspace. Redirecting you to your dashboard...
                </p>
              </div>

              <div className="flex gap-1">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }} 
                  transition={{ repeat: Infinity, duration: 1 }} 
                  className="w-2 h-2 bg-green-500 rounded-full" 
                />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }} 
                  transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} 
                  className="w-2 h-2 bg-green-500 rounded-full" 
                />
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }} 
                  transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} 
                  className="w-2 h-2 bg-green-500 rounded-full" 
                />
              </div>
            </motion.div>
          ) : (
            <>
              <div className="w-16 h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <UserPlus className="text-purple-400 w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Join Institution</h2>
              <p className="text-slate-400 mb-8">
                Enter the 8-character join code provided by your department head or administrator.
              </p>

              <form onSubmit={handleJoin} className="space-y-4">
                <div className="text-left">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Join Code</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    maxLength={8}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white font-mono text-center text-2xl tracking-[0.2em] focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-slate-600"
                    placeholder="XXXXXXXX"
                  />
                  {errorMsg && (
                    <p className="mt-2 text-red-400 text-sm flex items-center gap-1">
                       {errorMsg}
                    </p>
                  )}
                </div>

                <div className="bg-slate-800/30 rounded-xl p-4 mb-6 flex items-start gap-3 text-left">
                  <ShieldCheck className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Joining a workspace allows your administrator to view your anonymised burnout patterns and offer institutional support.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || code.length < 8}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:active:scale-100"
                >
                  {loading ? 'Joining...' : (
                    <>
                      Join Workspace
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-8 text-sm text-slate-500">
                Don't have a code? Contact your HOD.
              </p>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default JoinWorkspace;
