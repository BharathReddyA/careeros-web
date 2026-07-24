"use client";

import "../globals.css";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { api } from "../../lib/api";
import { ResumeUploadProvider } from "../../lib/resumeUploadContext";
import ResumeParsingOverlay from "../../components/ResumeParsingOverlay";

interface User {
  id: string;
  email: string;
  name: string;
  isPro: boolean;
}

interface NavItem {
  href: string;
  label: string;
}

interface NavGroup {
  label: string;
  icon: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Jobs",
    icon: "📋",
    items: [
      { href: "/app/jobs", label: "Feed" },
      { href: "/app/jobs?filter=saved", label: "Saved" },
      { href: "/app/jobs?filter=applied", label: "Applied" },
      { href: "/app/jobs?filter=viewed", label: "Viewed" },
    ],
  },
  {
    label: "Resume",
    icon: "📄",
    items: [
      { href: "/app/resume", label: "Uploaded" },
      { href: "/app/resume?tab=updated", label: "Updated" },
    ],
  },
  {
    label: "Cover Letter",
    icon: "✉️",
    items: [{ href: "/app/cover-letters", label: "Generated" }],
  },
  {
    label: "Coaching",
    icon: "🎙️",
    items: [
      { href: "/app/coaching", label: "All Sessions" },
      { href: "/app/coaching?status=in_progress", label: "In Progress" },
      { href: "/app/coaching?status=completed", label: "Completed" },
    ],
  },
];

const STANDALONE: NavItem = { href: "/app/tracker", label: "Tracker" };
const STANDALONE_ICON = "📌";

function NavGroupSection({ group, currentHref }: { group: NavGroup; currentHref: string }) {
  const hasActiveChild = group.items.some((item) => item.href === currentHref);
  const [open, setOpen] = useState(true);

  return (
    <div className="mb-1">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-500 hover:text-slate-300"
      >
        <span className="text-sm">{group.icon}</span>
        <span className="flex-1 text-left">{group.label}</span>
        <span className={`transition-transform ${open ? "rotate-180" : ""}`}>⌄</span>
      </button>
      {open && (
        <div className="ml-2 border-l border-slate-800 pl-3 space-y-0.5 mb-2">
          {group.items.map((item) => {
            const active = item.href === currentHref;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block rounded-lg px-3 py-1.5 text-sm font-medium ${
                  active ? "bg-blue-950 text-blue-400" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  const search = searchParams.toString();
  const currentHref = search ? `${pathname}?${search}` : pathname;

  useEffect(() => {
    api
      .get<{ user: User }>("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => router.replace("/login"));
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  return (
    <ResumeUploadProvider>
      <div className="min-h-screen bg-slate-950 flex">
        <ResumeParsingOverlay />
        <aside className="w-60 shrink-0 border-r border-slate-800 bg-slate-900 flex flex-col">
          <div className="px-5 py-5 text-lg font-extrabold text-blue-500">CareerOS</div>

          <nav className="flex-1 px-3 overflow-y-auto">
            {NAV_GROUPS.map((group) => (
              <NavGroupSection key={group.label} group={group} currentHref={currentHref} />
            ))}

            <Link
              href={STANDALONE.href}
              className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold ${
                pathname === STANDALONE.href ? "bg-blue-950 text-blue-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>{STANDALONE_ICON}</span>
              {STANDALONE.label}
            </Link>
          </nav>

          <div className="px-3 py-4 border-t border-slate-800 mt-auto">
            {user && (
              <div className="px-3 pb-2">
                <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-500">{user.isPro ? "Pro" : "Free"}</p>
              </div>
            )}
            <Link
              href="/app/profile"
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
                pathname === "/app/profile" ? "bg-blue-950 text-blue-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>👤</span>
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="w-full text-left rounded-lg px-3 py-2 text-sm font-semibold text-slate-400 hover:text-red-400"
            >
              Sign out
            </button>
          </div>
        </aside>
        <main className="flex-1 min-w-0 overflow-y-auto">{children}</main>
      </div>
    </ResumeUploadProvider>
  );
}
