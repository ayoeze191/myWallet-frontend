import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { RequireAuth } from './auth/RequireAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import ContributionsPage from './pages/ContributionsPage';
import ContributionDetailPage from './pages/ContributionDetailPage';
import JoinPage from './pages/JoinPage';

/**
 * "/" serves double duty: the marketing page to a visitor, the dashboard to
 * someone already signed in. Keeping both on the same path means every existing
 * link home — the sidebar, the invite page, a logo click — still lands right.
 */
function Home() {
  const { token } = useAuth();
  return token ? <DashboardPage /> : <LandingPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* Public on purpose: an invite link has to be readable by
              someone who does not have an account yet. */}
          <Route path="/join/:code" element={<JoinPage />} />
          <Route path="/" element={<Home />} />
          <Route
            path="/contributions"
            element={
              <RequireAuth>
                <ContributionsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/contributions/:id"
            element={
              <RequireAuth>
                <ContributionDetailPage />
              </RequireAuth>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
