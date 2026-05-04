import { Navigate, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/Dashboard";
import MovieManagementPage from "./pages/MovieManagement";
import ScreenManagementPage from "./pages/ScreenManagement";
import BookingPage from "./pages/Booking";
import ReportsPage from "./pages/Report";
import LoginPage from "./pages/Login";
import { useAuthStore } from "./store/useAuth";
// import NotFound from "./pages/NotFound";
import AdminPageLayout from "./components/AdminPageLayout";

const AdminPagePlubishedRoutes = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const authed = useAuthStore((s) => s.authed);

  if (authed) {
    return <Navigate to="/admin/" replace />;
  }

  return <>{children}</>;
};

const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const authed = useAuthStore((s) => s.authed);

  if (!authed) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <Routes>
      <Route
        path="/admin/login"
        element={
          <AdminPagePlubishedRoutes>
            <LoginPage />
          </AdminPagePlubishedRoutes>
        }
      />

      {/* Admin Navsidebar and Topbar template */}
      <Route
        path="/admin"
        element={
          <AdminProtectedRoute>
            <AdminPageLayout />
          </AdminProtectedRoute>
        }
      >
        <Route path="/admin/" element={<DashboardPage />} />
        <Route path="/admin/movies" element={<MovieManagementPage />} />
        <Route path="/admin/screens" element={<ScreenManagementPage />} />
        <Route path="/admin/booking" element={<BookingPage />} />
        <Route path="/admin/reports" element={<ReportsPage />} />
      </Route>

      {/* <Route path="*" element={<NotFound />} /> */}
      <Route path="*" element={<Navigate to="/admin/" replace />} />
    </Routes>
  );
}
