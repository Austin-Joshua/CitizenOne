import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useI18n } from './context/I18nContext';
import PublicLayout from './components/layout/PublicLayout';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AccountRecoveryPage from './pages/AccountRecoveryPage';
import SignupPage from './pages/SignupPage';

const DashboardLayout = lazy(() => import('./components/layout/DashboardLayout'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const WorkspaceViews = lazy(() => import('./pages/WorkspaceViews'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const BillingPage = lazy(() => import('./pages/BillingPage'));
const ServiceRequestsPage = lazy(() => import('./pages/ServiceRequestsPage'));
const LifeEventNavigatorPage = lazy(() => import('./pages/LifeEventNavigatorPage'));
const BureaucracyAIPage = lazy(() => import('./pages/BureaucracyAIPage'));

const ProtectedRoute = ({ children }) => {
  const { t } = useI18n();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-canvas">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-accent-primary/20 border-t-accent-primary"
          aria-hidden
        />
        <p className="mt-4 text-[10px] font-medium uppercase tracking-wider text-secondary">{t('app.loadingSession')}</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const PublicHome = () => {
  const { t } = useI18n();
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-canvas">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-accent-primary/20 border-t-accent-primary"
          aria-hidden
        />
        <p className="mt-4 text-[10px] font-medium uppercase tracking-wider text-secondary">{t('app.loading')}</p>
      </div>
    );
  }
  if (user) return <Navigate to="/app/dashboard" replace />;
  return <LandingPage />;
};

const PremiumRoute = ({ children }) => {
  const { user } = useAuth();
  if (user?.plan === 'premium' || user?.role === 'admin' || user?.role === 'staff') return children;
  return <Navigate to="/app/subscription" replace />;
};

const RoleRoute = ({ roles, children }) => {
  const { user } = useAuth();
  const r = user?.role === 'service_provider' ? 'staff' : user?.role;
  if (roles.includes(r)) return children;
  return <Navigate to="/app/dashboard" replace />;
};

function AppRoutes() {
  const { t } = useI18n();
  const routeFallback = (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-accent-primary/20 border-t-accent-primary"
        aria-hidden
      />
      <p className="mt-4 text-[10px] font-medium uppercase tracking-wider text-secondary">{t('app.loading')}</p>
    </div>
  );

  return (
    <BrowserRouter>
      <Suspense fallback={routeFallback}>
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<PublicHome />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/login/recovery" element={<AccountRecoveryPage />} />
                <Route path="/signup" element={<SignupPage />} />
              </Route>

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
                <Route path="services" element={<ServiceRequestsPage />} />
                <Route path="life-events" element={<LifeEventNavigatorPage />} />
                <Route path="bureaucracy-ai" element={<BureaucracyAIPage />} />
                <Route path="navigator" element={<WorkspaceViews moduleKey="navigator" />} />
                <Route path="women" element={<WorkspaceViews moduleKey="women" />} />
                <Route path="farmer" element={<WorkspaceViews moduleKey="farmer" />} />
                <Route path="student" element={<WorkspaceViews moduleKey="student" />} />
                <Route path="benefits" element={<WorkspaceViews moduleKey="benefits" />} />
                <Route path="opportunities" element={<WorkspaceViews moduleKey="opportunities" />} />
                <Route path="vault" element={<WorkspaceViews moduleKey="vault" />} />
                <Route path="alerts" element={<WorkspaceViews moduleKey="alerts" />} />
                <Route path="assistant" element={<WorkspaceViews moduleKey="assistant" />} />
                <Route path="inclusion" element={<WorkspaceViews moduleKey="inclusion" />} />
                <Route
                  path="recommendations"
                  element={
                    <PremiumRoute>
                      <WorkspaceViews moduleKey="recommendations" />
                    </PremiumRoute>
                  }
                />
                <Route
                  path="career"
                  element={
                    <PremiumRoute>
                      <WorkspaceViews moduleKey="career" />
                    </PremiumRoute>
                  }
                />
                <Route path="support" element={<WorkspaceViews moduleKey="support" />} />
                <Route path="emergency" element={<WorkspaceViews moduleKey="emergency" />} />
                <Route path="offline" element={<WorkspaceViews moduleKey="offline" />} />
                <Route path="sms" element={<WorkspaceViews moduleKey="sms" />} />
                <Route path="integrations" element={<WorkspaceViews moduleKey="integrations" />} />
                <Route path="progress" element={<WorkspaceViews moduleKey="progress" />} />
                <Route path="analytics" element={<WorkspaceViews moduleKey="analytics" />} />
                <Route path="settings" element={<WorkspaceViews moduleKey="settings" />} />
                <Route path="subscription" element={<BillingPage />} />
                <Route
                  path="admin"
                  element={
                    <RoleRoute roles={['admin', 'organization', 'staff']}>
                      <WorkspaceViews moduleKey="admin" />
                    </RoleRoute>
                  }
                />
                <Route path="urban-rural-bridge" element={<WorkspaceViews moduleKey="urbanRuralBridge" />} />
                <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
