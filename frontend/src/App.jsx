import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PlaceholderPage from './pages/PlaceholderPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen bg-base flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-accent-primary/20 border-t-accent-primary rounded-full animate-spin"></div>
      <p className="text-xs font-bold uppercase tracking-widest text-secondary mt-6">Initializing Secure Connection</p>
    </div>
  );
  
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Entry */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            
            {/* Protected SaaS App */}
            <Route path="/app" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              
              {/* Sidebar Placeholder Routes */}
              <Route path="navigator" element={<PlaceholderPage title="Life Navigator" />} />
              <Route path="benefits" element={<PlaceholderPage title="Benefit Discovery" />} />
              <Route path="opportunities" element={<PlaceholderPage title="Opportunity Engine" />} />
              <Route path="vault" element={<PlaceholderPage title="Identity Vault" />} />
              <Route path="alerts" element={<PlaceholderPage title="Smart Alerts" />} />
              <Route path="settings" element={<PlaceholderPage title="Accessibility settings" />} />
              <Route path="admin" element={<PlaceholderPage title="Admin Hub" />} />
              
              <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
