import { Navigate, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/Dashboard";
import MovieManagementPage from "./pages/MovieManagement";
import ScreenManagementPage from "./pages/ScreenManagement";
import BookingPage from "./pages/Booking";
import ReportsPage from "./pages/Report";
import VenueManagementPage from "./pages/VenueManagement";
import LoginPage from "./pages/Login";
import UserLoginPage from "./pages/UserLogin";
import LandingPage from "./pages/LandingPage";
import CustomerBookingLayout from "./pages/customer/CustomerBookingLayout";
import CustomerMoviePick from "./pages/customer/CustomerMoviePick";
import CustomerShowtimePick from "./pages/customer/CustomerShowtimePick";
import CustomerSeatSelection from "./pages/customer/CustomerSeatSelection";
import CustomerCheckoutPage from "./pages/customer/CustomerCheckoutPage";
import { useAuthStore } from "./store/useAuth";
import { useCustomerAuthStore } from "./store/useCustomerAuth";
import NotFound from "./pages/NotFound";
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

const UserLoginPublishedRoutes = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const authed = useCustomerAuthStore((s) => s.authed);

  if (authed) {
    return <Navigate to="/booking/movies" replace />;
  }

  return <>{children}</>;
};

const CustomerProtectedRoute = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const authed = useCustomerAuthStore((s) => s.authed);

  if (!authed) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route
        path="/admin/login"
        element={
          <AdminPagePlubishedRoutes>
            <LoginPage />
          </AdminPagePlubishedRoutes>
        }
      />

      <Route
        path="/login"
        element={
          <UserLoginPublishedRoutes>
            <UserLoginPage />
          </UserLoginPublishedRoutes>
        }
      />

      <Route
        path="/booking"
        element={
          <CustomerProtectedRoute>
            <CustomerBookingLayout />
          </CustomerProtectedRoute>
        }
      >
        <Route index element={<Navigate to="movies" replace />} />
        <Route path="movies" element={<CustomerMoviePick />} />
        <Route path="movies/:showId/showtimes" element={<CustomerShowtimePick />} />
        <Route path="showings/:showingId/seats" element={<CustomerSeatSelection />} />
        <Route path="checkout" element={<CustomerCheckoutPage />} />
        <Route path="checkout/:bookingId" element={<CustomerCheckoutPage />} />
      </Route>

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
        <Route path="/admin/venues" element={<VenueManagementPage />} />
        <Route path="/admin/booking" element={<BookingPage />} />
        <Route path="/admin/reports" element={<ReportsPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
