"use client";

import { useEffect, useState } from "react";
import { api } from "../../../lib/api";

interface Application {
  _id: string;
  jobId: { _id: string; title: string; company: string } | null;
  status: string;
  coverLetter: string;
  appliedAt: string | null;
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function CoverLettersPage() {
  const [letters, setLetters] = useState<Application[]>([]);

  useEffect(() => {
    api
      .get<{ applications: Application[] }>("/applications")
      .then((d) => setLetters(d.applications.filter((a) => a.coverLetter)))
      .catch(() => {});
  }, []);

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-extrabold text-white mb-1">Cover Letters · Generated</h1>
      <p className="text-slate-400 mb-8">Every AI-generated cover letter, one per job.</p>

      <div className="space-y-3">
        {letters.length === 0 && <p className="text-slate-500 text-sm">No cover letters generated yet. Generate one from a job's page.</p>}
        {letters.map((a) => (
          <div key={a._id} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-white font-semibold">{a.jobId?.title ?? "Job no longer listed"}</p>
            <p className="text-sm text-slate-500 mb-3">
              {a.jobId?.company}
              {a.appliedAt ? ` · Applied ${new Date(a.appliedAt).toLocaleDateString()}` : ` · ${a.status}`}
            </p>
            <button
              onClick={() => downloadText(`cover-letter-${a.jobId?.company ?? a._id}.txt`, a.coverLetter)}
              className="text-sm font-semibold text-blue-400 hover:text-blue-300"
            >
              Download Cover Letter
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
