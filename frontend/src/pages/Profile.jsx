import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Briefcase, Calendar } from 'lucide-react';

const Profile = () => {
    const { user } = useAuth();

    if (!user) return null;

    const profileItems = [
        { icon: <User size={20} />, label: 'Full Name', value: user.name || 'Not provided' },
        { icon: <Mail size={20} />, label: 'Email Address', value: user.email },
        { icon: <Shield size={20} />, label: 'Role', value: user.role === 'admin' ? 'Administrator' : 'Faculty/Teacher' },
        { icon: <Briefcase size={20} />, label: 'Workspace', value: user.workspace_name || 'Individual (None)' },
        { icon: <Calendar size={20} />, label: 'Joined', value: user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently' }
    ];

    return (
        <section className="min-h-screen pt-24 pb-16">
            <div className="container-1200">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto"
                >
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-extrabold text-white mb-2">Your Profile</h1>
                        <p className="text-text-muted">Manage your account and institutional settings</p>
                    </div>

                    <div className="glass-card p-8 md:p-10 space-y-8">
                        <div className="flex items-center gap-6 pb-6 border-b border-white/10">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-glow">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">{user.name}</h2>
                                <p className="text-primary text-sm uppercase tracking-wider font-semibold">{user.role}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {profileItems.map((item, index) => (
                                <div key={index} className="space-y-1">
                                    <div className="flex items-center gap-2 text-text-muted text-xs uppercase tracking-widest font-bold">
                                        {item.icon}
                                        {item.label}
                                    </div>
                                    <p className="text-white font-medium pl-7">{item.value}</p>
                                </div>
                            ))}
                        </div>

                        <div className="pt-6 border-t border-white/10 flex justify-end">
                            <button disabled className="btn-secondary opacity-50 cursor-not-allowed">
                                Edit Profile (Coming Soon)
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

export default Profile;
