import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { UserPlus, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const JoinWorkspace = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setWorkspace, tokens } = useAuth();
  const navigate = useNavigate();

  const handleJoin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/accounts/workspace/join/`, 
        { join_code: code },
        { headers: { Authorization: `Bearer ${tokens.access}` } }
      );
      setWorkspace({ id: response.data.workspace, name: response.data.workspace_name });
      navigate('/dashboard');
    } catch (err) {
      console.error('Error joining workspace:', err);
      setError(err.response?.data?.error || 'Invalid join code. Please check and try again.');
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
              {error && (
                <p className="mt-2 text-red-400 text-sm flex items-center gap-1">
                   {error}
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
              {loading ? 'Verifying...' : (
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
        </motion.div>
      </div>
    </div>
  );
};

export default JoinWorkspace;
