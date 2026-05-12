import LoginShell from "@/components/LoginShell";
import { useAuthStore } from "@/store/useAuth";

/*
 * SHOWCASE / DEMO — LoginShell autofills in dev (see LoginShell SHOWCASE block).
 * Remove `demoCredentials` before public production if you want empty fields.
 * Seed admin: Admin User — admin@cinema.com / Admin@1234
 */
const ADMIN_DEMO_CREDENTIALS = {
  email: "admin@cinema.com",
  password: "Admin@1234",
} as const;

export default function LoginPage() {
  const login = useAuthStore((s) => s.login);

  return (
    <LoginShell
      title="Admin Login"
      login={login}
      demoCredentials={ADMIN_DEMO_CREDENTIALS}
    />
  );
}
