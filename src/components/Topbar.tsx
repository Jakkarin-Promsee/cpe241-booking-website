import type { CSSProperties } from "react";
import { useLocation } from "react-router-dom";
import { ADMIN_PATH_CONFIG, resolveAdminPathKey } from "./UrlPathConfig";

function Topbar({ onLogout }: { onLogout: () => void }) {
  const path = resolveAdminPathKey(useLocation().pathname);
  const entry = ADMIN_PATH_CONFIG.find((link) => link.path === path);
  const cs = entry?.colorSet;

  const titleColor = cs?.titleColor ?? "var(--color-topbar-light-text)";
  const titleBorder = cs?.titleBorder ?? "var(--color-topbar-light-border)";
  const titleBg = cs?.titleBg ?? "var(--color-topbar-light-bg)";
  const logoutHoverBg =
    cs?.logoutHoverBg ?? "var(--color-topbar-light-logout-hover)";
  const title = entry?.title ?? "Admin Management";

  return (
    <div
      className="flex items-center justify-between px-6 py-4 border-b shrink-0 gap-3"
      style={
        {
          borderColor: titleBorder,
          backgroundColor: titleBg,
          "--topbar-logout-hover": logoutHoverBg,
        } as CSSProperties
      }
    >
      <div
        className="flex min-w-0 items-center gap-2"
        style={{ color: titleColor }}
      >
        <h1 className="text-lg lg:text-xl font-bold whitespace-nowrap truncate">
          {title}
        </h1>
      </div>
      <div
        className="flex items-center gap-3 lg:gap-4 shrink-0"
        style={{ color: titleColor }}
      >
        {/* TODO: Add search input (don't use it now) */}
        {/* <div className="flex items-center gap-2 bg-white border border-neutral-300 rounded-full px-4 py-1.5">
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            placeholder="Search"
            className="border-none outline-none bg-transparent text-sm w-24 lg:w-40 placeholder:text-neutral-500"
          />
        </div> */}
        <div className="flex items-center gap-2">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
          <span className="hidden sm:inline text-sm whitespace-nowrap">
            Admin User
          </span>
        </div>
        <button
          type="button"
          aria-label="Log out"
          onClick={onLogout}
          className="p-1 rounded transition-colors hover:bg-(--topbar-logout-hover)"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="cursor-pointer shrink-0"
          >
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default Topbar;
