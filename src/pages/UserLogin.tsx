import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import LoginShell from "@/components/LoginShell";
import type { LoginResult } from "@/store/useAuth";
import { useCustomerAuthStore } from "@/store/useCustomerAuth";

export default function UserLoginPage() {
  const navigate = useNavigate();
  const storeLogin = useCustomerAuthStore((s) => s.login);

  const login = useCallback(
    async (email: string, password: string): Promise<LoginResult> => {
      const result = await storeLogin(email, password);
      if (result.ok) {
        navigate("/booking/movies", { replace: true });
      }
      return result;
    },
    [navigate, storeLogin],
  );

  return <LoginShell title="Sign In" login={login} />;
}
