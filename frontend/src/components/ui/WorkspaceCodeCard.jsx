import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, Eye, EyeOff } from 'lucide-react';

const WorkspaceCodeCard = ({ joinCode }) => {
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className="glass-card px-4 py-2 border border-white/10 bg-white/5 backdrop-blur-md rounded-2xl flex items-center gap-4 hover:border-primary/30 transition-all duration-300 shadow-lg hover:shadow-primary/5">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Join Code</span>
          <div className="flex items-center gap-2">
            <AnimatePresence mode="wait">
              {showCode ? (
                <motion.span
                  key="code"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-lg font-mono font-bold text-white tracking-widest"
                >
                  {joinCode}
                </motion.span>
              ) : (
                <motion.span
                  key="hidden"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="text-lg font-mono font-bold text-text-muted/30 tracking-widest"
                >
                  ••••••••
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-1 border-l border-white/10 pl-4 ml-auto">
          <button
            onClick={() => setShowCode(!showCode)}
            className="p-2 text-text-muted hover:text-white hover:bg-white/5 rounded-xl transition-all"
            title={showCode ? "Hide Code" : "View Code"}
          >
            {showCode ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          
          <button
            onClick={handleCopy}
            className={`p-2 rounded-xl transition-all ${
              copied ? 'text-emerald-400 bg-emerald-500/10' : 'text-text-muted hover:text-white hover:bg-white/5'
            }`}
            title="Copy Code"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-lg shadow-xl"
          >
            Copied!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkspaceCodeCard;
