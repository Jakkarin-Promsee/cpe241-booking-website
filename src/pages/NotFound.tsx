import { Link } from "react-router-dom";
import loginBg from "@/assets/login_bg.png";

const NotFound = () => {
  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center px-4"
      style={{
        backgroundImage: `url(${loginBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#1a1a1a",
      }}
    >
      <div className="absolute inset-0 bg-black/40" aria-hidden />

      <div className="relative z-10 mx-auto w-full max-w-lg border-8 border-neutral-900 bg-white shadow-2xl">
        <div className="flex flex-col items-center gap-6 px-8 py-14 text-center sm:px-12 sm:py-16">
          <p className="text-7xl font-black tracking-tight text-neutral-900 sm:text-8xl">
            404
          </p>
          <div className="space-y-2">
            <h1 className="text-xl font-black uppercase tracking-wide text-neutral-900 sm:text-2xl">
              Page not found
            </h1>
            <p className="text-sm text-neutral-600 sm:text-base">
              The address may be wrong or the page was moved. Check the URL or
              return to the admin area.
            </p>
          </div>

          <div className="h-px w-full max-w-xs bg-neutral-200" aria-hidden />

          <Link
            to="/admin/"
            className="w-full max-w-xs bg-neutral-900 py-2.5 text-center text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-neutral-700"
          >
            Back to admin
          </Link>

          <Link
            to="/admin/login"
            className="text-xs text-neutral-500 underline-offset-2 transition-colors hover:text-neutral-900"
          >
            Admin login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
