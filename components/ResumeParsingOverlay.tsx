"use client";

import { useEffect, useState } from "react";
import { useResumeUpload } from "../lib/resumeUploadContext";

const STAGES = [
  "Uploading your resume...",
  "Reading your experience...",
  "Extracting your skills...",
  "Matching you to roles...",
];

function ShimmerLine({ width }: { width: string }) {
  return (
    <div
      className="h-3 rounded-full bg-slate-800 relative overflow-hidden"
      style={{ width }}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-slate-600/60 to-transparent" />
    </div>
  );
}

export default function ResumeParsingOverlay() {
  const { phase, error, dismissError } = useResumeUpload();
  const [stageIndex, setStageIndex] = useState(0);
  const [progress, setProgress] = useState(8);

  const active = phase === "uploading" || phase === "parsing";

  useEffect(() => {
    if (!active) {
      setStageIndex(0);
      setProgress(8);
      return;
    }
    const stageTimer = setInterval(() => {
      setStageIndex((i) => Math.min(i + 1, STAGES.length - 1));
    }, 4000);
    // Eases toward 92% and holds. Never claims 100% until we actually know it's done.
    const progressTimer = setInterval(() => {
      setProgress((p) => (p < 92 ? p + (92 - p) * 0.08 : p));
    }, 400);
    return () => {
      clearInterval(stageTimer);
      clearInterval(progressTimer);
    };
  }, [active]);

  if (phase === "error" && error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm">
        <div className="max-w-sm rounded-2xl border border-red-950 bg-slate-900 p-6 text-center">
          <p className="text-red-400 font-semibold mb-2">Something went wrong</p>
          <p className="text-slate-400 text-sm mb-5">{error}</p>
          <button
            onClick={dismissError}
            className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  if (!active) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <style>{`@keyframes shimmer { 100% { transform: translateX(100%); } }`}</style>
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-blue-950 flex items-center justify-center text-lg">📄</div>
          <div>
            <p className="text-white font-bold">{STAGES[stageIndex]}</p>
            <p className="text-slate-500 text-xs">Please don't close or refresh this page</p>
          </div>
        </div>

        <div className="space-y-2.5 mb-6">
          <ShimmerLine width="100%" />
          <ShimmerLine width="88%" />
          <ShimmerLine width="94%" />
          <ShimmerLine width="70%" />
          <ShimmerLine width="82%" />
        </div>

        <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
