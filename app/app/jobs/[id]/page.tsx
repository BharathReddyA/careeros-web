"use client";

import { use, useEffect, useState } from "react";
import { api, ApiError } from "../../../../lib/api";
import TailorModal from "../../../../components/TailorModal";

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  applyUrl: string;
  salary?: { min: number; max: number; currency: string };
  jobType?: string;
  postedAt?: string;
}

interface Application {
  _id: string;
  status: string;
  matchScore: number;
  missingSkills: string[];
  appliedAt: string | null;
  resumeId: string;
  tailoredResumeText: string;
  coverLetter: string;
  outreachMessage: string;
}

function formatSalary(s?: Job["salary"]) {
  if (!s || (!s.min && !s.max)) return null;
  const fmt = (n: number) => `$${Math.round(n / 1000)}k`;
  if (s.min && s.max) return `${fmt(s.min)} - ${fmt(s.max)}`;
  return fmt(s.min || s.max);
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

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [job, setJob] = useState<Job | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [hasClickedApply, setHasClickedApply] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<"resume" | "coverletter" | null>(null);

  function load() {
    api
      .get<{ job: Job; application: Application | null }>(`/jobs/${id}`)
      .then((d) => {
        setJob(d.job);
        setApplication(d.application);
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load job"));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleSave() {
    setBusy("save");
    setError(null);
    try {
      const d = await api.post<{ application: Application }>("/applications", { jobId: id });
      setApplication(d.application);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to save job");
    } finally {
      setBusy(null);
    }
  }

  async function handleMarkApplied() {
    if (!application) return;
    setBusy("applied");
    setError(null);
    try {
      const d = await api.patch<{ application: Application }>(`/applications/${application._id}`, {
        status: "applied",
        appliedAt: new Date().toISOString(),
      });
      setApplication(d.application);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to update status");
    } finally {
      setBusy(null);
    }
  }

  async function handleGenerateOutreach() {
    if (!application) return;
    setBusy("outreach");
    setError(null);
    try {
      const d = await api.post<{ outreachMessage: string }>("/generate/outreach", { applicationId: application._id });
      setApplication((prev) => (prev ? { ...prev, outreachMessage: d.outreachMessage } : prev));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to generate outreach message");
    } finally {
      setBusy(null);
    }
  }

  function handleModalApprove(text: string, applicationId: string) {
    setApplication((prev) => {
      const base: Application = prev ?? {
        _id: applicationId,
        status: "ready",
        matchScore: 0,
        missingSkills: [],
        appliedAt: null,
        resumeId: "",
        tailoredResumeText: "",
        coverLetter: "",
        outreachMessage: "",
      };
      const updated =
        modal === "resume" ? { ...base, _id: applicationId, tailoredResumeText: text } : { ...base, _id: applicationId, coverLetter: text };
      const filename = modal === "resume" ? `resume-${job?.company}.txt` : `cover-letter-${job?.company}.txt`;
      downloadText(filename, text);
      return updated;
    });
  }

  if (error && !job) return <div className="p-8 text-red-400">{error}</div>;
  if (!job) return <div className="p-8 text-slate-400">Loading...</div>;

  const salary = formatSalary(job.salary);

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-extrabold text-white mb-1">{job.title}</h1>
      <p className="text-slate-400 mb-1">{job.company} · {job.location}</p>
      <p className="text-slate-500 text-sm mb-6">
        {[salary, job.jobType, job.postedAt ? new Date(job.postedAt).toLocaleDateString() : null].filter(Boolean).join(" · ")}
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <a
          href={job.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setHasClickedApply(true)}
          className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-500"
        >
          Apply on {job.company || "employer site"} ↗
        </a>

        {!application ? (
          <button
            onClick={handleSave}
            disabled={busy === "save"}
            className="rounded-xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
          >
            {busy === "save" ? "Saving..." : "Save"}
          </button>
        ) : application.status !== "applied" ? (
          <button
            onClick={handleMarkApplied}
            disabled={busy === "applied" || !hasClickedApply}
            title={!hasClickedApply ? "Click Apply first" : undefined}
            className="rounded-xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {busy === "applied" ? "Updating..." : "Mark as Applied"}
          </button>
        ) : (
          <span className="rounded-xl bg-emerald-950 px-5 py-3 text-sm font-semibold text-emerald-400">
            Applied {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : ""}
          </span>
        )}

        {application && application.matchScore > 0 && (
          <span className="rounded-full bg-blue-950 px-3 py-1.5 text-xs font-bold text-blue-400">
            {application.matchScore}% match
          </span>
        )}
      </div>

      {application && application.missingSkills.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Skills this role wants that aren&apos;t on your resume</p>
          <div className="flex flex-wrap gap-2">
            {application.missingSkills.map((s) => (
              <span key={s} className="rounded-full bg-amber-950 px-2.5 py-1 text-xs font-semibold text-amber-400">{s}</span>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-8">
        <button
          onClick={() => setModal("resume")}
          className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          {application?.tailoredResumeText ? "Re-tailor Resume" : "Tailor Resume"}
        </button>
        {application?.tailoredResumeText && (
          <button
            onClick={() => downloadText(`resume-${job.company}.txt`, application.tailoredResumeText)}
            className="text-sm font-semibold text-blue-400 hover:text-blue-300"
          >
            Download Tailored Resume
          </button>
        )}

        <button
          onClick={() => setModal("coverletter")}
          disabled={!application}
          title={!application ? "Save or tailor this job first" : undefined}
          className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {application?.coverLetter ? "Regenerate Cover Letter" : "Generate Cover Letter"}
        </button>
        {application?.coverLetter && (
          <button
            onClick={() => downloadText(`cover-letter-${job.company}.txt`, application.coverLetter)}
            className="text-sm font-semibold text-blue-400 hover:text-blue-300"
          >
            Download Cover Letter
          </button>
        )}

        <button
          onClick={handleGenerateOutreach}
          disabled={!application || busy === "outreach"}
          title={!application ? "Save or tailor this job first" : undefined}
          className="rounded-xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {busy === "outreach" ? "Generating..." : application?.outreachMessage ? "Regenerate Outreach Message" : "Generate Outreach Message"}
        </button>
        {application?.outreachMessage && (
          <button
            onClick={() => downloadText(`outreach-${job.company}.txt`, application.outreachMessage)}
            className="text-sm font-semibold text-blue-400 hover:text-blue-300"
          >
            Download Outreach Message
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

      <p className="text-slate-300 whitespace-pre-wrap">{job.description}</p>

      {modal && (
        <TailorModal
          kind={modal}
          jobId={id}
          applicationId={application?._id ?? null}
          onClose={() => {
            setModal(null);
            load();
          }}
          onApprove={handleModalApprove}
        />
      )}
    </div>
  );
}
