import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  UserCheck, 
  UserMinus, 
  LayoutDashboard, 
  Search, 
  Filter, 
  MoreVertical, 
  AlertTriangle,
  Building2,
  Trash2,
  Eye,
  MessageSquare,
  Loader2,
  Shield,
  Copy,
  Check
} from 'lucide-react';
import axios from 'axios';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card p-6 border border-white/10 flex items-center gap-4"
  >
    <div className={`p-3 rounded-xl bg-${color}/20 text-${color}`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-text-muted text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-white">{value}</h3>
    </div>
  </motion.div>
);

const SuperAdminDashboard = () => {
  const { user, tokens } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeachers: 0,
    totalAdmins: 0,
    totalWorkspaces: 0
  });

  useEffect(() => {
    if (!tokens || !tokens.access) {
      console.log("⛔ Tokens not ready (SuperAdminDashboard)");
      return;
    }

    console.log("✅ Tokens ready, calling superadmin API");
    fetchUsers();
  }, [tokens]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      console.log("API URL:", API_BASE_URL);
      const response = await axios.get(`${API_BASE_URL}/accounts/superadmin/users/`, {
        headers: { Authorization: `Bearer ${tokens.access}` }
      });
      console.log("Super Admin Users Data:", response.data);
      
      const userData = Array.isArray(response.data) ? response.data : [];
      setUsers(userData);
      
      // Calculate stats
      const workspaces = new Set(userData.map(u => u.workspace || 'N/A')).size;
      const statsObj = {
        totalUsers: userData.length,
        totalTeachers: userData.filter(u => u.role === 'teacher').length,
        totalAdmins: userData.filter(u => u.role === 'admin').length,
        totalWorkspaces: workspaces
      };
      console.log("Calculated Stats:", statsObj);
      setStats(statsObj);
    } catch (err) {
      console.error("Error fetching superadmin users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    
    try {
      console.log("Deleting user:", userId);
      await axios.delete(`${API_BASE_URL}/accounts/superadmin/delete-user/${userId}/`, {
        headers: { Authorization: `Bearer ${tokens.access}` }
      });
      
      // Update local state
      setUsers(prev => prev.filter(user => user.id !== userId));
      
      // Update stats based on the new users array
      setUsers(prevUsers => {
        const workspaces = new Set(prevUsers.map(u => u.workspace || 'N/A')).size;
        setStats({
          totalUsers: prevUsers.length,
          totalTeachers: prevUsers.filter(u => u.role === 'teacher').length,
          totalAdmins: prevUsers.filter(u => u.role === 'admin').length,
          totalWorkspaces: workspaces
        });
        return prevUsers;
      });

      alert("User deleted successfully");
    } catch (err) {
      console.error("Delete error:", err.response);
      alert(err.response?.data?.error || "Failed to delete user");
    }
  };

  const filteredUsers = users.filter(user => {
    const name = user.name || 'Unknown';
    const workspaceCode = user.workspace_code || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         workspaceCode.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'All') return matchesSearch;
    if (filter === 'Teachers') return matchesSearch && user.role === 'teacher';
    if (filter === 'Admins') return matchesSearch && user.role === 'admin';
    if (filter === 'High Risk') return matchesSearch && user.risk_level === 'High';
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 bg-background">
      <div className="container-1200 mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Platform Control</h1>
            <p className="text-text-muted">Manage all users and workspaces across FacultyMind AI.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchUsers}
              className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg border border-white/10 transition-all text-sm font-medium flex items-center gap-2"
            >
              <LayoutDashboard size={16} />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Users" value={stats.totalUsers} icon={Users} color="primary" />
          <StatCard title="Teachers" value={stats.totalTeachers} icon={UserCheck} color="blue-400" />
          <StatCard title="Admins" value={stats.totalAdmins} icon={Shield} color="purple-400" />
          <StatCard title="Workspaces" value={stats.totalWorkspaces} icon={Building2} color="orange-400" />
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted group-focus-within:text-primary transition-colors">
              <Search size={18} />
            </div>
            <input 
              type="text" 
              placeholder="Search users or workspaces..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all"
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {['All', 'Teachers', 'Admins', 'High Risk'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  filter === f 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'bg-white/5 text-text-muted hover:bg-white/10 border border-white/5'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="glass-card border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                  <th className="px-6 py-4 text-sm font-semibold text-white">Name</th>
                  <th className="px-6 py-4 text-sm font-semibold text-white">Role</th>
                  <th className="px-6 py-4 text-sm font-semibold text-white">Workspace Code</th>
                  <th className="px-6 py-4 text-sm font-semibold text-white">Department</th>
                  <th className="px-6 py-4 text-sm font-semibold text-white">Risk</th>
                  <th className="px-6 py-4 text-sm font-semibold text-white">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <motion.tr 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      key={user.id} 
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                            {(user.name || 'U').charAt(0)}
                          </div>
                          <span className="text-white font-medium">{user.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          user.role === 'admin' 
                            ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        }`}>
                          {user.role || 'No Role'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.workspace_code ? (
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-lg bg-primary/10 text-primary text-sm font-mono border border-primary/20">
                              {user.workspace_code}
                            </span>
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(user.workspace_code);
                                // Optional: simple alert or local state for feedback
                              }}
                              className="p-1 hover:bg-white/10 rounded text-text-muted hover:text-primary transition-colors"
                              title="Copy Code"
                            >
                              <Copy size={14} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-text-muted">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-text-muted text-sm">{user.department || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-1.5 text-sm font-medium ${
                          user.risk_level === 'High' ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {user.risk_level === 'High' && <AlertTriangle size={14} />}
                          {user.risk_level}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 hover:bg-white/10 rounded-md text-text-muted hover:text-white transition-colors" title="View Details">
                            <Eye size={16} />
                          </button>
                          <button className="p-1.5 hover:bg-white/10 rounded-md text-text-muted hover:text-primary transition-colors" title="Message">
                            <MessageSquare size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1.5 hover:bg-red-500/20 rounded-md text-text-muted hover:text-red-400 transition-colors" 
                            title="Remove User"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-20 text-center text-text-muted">
                      No users found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
