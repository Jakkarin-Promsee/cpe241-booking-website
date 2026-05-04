import { Link } from "react-router-dom";
import loginBg from "@/assets/login_bg.png";

const NotFound = () => {
  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center bg-(--color-login-page-bg-fallback) px-4"
      style={{
        backgroundImage: `url(${loginBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-(--color-login-scrim)" aria-hidden />

      <div className="relative z-10 mx-auto w-full max-w-lg border-8 border-(--color-login-card-border) bg-(--color-login-card-bg) shadow-2xl">
        <div className="flex flex-col items-center gap-6 px-8 py-14 text-center sm:px-12 sm:py-16">
          <p className="text-7xl font-black tracking-tight text-(--color-text-primary-light) sm:text-8xl">
            404
          </p>
          <div className="space-y-2">
            <h1 className="text-xl font-black uppercase tracking-wide text-(--color-text-primary-light) sm:text-2xl">
              Page not found
            </h1>
            <p className="text-sm text-(--color-text-secondary-light) sm:text-base">
              The address may be wrong or the page was moved. Check the URL or
              return to the admin area.
            </p>
          </div>

          <div
            className="h-px w-full max-w-xs bg-(--color-border-light)"
            aria-hidden
          />

          <Link
            to="/admin/"
            className="w-full max-w-xs bg-(--color-login-btn-bg) py-2.5 text-center text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-(--color-login-btn-bg-hover)"
          >
            Back to admin
          </Link>

          <Link
            to="/admin/login"
            className="text-xs text-(--color-text-muted-light) underline-offset-2 transition-colors hover:text-(--color-text-primary-light)"
          >
            Admin login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
