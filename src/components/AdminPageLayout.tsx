import { useAuthStore } from "@/store/useAuth";
import NavSidebar from "./NavSidebar";
import Topbar from "./Topbar";
import { Outlet, useLocation } from "react-router-dom";
import { ADMIN_PATH_CONFIG, resolveAdminPathKey } from "./UrlPathConfig";

function AdminPageLayout() {
  const logout = useAuthStore((s) => s.logout);

  const path = resolveAdminPathKey(useLocation().pathname);
  const bgColor =
    ADMIN_PATH_CONFIG.find((link) => link.path === path)?.colorSet?.bg ??
    "var(--color-surface-light)";

  return (
    <div className="flex h-screen overflow-hidden bg-(--color-admin-shell-bg)">
      <NavSidebar />
      <div className="flex min-w-0 min-h-0 flex-1 flex-col overflow-hidden">
        <Topbar onLogout={() => logout()} />
        <div
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-5"
          style={{ backgroundColor: bgColor }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminPageLayout;
