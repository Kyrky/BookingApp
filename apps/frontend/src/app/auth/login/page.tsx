"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/features/auth";
import { useToast } from "@/shared/ui/hooks/useToast";
import { useAuth } from "@/contexts/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { success, error: toastError } = useToast();
  const { loginAction } = useAuth();

  async function handleSubmit(email: string, password: string) {
    console.log("Login attempt:", email);
    setLoading(true);
    try {
      console.log("Calling loginAction from context...");
      await loginAction(email, password);
      console.log("Login successful, redirecting...");

      success("Login successful");
      setTimeout(() => router.push("/properties"), 500);
    } catch (err) {
      console.error("Login error:", err);
      const message = err instanceof Error ? err.message : "Login failed";
      toastError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <LoginForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
