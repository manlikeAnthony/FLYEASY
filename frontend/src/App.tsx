import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import ContactPage from "./pages/ContactPage";
import NotificationsPage from "./pages/NotificationsPage";
import RequestWorkspace from "./pages/RequestWorkspace";
import AdminFlightSearch from "./pages/AdminFlightSearch";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import BookFlight from "./pages/BookFlight";
import MyRequestsPage from "./pages/MyRequestsPage";
import LoginPage from "./pages/LoginPage";
import TrackRequestPage from "./pages/TrackRequestPage";
import ClaimRequestPage from "./pages/ClaimRequestPage";
import AdminRequestsPage from "./pages/AdminRequestsPage";
import AdminDashboard from "./pages/AdminDashboard";
import RegisterPage from "./pages/RegisterPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AuthGuard from "./components/AuthGuard";
import RoleGuard from "./components/RoleGuard";

function SessionRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const redirectToLogin = () => navigate("/login", { replace: true });
    window.addEventListener("logout", redirectToLogin);
    return () => window.removeEventListener("logout", redirectToLogin);
  }, [navigate]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <SessionRedirect />
      <MainLayout>
        <Routes>
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/notifications" element={<AuthGuard><NotificationsPage /></AuthGuard>} />
          <Route path="/" element={<Home />} />
          <Route path="/workspace/:id" element={<AuthGuard><RequestWorkspace /></AuthGuard>} />
          <Route path="/admin/flights" element={<AuthGuard><RoleGuard allowedRoles={["ADMIN"]}><AdminFlightSearch /></RoleGuard></AuthGuard>} />
          <Route path="/my/new" element={<AuthGuard><BookFlight /></AuthGuard>} />
          <Route path="/book" element={<BookFlight />} />
          <Route
            path="/requests"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={["ADMIN"]}>
                  <AdminRequestsPage />
                </RoleGuard>
              </AuthGuard>
            }
          />
          <Route
            path="/my"
            element={
              <AuthGuard>
                <MyRequestsPage />
              </AuthGuard>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/user/verify-email" element={<VerifyEmailPage />} />
          <Route
            path="/claim"
            element={
              <AuthGuard>
                <ClaimRequestPage />
              </AuthGuard>
            }
          />
          <Route
            path="/admin"
            element={
              <AuthGuard>
                <RoleGuard allowedRoles={["ADMIN"]}>
                  <AdminDashboard />
                </RoleGuard>
              </AuthGuard>
            }
          />
          <Route path="/track-request" element={<TrackRequestPage />} />
          <Route path="/track-request/:id" element={<TrackRequestPage />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
