import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { User, Briefcase, Building2, Calendar, Award } from 'lucide-react';


const ProfileSetup = () => {
  const { user, tokens, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.first_name || user?.username || '',
    age: user?.age || '',
    department: user?.department || '',
    experience: user?.experience || '',
    institution: user?.institution || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/api/accounts/setup-profile/', formData);
      console.log("AUTH FLOW: profile setup complete", formData);
      updateProfile(formData);
      
      // Redirect based on role to the appropriate workspace page
      if (user?.role === 'admin') {
        navigate('/create-workspace');
      } else {
        navigate('/join-workspace');
      }
    } catch (error) {
      console.error("Profile setup failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full bg-white/5 border border-white/10 rounded-xl px-12 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all placeholder:text-text-muted/50";
  const iconClasses = "absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary transition-colors w-5 h-5";

  return (
    <section className="min-h-screen pt-32 pb-24 flex items-center justify-center">
      <div className="container-1200">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 space-y-3"
          >
            <h1 className="text-4xl font-extrabold text-white">Complete Your <span className="text-gradient">Profile</span></h1>
            <p className="text-text-muted">Tell us more about your academic role to power our ML predictions.</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-10 md:p-12"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2 group relative">
                  <label className="text-sm font-bold text-text-muted ml-1">Full Name</label>
                  <div className="relative">
                    <User className={iconClasses} />
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="e.g. John Doe"
                      className={inputClasses}
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Age */}
                <div className="space-y-2 group relative">
                  <label className="text-sm font-bold text-text-muted ml-1">Age</label>
                  <div className="relative">
                    <Calendar className={iconClasses} />
                    <input
                      type="number"
                      name="age"
                      required
                      placeholder="e.g. 35"
                      className={inputClasses}
                      value={formData.age}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Department */}
                <div className="space-y-2 group relative">
                  <label className="text-sm font-bold text-text-muted ml-1">Department</label>
                  <div className="relative">
                    <Briefcase className={iconClasses} />
                    <input
                      type="text"
                      name="department"
                      required
                      placeholder="e.g. Computer Science"
                      className={inputClasses}
                      value={formData.department}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Experience */}
                <div className="space-y-2 group relative">
                  <label className="text-sm font-bold text-text-muted ml-1">Years of Experience</label>
                  <div className="relative">
                    <Award className={iconClasses} />
                    <input
                      type="number"
                      name="experience"
                      required
                      placeholder="e.g. 10"
                      className={inputClasses}
                      value={formData.experience}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {/* Institution */}
              <div className="space-y-2 group relative">
                <label className="text-sm font-bold text-text-muted ml-1">Institution Name</label>
                <div className="relative">
                  <Building2 className={iconClasses} />
                  <input
                    type="text"
                    name="institution"
                    required
                    placeholder="e.g. Global Institute of Technology"
                    className={inputClasses}
                    value={formData.institution}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="pt-6">
                <button type="submit" disabled={loading} className="w-full btn-primary justify-center py-5 text-lg disabled:opacity-50">
                  {loading ? 'Saving...' : 'Continue to Dashboard'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ProfileSetup;
