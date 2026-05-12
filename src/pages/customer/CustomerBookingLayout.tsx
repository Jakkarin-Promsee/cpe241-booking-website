import { Link, Outlet, useNavigate } from "react-router-dom";
import { useCustomerAuthStore } from "@/store/useCustomerAuth";

export default function CustomerBookingLayout() {
  const navigate = useNavigate();
  const logout = useCustomerAuthStore((s) => s.logout);

  return (
    <div className="min-h-screen flex flex-col bg-(--color-surface-dark) text-(--color-text-primary-dark)">
      <header className="shrink-0 border-b border-(--color-border-dark) bg-(--color-surface-panel) px-4 py-3 flex items-center justify-between gap-4">
        <Link
          to="/booking/movies"
          className="text-lg font-black tracking-wide uppercase text-(--color-text-primary-dark) hover:text-white"
        >
          Book tickets
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link
            to="/booking/movies"
            className="text-(--color-text-muted-dark) hover:text-(--color-text-primary-dark)"
          >
            Movies
          </Link>
          <Link
            to="/booking/checkout"
            className="text-(--color-text-muted-dark) hover:text-(--color-text-primary-dark)"
          >
            My booking
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/login", { replace: true });
            }}
            className="rounded px-3 py-1.5 border border-(--color-border-dark) text-(--color-text-secondary-dark) hover:bg-(--color-surface-panel-mid)"
          >
            Log out
          </button>
        </nav>
      </header>
      <main className="flex-1 p-4 md:p-6 max-w-6xl mx-auto w-full">
        <Outlet />
      </main>
    </div>
  );
}
