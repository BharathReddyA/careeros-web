"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, authRequest, ApiError } from "../../../lib/api";
import PasswordField from "../../../components/PasswordField";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"details" | "otp">("details");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    api.get("/auth/me").then(() => router.replace("/app/jobs")).catch(() => {});
  }, [router]);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (!/^\+[1-9]\d{6,14}$/.test(phone)) {
      setError("Enter your phone in international format, e.g. +14155552671.");
      return;
    }
    setIsLoading(true);
    try {
      await api.post("/auth/register/send-otp", { phone });
      setStep("otp");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!otp) {
      setError("Enter the code sent to your phone.");
      return;
    }
    setIsLoading(true);
    try {
      await authRequest("register", { name, email: email.trim().toLowerCase(), password, phone, otp });
      router.push("/app/jobs");
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {step === "otp" && (
        <button onClick={() => setStep("details")} className="text-sm text-slate-400 hover:text-slate-300 mb-6">
          ← Back
        </button>
      )}
      <h1 className="text-3xl font-extrabold text-white mb-2">Create your account</h1>
      <p className="text-slate-400 mb-8">
        {step === "details" ? "Free to start, no credit card required" : `Enter the code we texted to ${phone}`}
      </p>

      {step === "details" ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <PasswordField
            label="Password"
            value={password}
            onChange={setPassword}
            placeholder="At least 8 characters"
            showRequirements
          />
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Phone number</label>
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+14155552671"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1.5 text-xs text-slate-500">Used to recover your account if you forget your password.</p>
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-blue-600 py-3.5 font-bold text-white hover:bg-blue-500 disabled:opacity-60"
          >
            {isLoading ? "Sending code..." : "Send Code"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Verification code</label>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-blue-600 py-3.5 font-bold text-white hover:bg-blue-500 disabled:opacity-60"
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-blue-500 hover:text-blue-400">
          Sign in
        </Link>
      </p>
    </>
  );
}
