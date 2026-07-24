"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, ApiError } from "../../../lib/api";

type Status = "saved" | "tailoring" | "ready" | "applied" | "interviewing" | "offer" | "rejected";

const COLUMNS: { status: Status; label: string }[] = [
  { status: "saved", label: "Saved" },
  { status: "tailoring", label: "Tailoring" },
  { status: "ready", label: "Ready" },
  { status: "applied", label: "Applied" },
  { status: "interviewing", label: "Interviewing" },
  { status: "offer", label: "Offer" },
  { status: "rejected", label: "Rejected" },
];

interface Application {
  _id: string;
  jobId: { _id: string; title: string; company: string } | null;
  status: Status;
  matchScore: number;
}

export default function TrackerPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);

  function load() {
    api
      .get<{ applications: Application[] }>("/applications")
      .then((d) => setApplications(d.applications.filter((a) => a.jobId)))
      .catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load applications"));
  }

  useEffect(load, []);

  async function handleMove(id: string, status: Status) {
    setMovingId(id);
    setError(null);
    const payload = status === "applied" ? { status, appliedAt: new Date().toISOString() } : { status };
    try {
      const d = await api.patch<{ application: Application }>(`/applications/${id}`, payload);
      setApplications((prev) => prev.map((a) => (a._id === id ? d.application : a)));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to update status");
    } finally {
      setMovingId(null);
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-extrabold text-white mb-1">Tracker</h1>
      <p className="text-slate-400 mb-6">Every job you've saved or applied to, grouped by stage.</p>
      {error && <p className="text-red-400 mb-4">{error}</p>}

      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const items = applications.filter((a) => a.status === col.status);
          return (
            <div key={col.status} className="w-64 shrink-0">
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-xs font-bold uppercase tracking-wide text-slate-400">{col.label}</h2>
                <span className="text-xs text-slate-600">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((a) => (
                  <div key={a._id} className="rounded-xl border border-slate-800 bg-slate-900 p-3">
                    <Link href={`/app/jobs/${a.jobId!._id}`} className="block mb-2">
                      <p className="text-sm font-semibold text-white truncate">{a.jobId!.title}</p>
                      <p className="text-xs text-slate-500 truncate">{a.jobId!.company}</p>
                    </Link>
                    <select
                      value={a.status}
                      disabled={movingId === a._id}
                      onChange={(e) => handleMove(a._id, e.target.value as Status)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60"
                    >
                      {COLUMNS.map((c) => (
                        <option key={c.status} value={c.status}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                ))}
                {items.length === 0 && <p className="text-xs text-slate-600 px-1">Nothing here</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
