"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RegisterForm } from "@/features/auth";
import { Modal, ToastContainer } from "@/shared/ui";
import { useToast } from "@/shared/ui/hooks/useToast";
import { useAuth } from "@/contexts/auth-context";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { toasts, closeToast, success, error: toastError } = useToast();
  const { registerAction } = useAuth();

  async function handleSubmit(data: { name: string; email: string; password: string }) {
    setLoading(true);
    try {
      await registerAction(data);
      success("Account created successfully");
      window.location.href = "/properties";
    } catch (err) {
      console.error("RegisterPage error:", err);
      const message = err instanceof Error ? err.message : "Registration failed";
      toastError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <RegisterForm onSubmit={handleSubmit} loading={loading} />
      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  );
}
