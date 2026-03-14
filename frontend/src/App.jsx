import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import MainLayout from './components/layout/MainLayout.jsx';
import LandingPage from './pages/LandingPage.jsx';
import Login from './pages/Login.jsx';
import RoleSelection from './pages/RoleSelection.jsx';
import ProfileSetup from './pages/ProfileSetup.jsx';
import Dashboard from './pages/Dashboard.jsx';
import AssessmentResult from './pages/AssessmentResult.jsx';
import Assessment from './components/Assessment.jsx';
import Chatbot from './pages/Chatbot.jsx';
import ChatWidget from './components/ChatWidget.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminAI from './pages/AdminAI.jsx';
import CreateWorkspace from './pages/CreateWorkspace.jsx';
import JoinWorkspace from './pages/JoinWorkspace.jsx';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  
  // If user has no workspace, redirect to setup/join (except if they are on those pages)
  const isWorkspaceSetup = window.location.pathname === '/create-workspace' || window.location.pathname === '/join-workspace';
  if (!user.workspace && !isWorkspaceSetup) {
    return user.role === 'admin' ? <Navigate to="/create-workspace" /> : <Navigate to="/join-workspace" />;
  }
  
  return children;
};

const AdminProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" />;
  
  if (!user.workspace && window.location.pathname !== '/create-workspace') {
    return <Navigate to="/create-workspace" />;
  }
  
  return children;
};

function AppContent() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        
        {/* Workspace Setup */}
        <Route 
          path="/create-workspace" 
          element={
            <ProtectedRoute>
              <CreateWorkspace />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/join-workspace" 
          element={
            <ProtectedRoute>
              <JoinWorkspace />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/select-role" 
          element={
            <ProtectedRoute>
              <RoleSelection />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/profile-setup" 
          element={
            <ProtectedRoute>
              <ProfileSetup />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/assessment" 
          element={
            <ProtectedRoute>
              <Assessment />
            </ProtectedRoute>
          } 
        />

        <Route 
          path="/assessment-result" 
          element={
            <ProtectedRoute>
              <AssessmentResult />
            </ProtectedRoute>
          } 
        />

        <Route
          path="/chatbot"
          element={
            <ProtectedRoute>
              <Chatbot />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route 
          path="/admin-dashboard" 
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin-analytics" 
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin-faculty" 
          element={
            <AdminProtectedRoute>
              <AdminDashboard />
            </AdminProtectedRoute>
          } 
        />
        <Route 
          path="/admin-ai" 
          element={
            <AdminProtectedRoute>
              <AdminAI />
            </AdminProtectedRoute>
          } 
        />
      </Routes>
      <ChatWidget />
    </MainLayout>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
