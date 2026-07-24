"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api, ApiError } from "./api";

type Phase = "idle" | "uploading" | "parsing" | "error";

interface ResumeUploadState {
  phase: Phase;
  error: string | null;
  startUpload: (file: File) => void;
  dismissError: () => void;
}

const ResumeUploadContext = createContext<ResumeUploadState | null>(null);

export function useResumeUpload(): ResumeUploadState {
  const ctx = useContext(ResumeUploadContext);
  if (!ctx) throw new Error("useResumeUpload must be used within ResumeUploadProvider");
  return ctx;
}

export function ResumeUploadProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const resumeIdRef = useRef<string | null>(null);
  const pollAttempts = useRef(0);
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  // Cancel the in-flight parse if the user leaves the page while we're mid-parse.
  useEffect(() => {
    if (phase !== "parsing" || !resumeIdRef.current) return;

    function cancelPending() {
      if (resumeIdRef.current) {
        navigator.sendBeacon(`/api/backend/resume/${resumeIdRef.current}/cancel`, new Blob());
      }
    }
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      e.preventDefault();
      e.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", cancelPending);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", cancelPending);
    };
  }, [phase]);

  const pollForParsedResume = useCallback(() => {
    pollAttempts.current++;
    const uploadedId = resumeIdRef.current;
    api
      .get<{ resumes: { _id: string; parsedProfile?: { skills?: string[] } }[] }>("/resume")
      .then((d) => {
        // Must check the specific resume we just uploaded, not just "whatever is active" —
        // if an older resume was already active, /resume/active would falsely report success
        // for this upload before it's actually parsed.
        const thisResume = d.resumes.find((r) => r._id === uploadedId);
        if ((thisResume?.parsedProfile?.skills?.length ?? 0) > 0) {
          setPhase("idle");
          resumeIdRef.current = null;
          api.post("/jobs/refresh", { resumeId: uploadedId }).catch(() => {});
          if (pathnameRef.current !== "/app/jobs") router.push("/app/jobs");
          else router.refresh();
        } else if (pollAttempts.current < 30) {
          setTimeout(pollForParsedResume, 3000);
        } else {
          setPhase("error");
          setError("Resume parsing timed out. Please try again.");
        }
      })
      .catch(() => {
        if (pollAttempts.current < 30) setTimeout(pollForParsedResume, 3000);
        else setPhase("error");
      });
  }, [router]);

  const startUpload = useCallback(
    (file: File) => {
      if (file.type !== "application/pdf") {
        setError("Only PDF files are supported");
        setPhase("error");
        return;
      }
      setError(null);
      setPhase("uploading");

      const formData = new FormData();
      formData.append("resume", file);

      api
        .post<{ resumeId: string }>("/resume/upload", formData)
        .then((d) => {
          resumeIdRef.current = d.resumeId;
          setPhase("parsing");
          pollAttempts.current = 0;
          setTimeout(pollForParsedResume, 3000);
        })
        .catch((e) => {
          setError(e instanceof ApiError ? e.message : "Upload failed");
          setPhase("error");
        });
    },
    [pollForParsedResume]
  );

  const dismissError = useCallback(() => {
    setPhase("idle");
    setError(null);
  }, []);

  return (
    <ResumeUploadContext.Provider value={{ phase, error, startUpload, dismissError }}>
      {children}
    </ResumeUploadContext.Provider>
  );
}
