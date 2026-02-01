"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/features/auth";
import { Modal, ToastContainer } from "@/shared/ui";
import { useToast } from "@/shared/ui/hooks/useToast";
import { useAuth } from "@/contexts/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { toasts, closeToast, success, error: toastError } = useToast();
  const { loginAction } = useAuth();

  async function handleSubmit(data: { email: string; password: string }) {
    setLoading(true);
    try {
      await loginAction(data);
      success("Login successful");
      setTimeout(() => {
        window.location.href = "/properties";
      }, 500);
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
      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  );
}
