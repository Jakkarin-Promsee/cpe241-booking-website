import { useState } from "react";
import type { KeyboardEvent } from "react";
import loginBg from "@/assets/login_bg.png";
import type { LoginResult } from "@/store/useAuth";

type LoginShellProps = {
  title: string;
  login: (email: string, password: string) => Promise<LoginResult>;
  /** Autofill only when showcase mode is on (see comment block below). No UI for credentials. */
  demoCredentials?: { email: string; password: string };
};

/*
 * --- SHOWCASE / DEMO LOGIN (tracking block for production deploy) ---
 * Autofill runs only when:
 *   - `npm run dev` (import.meta.env.DEV), or
 *   - you set VITE_SHOWCASE_DEMO_LOGIN=true in client/.env for a demo build.
 * For public production: remove `demoCredentials` from Login / UserLogin, or ship a build
 * with DEV false and without VITE_SHOWCASE_DEMO_LOGIN.
 * --- end SHOWCASE / DEMO LOGIN ---
 */
const SHOWCASE_LOGIN_HELP =
  import.meta.env.DEV || import.meta.env.VITE_SHOWCASE_DEMO_LOGIN === "true";

function initialDemoCredentials(
  creds: { email: string; password: string } | undefined,
): { email: string; password: string } {
  if (!SHOWCASE_LOGIN_HELP || !creds) {
    return { email: "", password: "" };
  }
  return { email: creds.email, password: creds.password };
}

export default function LoginShell({
  title,
  login,
  demoCredentials,
}: LoginShellProps) {
  const initial = initialDemoCredentials(demoCredentials);
  const [email, setEmail] = useState(initial.email);
  const [password, setPassword] = useState(initial.password);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.ok === false) {
      setError(result.error);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") void handleLogin();
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative bg-(--color-login-page-bg-fallback)"
      style={{
        backgroundImage: `url(${loginBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-(--color-login-scrim)" />

      <div className="relative z-10 w-full max-w-108 mx-4 border-12 border-(--color-login-card-border) bg-(--color-login-card-bg) shadow-2xl">
        <div className="px-12 py-20 flex flex-col gap-4">
          <h1 className="text-4xl font-black text-center tracking-wide uppercase mb-8 text-(--color-text-primary-light)">
            {title}
          </h1>

          {error && (
            <div className="text-xs px-3 py-2 rounded border bg-(--color-login-error-bg) border-(--color-login-error-border) text-(--color-login-error-text)">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2.5 rounded px-3 py-2.5 border border-(--color-login-input-border) bg-(--color-login-input-bg) transition focus-within:border-(--color-login-input-border-focus) focus-within:ring-1 focus-within:ring-(--color-login-input-border)">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              className="shrink-0 text-(--color-text-muted-light)"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            <input
              type="email"
              placeholder="Username / Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-sm text-(--color-text-primary-light) placeholder-(--color-text-muted-light)"
            />
          </div>

          <div className="flex items-center gap-2.5 rounded px-3 py-2.5 border border-(--color-login-input-border) bg-(--color-login-input-bg) transition focus-within:border-(--color-login-input-border-focus) focus-within:ring-1 focus-within:ring-(--color-login-input-border)">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              className="shrink-0 text-(--color-text-muted-light)"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-sm text-(--color-text-primary-light) placeholder-(--color-text-muted-light)"
            />
          </div>

          <button
            onClick={() => void handleLogin()}
            disabled={loading}
            className="w-full font-bold py-2.5 rounded transition-colors text-sm tracking-widest uppercase mt-1 text-white bg-(--color-login-btn-bg) hover:bg-(--color-login-btn-bg-hover) disabled:bg-(--color-login-btn-disabled)"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeOpacity="0.3"
                  />
                  <path d="M21 12a9 9 0 00-9-9" />
                </svg>
                Signing in...
              </span>
            ) : (
              "Login"
            )}
          </button>

          <p className="text-center text-xs cursor-pointer transition-colors mt-1 text-(--color-text-muted-light) hover:text-(--color-text-primary-light)">
            Forgot Password?
          </p>

          <div className="border-t border-(--color-border-light)" />

          <p className="text-center text-xs underline underline-offset-2 cursor-pointer transition-colors text-(--color-text-secondary-light) hover:text-(--color-text-primary-light)">
            Contact IT Support
          </p>
        </div>
      </div>
    </div>
  );
}
