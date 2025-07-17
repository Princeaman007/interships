// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

// Pages publiques
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import EmailVerificationPage from "@/pages/EmailVerificationPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";

// Layouts
import StudentDashboardLayout from "@/components/layout/StudentDashboardLayout";
import AdminDashboardLayout from "@/components/layout/AdminDashboardLayout";
import SuperAdminDashboardLayout from "@/components/layout/SuperAdminDashboardLayout";

// Pages Étudiant
import StudentHome from "@/pages/student/StudentHome";
import OffresList from "@/pages/student/OffresPage";
import OffreDetail from "@/pages/student/OffreDetailPage";
import PostulerPage from "@/pages/student/ApplyToInternshipPage";
import MesCandidatures from "@/pages/student/MesCandidatures";
import EditCandidaturePage from "@/pages/student/EditApplicationPage";
import StudentProfile from "@/pages/student/MonProfil";

// Pages Admin
import AdminHome from "@/pages/admin/DashboardHome";
import AdminProfile from "@/pages/admin/AdminProfilePage";

// Pages SuperAdmin
import SuperAdminHome from "@/pages/superadmin/DashboardHome";
import SuperAdminProfile from "@/pages/superadmin/SuperAdminProfilePage";

// Composant de loading
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

// Fonction helper pour vérifier l'accès
const hasAccess = (user: any, isAuthenticated: boolean, requiredRole: string) => {
  if (!isAuthenticated || !user) {
    // Vérifier aussi localStorage comme fallback
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        return userData.role === requiredRole;
      }
    } catch (error) {
      console.error('Erreur lecture localStorage:', error);
    }
    return false;
  }
  return user.role === requiredRole;
};

function App() {
  const { user, isAuthenticated, isLoading } = useAuth();

  // IMPORTANT: Attendre que l'authentification soit chargée
  if (isLoading) {
    console.log('App - En cours de chargement de l\'authentification...');
    return <LoadingSpinner />;
  }

  // Logs de debug
  console.log('App - user:', user);
  console.log('App - isAuthenticated:', isAuthenticated);
  console.log('App - user role:', user?.role);

  return (
    <Routes>
      {/* Pages publiques */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<EmailVerificationPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Dashboard Étudiant */}
      <Route
        path="/étudiant/*"
        element={
          hasAccess(user, isAuthenticated, "étudiant") ? (
            <StudentDashboardLayout />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route index element={<StudentHome />} />
        <Route path="offres" element={<OffresList />} />
        <Route path="offres/:id" element={<OffreDetail />} />
        <Route path="offres/:id/postuler" element={<PostulerPage />} />
        <Route path="mes-candidatures" element={<MesCandidatures />} />
        <Route path="candidatures/:id/modifier" element={<EditCandidaturePage />} />
        <Route path="profile" element={<StudentProfile />} />
      </Route>

      {/* Dashboard Admin */}
      <Route
        path="/admin/*"
        element={
          hasAccess(user, isAuthenticated, "admin") ? (
            <AdminDashboardLayout />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route index element={<AdminHome />} />
        <Route path="profile" element={<AdminProfile />} />
      </Route>

      {/* Dashboard SuperAdmin */}
      <Route
        path="/superadmin/*"
        element={
          hasAccess(user, isAuthenticated, "superAdmin") ? (
            <SuperAdminDashboardLayout />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route index element={<SuperAdminHome />} />
        <Route path="profile" element={<SuperAdminProfile />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;