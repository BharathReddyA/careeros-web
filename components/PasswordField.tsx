"use client";

import { useState } from "react";

interface Rule {
  label: string;
  test: (v: string) => boolean;
}

const RULES: Rule[] = [
  { label: "At least 8 characters", test: (v) => v.length >= 8 },
  { label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { label: "One lowercase letter", test: (v) => /[a-z]/.test(v) },
  { label: "One number", test: (v) => /[0-9]/.test(v) },
  { label: "One symbol", test: (v) => /[^A-Za-z0-9]/.test(v) },
];

const STRENGTH_LABELS = ["Very weak", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLORS = ["bg-red-500", "bg-orange-500", "bg-amber-400", "bg-lime-500", "bg-emerald-500"];

export function passwordScore(value: string): number {
  return RULES.filter((r) => r.test(value)).length;
}

export default function PasswordField({
  label,
  value,
  onChange,
  placeholder,
  showRequirements = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  showRequirements?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const score = passwordScore(value);
  const filled = value.length > 0;

  return (
    <div>
      <label className="block text-sm text-slate-400 mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 pr-16 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-200"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>

      {showRequirements && filled && (
        <div className="mt-2.5">
          <div className="flex gap-1">
            {RULES.map((_, i) => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${i < score ? STRENGTH_COLORS[score - 1] : "bg-slate-800"}`}
              />
            ))}
          </div>
          <p className="mt-1 text-xs text-slate-500">{STRENGTH_LABELS[Math.max(score - 1, 0)]}</p>

          <ul className="mt-2 space-y-1">
            {RULES.map((rule) => {
              const met = rule.test(value);
              return (
                <li key={rule.label} className={`flex items-center gap-1.5 text-xs ${met ? "text-emerald-400" : "text-slate-500"}`}>
                  <span>{met ? "✓" : "○"}</span>
                  {rule.label}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
