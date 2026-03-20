import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import WorkspaceViews from './pages/WorkspaceViews';
import ProfilePage from './pages/ProfilePage';
import BillingPage from './pages/BillingPage';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-base">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-primary/20 border-t-accent-primary" />
        <p className="mt-4 text-[10px] font-medium uppercase tracking-wider text-secondary">
          Loading
        </p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const PublicHome = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/app/dashboard" replace />;
  return <LandingPage />;
};

const PremiumRoute = ({ children }) => {
  const { user } = useAuth();
  if (user?.plan === 'premium' || user?.role === 'admin') return children;
  return <Navigate to="/app/subscription" replace />;
};

const RoleRoute = ({ roles, children }) => {
  const { user } = useAuth();
  if (roles.includes(user?.role)) return children;
  return <Navigate to="/app/dashboard" replace />;
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PublicHome />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="navigator" element={<WorkspaceViews moduleKey="navigator" />} />
              <Route path="benefits" element={<WorkspaceViews moduleKey="benefits" />} />
              <Route path="opportunities" element={<WorkspaceViews moduleKey="opportunities" />} />
              <Route path="vault" element={<WorkspaceViews moduleKey="vault" />} />
              <Route path="alerts" element={<WorkspaceViews moduleKey="alerts" />} />
              <Route path="assistant" element={<WorkspaceViews moduleKey="assistant" />} />
              <Route path="inclusion" element={<WorkspaceViews moduleKey="inclusion" />} />
              <Route
                path="recommendations"
                element={<PremiumRoute><WorkspaceViews moduleKey="recommendations" /></PremiumRoute>}
              />
              <Route
                path="career"
                element={<PremiumRoute><WorkspaceViews moduleKey="career" /></PremiumRoute>}
              />
              <Route path="support" element={<WorkspaceViews moduleKey="support" />} />
              <Route path="emergency" element={<WorkspaceViews moduleKey="emergency" />} />
              <Route path="offline" element={<WorkspaceViews moduleKey="offline" />} />
              <Route path="integrations" element={<WorkspaceViews moduleKey="integrations" />} />
              <Route path="progress" element={<WorkspaceViews moduleKey="progress" />} />
              <Route path="analytics" element={<WorkspaceViews moduleKey="analytics" />} />
              <Route path="settings" element={<WorkspaceViews moduleKey="settings" />} />
              <Route path="subscription" element={<BillingPage />} />
              <Route
                path="admin"
                element={<RoleRoute roles={['admin', 'organization']}><WorkspaceViews moduleKey="admin" /></RoleRoute>}
              />
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
