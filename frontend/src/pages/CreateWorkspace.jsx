import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Building2, ArrowRight, Copy, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CreateWorkspace = () => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [workspace, setWorkspaceData] = useState(null);
  const [copied, setCopied] = useState(false);
  const { setWorkspace } = useAuth();
  const navigate = useNavigate();


  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log("Creating workspace:", name, "API URL:", import.meta.env.VITE_API_URL);
    try {
      const response = await api.post('/api/accounts/workspace/create/', 
        { name }
      );
      console.log("Workspace created successfully:", response.data);
      setWorkspaceData(response.data);
      // Update global context with workspace ID
      setWorkspace(response.data.workspace_id);
    } catch (error) {
      console.error('Error creating workspace:', error);
      if (error.response) {
        console.log("Backend error details:", error.response.data);
      }
      alert('Failed to create workspace. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(workspace.join_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4 py-12 pt-24">
      <div className="max-w-md w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 text-center"
        >
          {!workspace ? (
            <>
              <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Building2 className="text-blue-400 w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Create Workspace</h2>
              <p className="text-slate-400 mb-8">
                Set up your institution's private workspace. You'll get a join code for your faculty.
              </p>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="text-left">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Institution Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-500"
                    placeholder="e.g. AIDS of DMCE"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/20 transform active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {loading ? 'Creating...' : (
                    <>
                      Set Up Institutional Workspace
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="text-green-400 w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Workspace Ready!</h2>
              <p className="text-slate-400 mb-8">
                Share this unique code with your faculty members so they can join **{workspace.name}**.
              </p>

              <div className="bg-slate-900/50 border border-slate-700 rounded-2xl p-6 mb-8 flex flex-col items-center justify-center gap-4">
                <span className="text-4xl font-mono font-black text-white tracking-[0.2em]">
                  {workspace.join_code}
                </span>
                <button
                  onClick={copyCode}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-2 text-sm transition-colors"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy Code'}
                </button>
              </div>

              <button
                onClick={() => navigate('/admin-dashboard')}
                className="w-full py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100 transition-colors"
              >
                Go to Admin Dashboard
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default CreateWorkspace;
