import { BrowserRouter, Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Home />} />
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
