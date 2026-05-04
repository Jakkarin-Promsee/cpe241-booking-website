import { NavLink } from "react-router-dom";
import { ADMIN_PATH_CONFIG } from "./UrlPathConfig";

const linkBase =
  "flex items-center gap-3 overflow-hidden border-l-4 px-3 py-4.5 text-sm whitespace-nowrap transition-colors select-none md:px-5";

export default function NavSidebar() {
  return (
    <aside className="flex h-full w-14 shrink-0 flex-col overflow-y-auto bg-neutral-800 transition-all duration-200 md:w-44 lg:w-56">
      {ADMIN_PATH_CONFIG.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.end}
          className={({ isActive }) =>
            `${linkBase} ${
              isActive
                ? "border-neutral-400 bg-neutral-700 font-semibold text-white"
                : "border-transparent text-neutral-400 hover:bg-neutral-700 hover:text-neutral-200"
            }`
          }
        >
          <span className="shrink-0 text-base">{item.icon}</span>
          <span className="hidden md:inline">{item.label}</span>
        </NavLink>
      ))}
    </aside>
  );
}
