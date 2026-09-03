import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { RequireAuth } from "./auth/RequireAuth";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import ContributionsPage from "./pages/ContributionsPage";
import ContributionDetailPage from "./pages/ContributionDetailPage";
import JoinPage from "./pages/JoinPage";

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
