import { NavLink } from "react-router-dom";
import { ADMIN_PATH_CONFIG } from "./UrlPathConfig";

const linkBase =
  "flex items-center gap-3 overflow-hidden border-l-4 px-3 py-4.5 text-sm whitespace-nowrap transition-colors select-none md:px-5";

const navActive =
  "border-(--color-sidebar-active-border) bg-(--color-sidebar-active-bg) font-semibold text-(--color-sidebar-active-text)";
const navIdle =
  "border-(--color-sidebar-idle-border) text-(--color-sidebar-idle-text) hover:bg-(--color-sidebar-active-bg) hover:text-(--color-text-primary-dark)";

export default function NavSidebar() {
  return (
    <aside className="flex h-full w-14 shrink-0 flex-col overflow-y-auto bg-(--color-sidebar-bg) transition-all duration-200 md:w-44 lg:w-56">
      {ADMIN_PATH_CONFIG.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.end}
          className={({ isActive }) =>
            `${linkBase} ${isActive ? navActive : navIdle}`
          }
        >
          {item.iconPath ? (
            <img
              src={item.iconPath}
              alt=""
              className="h-5 w-5 shrink-0 object-contain"
              width={20}
              height={20}
            />
          ) : (
            <span className="h-5 w-5 shrink-0" aria-hidden />
          )}
          <span className="hidden md:inline">{item.label}</span>
        </NavLink>
      ))}
    </aside>
  );
}
