/** Single source of truth: 
  path in the URL drives which item was rendered. 
  Use in NavSidebar, Topbar, and AdminPageLayout. */

/** Dashboard matches `/admin` or `/admin/`; config uses `/admin/`. */
export function resolveAdminPathKey(pathname: string): string {
  return pathname === "/admin" ? "/admin/" : pathname;
}

/** Maps to tokens in `src/index.css` — change palette there only. */
const light_colorSet = {
  titleColor: "var(--color-topbar-light-text)",
  titleBorder: "var(--color-topbar-light-border)",
  titleBg: "var(--color-topbar-light-bg)",
  bg: "var(--color-surface-light)",
  logoutHoverBg: "var(--color-topbar-light-logout-hover)",
};
const dark_colorSet = {
  titleColor: "var(--color-topbar-dark-text)",
  titleBorder: "var(--color-topbar-dark-border)",
  titleBg: "var(--color-topbar-dark-bg)",
  bg: "var(--color-surface-dark)",
  logoutHoverBg: "var(--color-topbar-dark-logout-hover)",
};

/** Resolved asset URLs for PNGs under `src/assets/navbar/`. */
const iconModules = import.meta.glob<string>("../assets/navbar/*.png", {
  eager: true,
  import: "default",
});

function iconPath(name: string): string {
  const suffix = `/${name}.png`;
  for (const [path, url] of Object.entries(iconModules)) {
    if (path.replace(/\\/g, "/").endsWith(suffix)) return url;
  }
  return "";
}

export const ADMIN_PATH_CONFIG = [
  {
    path: "/admin/",
    colorSet: light_colorSet,
    title: " Admin Dashboard",
    label: "Dashboard",
    iconPath: iconPath("dashboard"),
    end: true,
  },
  {
    path: "/admin/movies",
    colorSet: dark_colorSet,
    title: "Movie management",
    label: "Movie management",
    iconPath: iconPath("movie"),
    end: false,
  },
  {
    path: "/admin/screens",
    colorSet: dark_colorSet,
    label: "Screen Management",
    title: "Screen Management",
    iconPath: iconPath("screen"),
    end: false,
  },
  {
    path: "/admin/booking",
    colorSet: dark_colorSet,
    title: "Booking",
    label: "Booking",
    iconPath: iconPath("booking"),
    end: false,
  },
  {
    path: "/admin/reports",
    colorSet: light_colorSet,
    title: "Reports",
    label: "Reports",
    iconPath: iconPath("report"),
    end: false,
  },
] as const;
