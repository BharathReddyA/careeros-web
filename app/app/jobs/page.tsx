"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api, ApiError } from "../../../lib/api";
import { useResumeUpload } from "../../../lib/resumeUploadContext";

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  jobType?: string;
  salary?: { min: number; max: number; currency: string };
}

interface FeedItem {
  applicationId: string;
  job: Job;
  matchScore: number;
  matchReasons: string[];
  status: string;
}

interface Application {
  _id: string;
  jobId: Job | null;
  status: string;
  matchScore: number;
}

interface Resume {
  _id: string;
  isActive: boolean;
  filename?: string;
  parsedProfile?: { name?: string; titles?: string[] };
}

function scoreColor(score: number) {
  if (score >= 80) return "text-emerald-400 bg-emerald-950";
  if (score >= 60) return "text-amber-400 bg-amber-950";
  return "text-slate-400 bg-slate-800";
}

const TITLES: Record<string, { title: string; subtitle: string }> = {
  saved: { title: "Saved Jobs", subtitle: "Jobs you've saved for later." },
  applied: { title: "Applied Jobs", subtitle: "Jobs you've applied to." },
  viewed: { title: "Viewed Jobs", subtitle: "Jobs you've recently looked at." },
};

function resumeLabel(r: Resume, index: number) {
  return r.filename || r.parsedProfile?.name || `Resume ${index + 1}`;
}

function JobFeedContent() {
  const filter = useSearchParams().get("filter");
  const { startUpload } = useResumeUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>("");
  const [feed, setFeed] = useState<FeedItem[] | null>(null);
  const [browseJobs, setBrowseJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [needsResume, setNeedsResume] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const pollAttempts = useRef(0);

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");
  const [salaryMin, setSalaryMin] = useState("");

  const isPlainFeed = !filter;

  useEffect(() => {
    if (isPlainFeed) {
      api
        .get<{ resumes: Resume[] }>("/resume")
        .then((d) => {
          setResumes(d.resumes);
          const active = d.resumes.find((r) => r.isActive);
          if (active) setSelectedResumeId(active._id);
        })
        .catch(() => {});
    }
  }, [isPlainFeed]);

  function loadFeed(resumeId?: string) {
    const qs = resumeId ? `?resumeId=${resumeId}` : "";
    return api
      .get<{ feed: FeedItem[] }>(`/jobs/feed${qs}`)
      .then((data) => {
        setFeed(data.feed);
        setNeedsResume(false);
        setError(null);
        return data.feed;
      })
      .catch((e) => {
        if (e instanceof ApiError && e.status === 404) {
          setNeedsResume(true);
          api.get<{ jobs: Job[] }>("/jobs").then((d) => setBrowseJobs(d.jobs)).catch(() => {});
        } else {
          setError(e instanceof ApiError ? e.message : "Failed to load job feed");
        }
        return null;
      });
  }

  function loadFilteredList(status: "saved" | "applied") {
    api
      .get<{ applications: Application[] }>(`/applications?status=${status}`)
      .then((d) => {
        setFeed(
          d.applications
            .filter((a) => a.jobId)
            .map((a) => ({
              applicationId: a._id,
              job: a.jobId as Job,
              matchScore: a.matchScore,
              matchReasons: [],
              status: a.status,
            }))
        );
      })
      .catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load"));
  }

  function loadViewed() {
    api
      .get<{ jobs: Job[] }>("/jobs/viewed")
      .then((d) => setBrowseJobs(d.jobs))
      .catch((e) => setError(e instanceof ApiError ? e.message : "Failed to load"));
  }

  useEffect(() => {
    setFeed(null);
    setBrowseJobs([]);
    setError(null);
    setNeedsResume(false);
    if (filter === "saved" || filter === "applied") loadFilteredList(filter);
    else if (filter === "viewed") loadViewed();
    else loadFeed(selectedResumeId || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, selectedResumeId]);

  function pollAfterRefresh(resumeId?: string) {
    pollAttempts.current++;
    loadFeed(resumeId).then((newFeed) => {
      if ((newFeed && newFeed.length > 0) || pollAttempts.current >= 12) {
        setIsRefreshing(false);
      } else {
        setTimeout(() => pollAfterRefresh(resumeId), 5000);
      }
    });
  }

  async function handleRefresh() {
    setIsRefreshing(true);
    setError(null);
    try {
      await api.post("/jobs/refresh", selectedResumeId ? { resumeId: selectedResumeId } : {});
      pollAttempts.current = 0;
      setTimeout(() => pollAfterRefresh(selectedResumeId || undefined), 5000);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Failed to refresh matches");
      setIsRefreshing(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) startUpload(file);
  }

  const meta = filter ? TITLES[filter] : null;

  // Unify whatever source is active into one list to search/filter over.
  const allJobs: { job: Job; matchScore?: number; applicationId?: string }[] = feed
    ? feed.map((f) => ({ job: f.job, matchScore: f.matchScore, applicationId: f.applicationId }))
    : browseJobs.map((j) => ({ job: j }));

  const jobTypes = useMemo(
    () => Array.from(new Set(allJobs.map((j) => j.job.jobType).filter(Boolean))) as string[],
    [allJobs]
  );

  const visible = allJobs.filter(({ job }) => {
    if (search) {
      const q = search.toLowerCase();
      if (!job.title.toLowerCase().includes(q) && !job.company.toLowerCase().includes(q)) return false;
    }
    if (location && !job.location?.toLowerCase().includes(location.toLowerCase())) return false;
    if (jobType && job.jobType !== jobType) return false;
    if (salaryMin) {
      const max = job.salary?.max ?? job.salary?.min ?? 0;
      if (max < Number(salaryMin)) return false;
    }
    return true;
  });

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-white mb-1">{meta?.title ?? "Job Feed"}</h1>
          <p className="text-slate-400">
            {meta?.subtitle ?? (needsResume ? "Browse listings, or upload a resume to get jobs matched to you." : "Jobs matched to your active resume, ranked by fit.")}
          </p>
        </div>
        {isPlainFeed && !needsResume && (
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="shrink-0 rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
          >
            {isRefreshing ? "Refreshing..." : "Refresh matches"}
          </button>
        )}
      </div>

      {isPlainFeed && resumes.length > 1 && !needsResume && (
        <div className="mb-6">
          <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1.5">Showing matches for</label>
          <select
            value={selectedResumeId}
            onChange={(e) => setSelectedResumeId(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {resumes.map((r, i) => (
              <option key={r._id} value={r._id}>{resumeLabel(r, i)}</option>
            ))}
          </select>
        </div>
      )}

      {isPlainFeed && needsResume && (
        <div className="rounded-xl border border-blue-900 bg-blue-950/30 p-5 mb-8 flex items-center justify-between gap-4">
          <p className="text-slate-200 text-sm">Upload a resume to get jobs matched and scored to your experience.</p>
          <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileChange} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
          >
            Upload Resume
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title or company"
          className="flex-1 min-w-[180px] rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          className="w-40 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {jobTypes.length > 0 && (
          <select
            value={jobType}
            onChange={(e) => setJobType(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Any type</option>
            {jobTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        )}
        <input
          value={salaryMin}
          onChange={(e) => setSalaryMin(e.target.value.replace(/\D/g, ""))}
          placeholder="Min salary"
          inputMode="numeric"
          className="w-32 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      {visible.length === 0 && !(isPlainFeed && needsResume) && !isRefreshing && (
        <p className="text-slate-400">
          {allJobs.length > 0 ? "No jobs match your search/filters." : filter ? "Nothing here yet." : "No matches yet. Try Refresh matches, or check back later."}
        </p>
      )}

      <div className="space-y-3">
        {visible.map(({ job, matchScore, applicationId }) => (
          <Link
            key={applicationId ?? job._id}
            href={`/app/jobs/${job._id}`}
            className="block rounded-xl border border-slate-800 bg-slate-900 p-5 hover:border-slate-700"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-white">{job.title}</h3>
                <p className="text-sm text-slate-400">{job.company} · {job.location}</p>
              </div>
              {isPlainFeed && matchScore !== undefined && (
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${scoreColor(matchScore)}`}>
                  {matchScore}% match
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function JobFeedPage() {
  return (
    <Suspense fallback={null}>
      <JobFeedContent />
    </Suspense>
  );
}
