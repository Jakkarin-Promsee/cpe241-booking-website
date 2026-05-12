import { Link } from "react-router-dom";
import loginBg from "@/assets/login_bg.png";

export default function LandingPage() {
  return (
    <div
      className="relative flex min-h-screen w-full flex-col bg-(--color-login-page-bg-fallback)"
      style={{
        backgroundImage: `url(${loginBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-(--color-login-scrim)" aria-hidden />
      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-b from-(--color-surface-overlay) via-transparent to-(--color-surface-overlay)"
        style={{ opacity: 0.55 }}
        aria-hidden
      />

      <header className="relative z-10 flex justify-end px-4 py-5 sm:px-8">
        <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-(--color-text-secondary-dark)">
          Cinema
        </span>
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 pb-20 pt-4 sm:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-(--color-text-muted-dark) sm:text-xs">
            Reserve · Watch · Manage
          </p>
          <h1 className="mt-5 text-4xl font-black uppercase leading-[1.05] tracking-tight text-(--color-login-card-bg) drop-shadow-2xl sm:text-5xl md:text-6xl lg:text-7xl">
            Your seat
            <span className="block text-(--color-text-secondary-dark) sm:mt-1 md:inline md:mt-0 md:before:content-['\00a0']">
              is waiting
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-(--color-text-secondary-dark) sm:text-base">
            Book showtimes and pick seats as a guest, or sign in to the admin console to run the
            house — schedules, venues, and revenue in one place.
          </p>

          <div className="mt-12 flex w-full max-w-md flex-col gap-4 sm:mx-auto sm:max-w-2xl sm:flex-row sm:justify-center sm:gap-5">
            <Link
              to="/login"
              className="group relative flex min-h-13 flex-1 items-center justify-center overflow-hidden rounded border-2 border-(--color-login-card-border) bg-(--color-login-card-bg) px-6 py-3 text-center text-sm font-black uppercase tracking-widest text-(--color-text-primary-light) shadow-2xl transition hover:border-(--color-input-border-focus) hover:bg-(--color-login-input-bg)"
            >
              <span className="relative z-10">Book tickets</span>
              <span
                className="absolute inset-0 bg-linear-to-r from-transparent via-(--color-border-light) to-transparent opacity-0 transition group-hover:opacity-30"
                aria-hidden
              />
            </Link>
            <Link
              to="/admin/login"
              className="flex min-h-13 flex-1 items-center justify-center rounded border-2 border-(--color-border-dark) bg-(--color-surface-overlay)/80 px-6 py-3 text-center text-sm font-black uppercase tracking-widest text-(--color-text-primary-dark) backdrop-blur-sm transition hover:border-(--color-input-border-focus) hover:bg-(--color-surface-panel-mid)/90"
            >
              Admin login
            </Link>
          </div>

          <p className="mt-10 text-xs text-(--color-text-muted-dark)">
            Staff portal uses the same look as the console — customers get a streamlined booking
            path.
          </p>
        </div>
      </main>

      <footer className="relative z-10 border-t border-(--color-border-dark)/50 bg-(--color-surface-overlay)/40 px-4 py-4 text-center backdrop-blur-sm">
        <p className="text-[10px] uppercase tracking-widest text-(--color-text-disabled-dark)">
          CPE241 · Database web project
        </p>
      </footer>
    </div>
  );
}
