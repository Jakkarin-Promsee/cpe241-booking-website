import { useState } from "react";
import type { KeyboardEvent } from "react";
import loginBg from "@/assets/login_bg.png";
import { useAuthStore } from "@/store/useAuth";

export default function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      className="min-h-screen w-full flex items-center justify-center relative"
      style={{
        backgroundImage: `url(${loginBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#1a1a1a",
      }}
    >
      {/* Scrim */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Card */}
      <div className="relative z-10 bg-white w-full max-w-108 mx-4 border-12 border-neutral-900 shadow-2xl">
        <div className="px-12 py-20 flex flex-col gap-4">
          {/* Title */}
          <h1 className="text-4xl font-black text-neutral-900 text-center tracking-wide uppercase mb-8">
            Admin Login
          </h1>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded">
              {error}
            </div>
          )}

          {/* Email */}
          <div className="flex items-center gap-2.5 border border-neutral-300 rounded px-3 py-2.5 bg-neutral-50 focus-within:border-neutral-600 focus-within:ring-1 focus-within:ring-neutral-300 transition">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#999"
              strokeWidth="1.8"
              strokeLinecap="round"
              className="shrink-0"
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
              className="flex-1 bg-transparent border-none outline-none text-sm text-neutral-800 placeholder-neutral-400"
            />
          </div>

          {/* Password */}
          <div className="flex items-center gap-2.5 border border-neutral-300 rounded px-3 py-2.5 bg-neutral-50 focus-within:border-neutral-600 focus-within:ring-1 focus-within:ring-neutral-300 transition">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#999"
              strokeWidth="1.8"
              strokeLinecap="round"
              className="shrink-0"
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
              className="flex-1 bg-transparent border-none outline-none text-sm text-neutral-800 placeholder-neutral-400"
            />
          </div>

          {/* Login button */}
          <button
            onClick={() => void handleLogin()}
            disabled={loading}
            className="w-full bg-neutral-900 hover:bg-neutral-700 disabled:bg-neutral-400 text-white font-bold py-2.5 rounded transition-colors text-sm tracking-widest uppercase mt-1"
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

          {/* Forgot password */}
          <p className="text-center text-xs text-neutral-500 hover:text-neutral-800 cursor-pointer transition-colors mt-1">
            Forgot Password?
          </p>

          {/* Divider */}
          <div className="border-t border-neutral-200" />

          {/* Contact IT Support */}
          <p className="text-center text-xs text-neutral-600 underline underline-offset-2 cursor-pointer hover:text-neutral-900 transition-colors">
            Contact IT Support
          </p>
        </div>
      </div>
    </div>
  );
}
