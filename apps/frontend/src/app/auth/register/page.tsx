"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RegisterForm } from "@/features/auth";
import { useToast } from "@/shared/ui/hooks/useToast";
import { useAuth } from "@/contexts/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { success, error: toastError } = useToast();
  const { registerAction } = useAuth();

  async function handleSubmit(name: string, email: string, password: string) {
    setLoading(true);
    try {
      await registerAction(email, password, name);

      success("Account created successfully");
      setTimeout(() => router.push("/properties"), 500);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Registration failed";
      toastError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <RegisterForm onSubmit={handleSubmit} loading={loading} />
    </div>
  );
}
