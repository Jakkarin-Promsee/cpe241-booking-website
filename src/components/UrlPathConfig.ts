/** Single source of truth: 
  path in the URL drives which item was rendered. 
  Use in NavSidebar, Topbar, and AdminPageLayout. */

/** Dashboard matches `/admin` or `/admin/`; config uses `/admin/`. */
export function resolveAdminPathKey(pathname: string): string {
  return pathname === "/admin" ? "/admin/" : pathname;
}

const light_colorSet = {
  titleColor: "#171717",
  titleBorder: "#e5e5e5",
  titleBg: "#cdd0d5",
  bg: "#f3f4f8",
};
const dark_colorSet = {
  titleColor: "#ffffff",
  titleBorder: "#2b2f31",
  titleBg: "#333739",
  bg: "#545454",
};

export const ADMIN_PATH_CONFIG = [
  {
    path: "/admin/",
    colorSet: light_colorSet,
    title: " Admin Dashboard",
    label: "Dashboard",
    icon: "📊",
    end: true,
  },
  {
    path: "/admin/movies",
    colorSet: dark_colorSet,
    title: "Movie management",
    label: "Movie management",
    icon: "🎬",
    end: false,
  },
  {
    path: "/admin/screens",
    colorSet: dark_colorSet,
    label: "Screen Management",
    title: "Screen Management",
    icon: "🖥️",
    end: false,
  },
  {
    path: "/admin/booking",
    colorSet: dark_colorSet,
    title: "Booking",
    label: "Booking",
    icon: "📋",
    end: false,
  },
  {
    path: "/admin/reports",
    colorSet: light_colorSet,
    title: "Reports",
    label: "Reports",
    icon: "📁",
    end: false,
  },
] as const;
