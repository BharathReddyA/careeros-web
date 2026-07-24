"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api, ApiError } from "../../../lib/api";
import { useResumeUpload } from "../../../lib/resumeUploadContext";

interface Resume {
  _id: string;
  cloudinaryUrl: string;
  filename?: string;
  isActive: boolean;
  createdAt: string;
  parsedProfile?: { name: string; skills: string[]; titles: string[] };
}

function resumeDisplayName(r: Resume): string {
  return r.filename || r.parsedProfile?.name || "Resume";
}

interface Application {
  _id: string;
  jobId: { _id: string; title: string; company: string } | null;
  status: string;
  tailoredResumeText: string;
  appliedAt: string | null;
  createdAt: string;
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

function ResumeContent() {
  const tab = useSearchParams().get("tab") === "updated" ? "updated" : "uploaded";
  const { phase, startUpload } = useResumeUpload();
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [updated, setUpdated] = useState<Application[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function loadResumes() {
    api.get<{ resumes: Resume[] }>("/resume").then((d) => setResumes(d.resumes)).catch(() => {});
  }

  function loadUpdated() {
    api
      .get<{ applications: Application[] }>("/applications")
      .then((d) => setUpdated(d.applications.filter((a) => a.tailoredResumeText)))
      .catch(() => {});
  }

  useEffect(() => {
    loadResumes();
    loadUpdated();
  }, []);

  // Refresh the lists once a background parse finishes (phase returns to idle).
  useEffect(() => {
    if (phase === "idle") {
      loadResumes();
      loadUpdated();
    }
  }, [phase]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) startUpload(file);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this resume?")) return;
    try {
      await api.delete(`/resume/${id}`);
      loadResumes();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to delete resume");
    }
  }

  const busy = phase === "uploading" || phase === "parsing";

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-extrabold text-white mb-1">Resume {tab === "updated" ? "· Updated" : "· Uploaded"}</h1>
      <p className="text-slate-400 mb-6">
        {tab === "updated"
          ? "AI-tailored resume versions, one per job you've tailored for."
          : "Upload a resume. CareerOS parses it with AI to match you with jobs."}
      </p>

      {tab === "uploaded" && (
        <>
          <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
            className="w-full rounded-2xl border-2 border-dashed border-slate-700 bg-slate-900 p-10 text-center hover:border-slate-600 disabled:opacity-60"
          >
            <p className="text-slate-200 font-semibold">Upload Resume</p>
            <p className="text-slate-500 text-sm mt-1">PDF format only · Max 10MB</p>
          </button>

          {error && <p className="text-sm text-red-400 mt-3">{error}</p>}

          <div className="mt-8 space-y-3">
            {resumes.length === 0 && <p className="text-slate-500 text-sm">No resumes uploaded yet.</p>}
            {resumes.map((r) => (
              <div key={r._id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900 p-4">
                <div>
                  <p className="text-white font-semibold">
                    {resumeDisplayName(r)} {r.isActive && <span className="ml-2 rounded-full bg-blue-950 px-2 py-0.5 text-xs font-bold text-blue-400">Active</span>}
                  </p>
                  <p className="text-sm text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <button onClick={() => handleDelete(r._id)} className="text-sm font-semibold text-red-400 hover:text-red-300">
                  Delete
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "updated" && (
        <div className="space-y-3">
          {updated.length === 0 && <p className="text-slate-500 text-sm">No AI-tailored resumes yet. Tailor one from a job's page.</p>}
          {updated.map((a) => (
            <div key={a._id} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <p className="text-white font-semibold">{a.jobId?.title ?? "Job no longer listed"}</p>
              <p className="text-sm text-slate-500 mb-3">
                {a.jobId?.company}
                {a.appliedAt ? ` · Applied ${new Date(a.appliedAt).toLocaleDateString()}` : ` · ${a.status}`}
              </p>
              <button
                onClick={() => downloadText(`resume-${a.jobId?.company ?? a._id}.txt`, a.tailoredResumeText)}
                className="text-sm font-semibold text-blue-400 hover:text-blue-300"
              >
                Download Resume
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ResumePage() {
  return (
    <Suspense fallback={null}>
      <ResumeContent />
    </Suspense>
  );
}
