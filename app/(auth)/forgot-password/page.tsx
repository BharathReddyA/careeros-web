"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, ApiError } from "../../../lib/api";
import PasswordField from "../../../components/PasswordField";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"phone" | "reset">("phone");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\+[1-9]\d{6,14}$/.test(phone)) {
      setError("Enter your phone in international format, e.g. +14155552671.");
      return;
    }
    setIsLoading(true);
    try {
      await api.post("/auth/forgot-password/send-otp", { phone });
      setStep("reset");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!otp || newPassword.length < 8) {
      setError("Enter the code and a new password of at least 8 characters.");
      return;
    }
    setIsLoading(true);
    try {
      await api.post("/auth/forgot-password/reset", { phone, otp, newPassword });
      setMessage("Password updated. You can sign in now.");
      setTimeout(() => router.push("/login"), 1500);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Link href="/login" className="text-sm text-slate-400 hover:text-slate-300 mb-8 inline-block">
        ← Back
      </Link>
      <h1 className="text-3xl font-extrabold text-white mb-2">Reset password</h1>
      <p className="text-slate-400 mb-8">
        {step === "phone"
          ? "Enter the recovery phone number you verified in Settings."
          : "Enter the code we texted you and choose a new password."}
      </p>

      {step === "phone" ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Phone number</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+14155552671"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-blue-600 py-3.5 font-bold text-white hover:bg-blue-500 disabled:opacity-60"
          >
            {isLoading ? "Sending..." : "Send Code"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Verification code</label>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <PasswordField
            label="New password"
            value={newPassword}
            onChange={setNewPassword}
            placeholder="••••••••"
            showRequirements
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          {message && <p className="text-sm text-emerald-400">{message}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-blue-600 py-3.5 font-bold text-white hover:bg-blue-500 disabled:opacity-60"
          >
            {isLoading ? "Updating..." : "Update Password"}
          </button>
        </form>
      )}
    </>
  );
}
