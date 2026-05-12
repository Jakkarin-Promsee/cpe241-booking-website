import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import LoginShell from "@/components/LoginShell";
import type { LoginResult } from "@/store/useAuth";
import { useCustomerAuthStore } from "@/store/useCustomerAuth";

/*
 * SHOWCASE / DEMO — LoginShell autofills in dev (see LoginShell SHOWCASE block).
 * Remove `demoCredentials` before public production if you want empty fields.
 * Seed customer (example): john@example.com / User@1234 (other seed customers use same password).
 */
const CUSTOMER_DEMO_CREDENTIALS = {
  email: "john@example.com",
  password: "User@1234",
} as const;

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

  return (
    <LoginShell
      title="Sign In"
      login={login}
      demoCredentials={CUSTOMER_DEMO_CREDENTIALS}
    />
  );
}
