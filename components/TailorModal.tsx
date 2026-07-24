"use client";

import { useEffect, useRef, useState } from "react";
import { api, ApiError } from "../lib/api";

interface Resume {
  _id: string;
  filename?: string;
  parsedProfile?: { name?: string; skills?: string[] };
  isActive: boolean;
}

function isParsed(r: Resume): boolean {
  return (r.parsedProfile?.skills?.length ?? 0) > 0;
}

interface ChatMessage {
  role: "user" | "system";
  text: string;
}

type Kind = "resume" | "coverletter";

interface Props {
  kind: Kind;
  jobId: string;
  applicationId: string | null;
  onClose: () => void;
  onApprove: (text: string, applicationId: string) => void;
}

const LABELS = {
  resume: { title: "Tailor Resume", noun: "resume", verb: "tailor" },
  coverletter: { title: "Generate Cover Letter", noun: "cover letter", verb: "generate" },
};

export default function TailorModal({ kind, jobId, applicationId, onClose, onApprove }: Props) {
  const { title, noun } = LABELS[kind];
  const [step, setStep] = useState<"pick" | "edit">(kind === "coverletter" ? "edit" : "pick");
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [currentApplicationId, setCurrentApplicationId] = useState<string | null>(applicationId);
  const [draft, setDraft] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [instruction, setInstruction] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (kind === "resume") {
      api.get<{ resumes: Resume[] }>("/resume").then((d) => {
        setResumes(d.resumes);
        const active = d.resumes.find((r) => r.isActive && isParsed(r));
        if (active) setSelectedResumeId(active._id);
      });
    } else {
      // Cover letters reuse the application's own resume — generate immediately.
      generateCoverLetter();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function generateResume() {
    if (!selectedResumeId) return;
    setBusy(true);
    setError(null);
    try {
      const d = await api.post<{ applicationId: string; tailoredResume: string }>("/generate/tailor", {
        jobId,
        resumeId: selectedResumeId,
      });
      setCurrentApplicationId(d.applicationId);
      setDraft(d.tailoredResume);
      setStep("edit");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to tailor resume");
    } finally {
      setBusy(false);
    }
  }

  async function generateCoverLetter() {
    if (!applicationId) {
      setError("Save or tailor this job first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const d = await api.post<{ coverLetter: string }>("/generate/coverletter", { applicationId });
      setDraft(d.coverLetter);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to generate cover letter");
    } finally {
      setBusy(false);
    }
  }

  async function handleSendInstruction() {
    const text = instruction.trim();
    const appId = currentApplicationId;
    if (!text || !appId || busy) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInstruction("");
    setBusy(true);
    setError(null);
    try {
      const path = kind === "resume" ? "/generate/tailor/revise" : "/generate/coverletter/revise";
      const key = kind === "resume" ? "tailoredResume" : "coverLetter";
      const d = await api.post<Record<string, string>>(path, { applicationId: appId, instruction: text });
      setDraft(d[key]);
      setMessages((m) => [...m, { role: "system", text: "Updated the draft below." }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "system", text: "Couldn't apply that change — try rephrasing." }]);
      setError(e instanceof ApiError ? e.message : "Failed to revise");
    } finally {
      setBusy(false);
    }
  }

  function handleApprove() {
    if (currentApplicationId) onApprove(draft, currentApplicationId);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm p-6">
      <div className="w-full max-w-4xl h-[85vh] rounded-2xl border border-slate-800 bg-slate-900 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 text-xl leading-none">×</button>
        </div>

        {step === "pick" ? (
          <div className="flex-1 overflow-y-auto p-6">
            <p className="text-slate-400 text-sm mb-4">Which resume should CareerOS tailor for this job?</p>
            <div className="space-y-2 mb-6">
              {resumes.map((r) => {
                const parsed = isParsed(r);
                return (
                  <label
                    key={r._id}
                    className={`flex items-center gap-3 rounded-xl border p-4 ${!parsed ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${
                      selectedResumeId === r._id ? "border-blue-500 bg-blue-950/30" : "border-slate-800 bg-slate-900"
                    }`}
                  >
                    <input
                      type="radio"
                      disabled={!parsed}
                      checked={selectedResumeId === r._id}
                      onChange={() => setSelectedResumeId(r._id)}
                    />
                    <span className="text-white text-sm font-medium">
                      {r.filename || r.parsedProfile?.name || "Resume"} {r.isActive && <span className="text-xs text-blue-400">(Active)</span>}
                      {!parsed && <span className="text-xs text-red-400"> (failed to parse — delete and re-upload)</span>}
                    </span>
                  </label>
                );
              })}
              {resumes.length === 0 && <p className="text-slate-500 text-sm">No resumes uploaded yet.</p>}
            </div>
            {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
            <button
              onClick={generateResume}
              disabled={!selectedResumeId || busy}
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-500 disabled:opacity-60"
            >
              {busy ? "Tailoring..." : "Tailor This Resume"}
            </button>
          </div>
        ) : (
          <div className="flex-1 flex min-h-0">
            <div className="flex-1 overflow-y-auto p-6 border-r border-slate-800">
              {busy && !draft ? (
                <p className="text-slate-400 text-sm">Generating...</p>
              ) : (
                <p className="text-slate-200 text-sm whitespace-pre-wrap">{draft}</p>
              )}
            </div>
            <div className="w-80 shrink-0 flex flex-col">
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                <p className="text-xs text-slate-500">
                  Ask for changes, e.g. &quot;make it more concise&quot; or &quot;emphasize my leadership experience&quot;.
                </p>
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={`text-sm rounded-xl px-3 py-2 ${
                      m.role === "user" ? "bg-blue-600 text-white ml-6" : "bg-slate-800 text-slate-300 mr-6"
                    }`}
                  >
                    {m.text}
                  </div>
                ))}
              </div>
              {error && <p className="text-xs text-red-400 px-4">{error}</p>}
              <div className="p-4 border-t border-slate-800 flex gap-2">
                <input
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendInstruction()}
                  placeholder="Request a change..."
                  disabled={busy || !draft}
                  className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
                />
                <button
                  onClick={handleSendInstruction}
                  disabled={busy || !draft || !instruction.trim()}
                  className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
                >
                  Send
                </button>
              </div>
              <div className="p-4 border-t border-slate-800">
                <button
                  onClick={handleApprove}
                  disabled={!draft}
                  className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-500 disabled:opacity-60"
                >
                  Approve &amp; Download
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
