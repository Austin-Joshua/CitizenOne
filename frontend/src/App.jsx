import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import WorkspaceViews from './pages/WorkspaceViews';
import ProfilePage from './pages/ProfilePage';

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

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />

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
              <Route path="settings" element={<WorkspaceViews moduleKey="settings" />} />
              <Route path="admin" element={<WorkspaceViews moduleKey="admin" />} />
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
