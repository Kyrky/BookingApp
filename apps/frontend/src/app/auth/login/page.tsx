"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/features/auth";
import { useToast } from "@/shared/ui/hooks/useToast";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { success, error: toastError } = useToast();

  async function handleSubmit(email: string, password: string) {
    setLoading(true);
    try {
      // TODO: Implement actual API call
      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock success
      success("Login successful");
      setTimeout(() => router.push("/properties"), 500);
    } catch (err) {
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
