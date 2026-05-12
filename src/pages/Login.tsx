import LoginShell from "@/components/LoginShell";
import { useAuthStore } from "@/store/useAuth";

export default function LoginPage() {
  const login = useAuthStore((s) => s.login);

  return <LoginShell title="Admin Login" login={login} />;
}
