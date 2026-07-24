"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "../../../lib/api";

interface User {
  id: string;
  email: string;
  name: string;
  isPro: boolean;
}

interface Application {
  _id: string;
  status: string;
}

function Analytics({ applications }: { applications: Application[] }) {
  const applied = applications.filter((a) => a.status !== "saved" && a.status !== "tailoring" && a.status !== "ready");
  const responded = applications.filter((a) => ["interviewing", "offer", "rejected"].includes(a.status));
  const responseRate = applied.length > 0 ? Math.round((responded.length / applied.length) * 100) : null;

  const stats = [
    { label: "Applied", value: applied.length },
    { label: "Interviewing", value: applications.filter((a) => a.status === "interviewing").length },
    { label: "Offers", value: applications.filter((a) => a.status === "offer").length },
    { label: "Response rate", value: responseRate === null ? "—" : `${responseRate}%` },
  ];

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 mb-8">
      <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400 mb-4">Analytics</h2>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-2xl font-extrabold text-white">{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ user: User }>("/auth/me").then((d) => setUser(d.user)).catch(() => {});
    api.get<{ applications: Application[] }>("/applications").then((d) => setApplications(d.applications)).catch(() => {});
  }, []);

  async function handleDeleteAccount() {
    if (!deletePassword) {
      setError("Enter your password to confirm.");
      return;
    }
    setError(null);
    setIsDeleting(true);
    try {
      await api.delete("/auth/me", { password: deletePassword });
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to delete account");
      setIsDeleting(false);
    }
  }

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-2xl font-extrabold text-white mb-1">Profile</h1>
      <p className="text-slate-400 mb-6">Stats and settings land in a later build phase.</p>
      {user && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 mb-8">
          <p className="text-white font-semibold">{user.name}</p>
          <p className="text-sm text-slate-400">{user.email}</p>
          <p className="text-sm text-slate-500 mt-1">{user.isPro ? "CareerOS Pro" : "Free plan"}</p>
        </div>
      )}

      <Analytics applications={applications} />

      <div className="rounded-xl border border-red-950 bg-red-950/20 p-5">
        <h2 className="text-sm font-bold uppercase tracking-wide text-red-400 mb-3">Danger Zone</h2>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="text-sm font-semibold text-red-400 hover:text-red-300"
          >
            Delete Account
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-300">
              This permanently deletes your account, resumes, and applications. Enter your password to confirm.
            </p>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Password"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteConfirm(false); setDeletePassword(""); setError(null); }}
                className="flex-1 rounded-xl bg-slate-800 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-500 disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
