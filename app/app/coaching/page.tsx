"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

const TITLES: Record<string, string> = {
  in_progress: "Coaching · In Progress",
  completed: "Coaching · Completed",
};

function CoachingContent() {
  const status = useSearchParams().get("status");
  return (
    <div className="p-8">
      <h1 className="text-2xl font-extrabold text-white mb-1">{status ? TITLES[status] ?? "Coaching" : "Coaching · All Sessions"}</h1>
      <p className="text-slate-400">Coming soon. AI voice interview coaching lands in a later build phase.</p>
    </div>
  );
}

export default function CoachingPage() {
  return (
    <Suspense fallback={null}>
      <CoachingContent />
    </Suspense>
  );
}
