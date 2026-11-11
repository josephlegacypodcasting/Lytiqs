"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { SCREENS } from "./calc";

const AREAS = [
  {
    title: "Turnover & Retention",
    body: "Understand where turnover is happening and what it is costing you.",
  },
  {
    title: "Talent Acquisition",
    body: "Connect recruiting activity to which hires actually stay.",
  },
  {
    title: "Internal Mobility",
    body: "See how talent moves across the organization.",
  },
];

const FACTS = [
  { label: "Cost", value: "No cost" },
  { label: "Time", value: "About two minutes" },
  { label: "Steps", value: String(SCREENS.length) },
];

export function Landing({ onStart }: { onStart: () => void }) {
  return (
    <motion.div
      className="grid w-full items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-14"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div>
        <p className="lyt-eyebrow flex items-center gap-2.5">
          <span
            aria-hidden
            className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--btn)] ring-1 ring-[var(--btn-edge)]"
          />
          {BRAND.lyteCalculator}
        </p>
        <h1 className="lyt-display mt-5 max-w-[18ch]">
          What is your workforce data trying to tell you?
        </h1>
        <div className="mt-7 grid max-w-[54ch] gap-4 text-[1rem] leading-relaxed text-pretty text-[var(--ink-soft)] sm:text-[1.0625rem]">
          <p>Your HCM holds a lot of workforce data. But how much can you actually see?</p>
          <p>
            Answer a few questions to uncover potential opportunities hiding in your existing
            workforce data.
          </p>
        </div>
        <Button size="lg" onClick={onStart} className="mt-8 w-full sm:w-auto">
          Begin
          <ArrowRight className="h-5 w-5" aria-hidden />
        </Button>
        <p className="mt-5 text-[0.9375rem] font-semibold text-[var(--accent-deep)]">
          {BRAND.tagline}.
        </p>
      </div>

      <div>
        <div className="overflow-hidden rounded-[10px] bg-[var(--surface)] shadow-[var(--shadow-card)] ring-1 ring-[var(--rule-strong)] ring-inset">
          <div className="border-b border-[var(--rule)] px-6 py-5 sm:px-7">
            <p className="lyt-eyebrow">What this looks at</p>
          </div>
          <ul>
            {AREAS.map((a, i) => (
              <li
                key={a.title}
                className={`px-6 py-5 sm:px-7 ${i > 0 ? "border-t border-[var(--rule)]" : ""}`}
              >
                <p className="text-[0.9375rem] font-semibold text-[var(--ink)]">{a.title}</p>
                <p className="mt-1.5 text-[0.9375rem] leading-snug text-[var(--ink-soft)]">
                  {a.body}
                </p>
              </li>
            ))}
          </ul>
          <div className="bg-[var(--wash-deep)] px-6 py-5 sm:px-7">
            <p className="text-[0.9375rem] leading-relaxed text-[var(--ink)]">
              Your snapshot is calculated from the figures you enter, and appears on this page.
            </p>
          </div>
        </div>
        <dl className="mt-4 grid grid-cols-3 overflow-hidden rounded-[6px] border border-[var(--rule-strong)]">
          {FACTS.map((f, i) => (
            <div
              key={f.label}
              className={`min-w-0 bg-[var(--surface)] px-3.5 py-3 ${i > 0 ? "border-l border-[var(--rule-strong)]" : ""}`}
            >
              <dt className="lyt-eyebrow">{f.label}</dt>
              <dd className="mt-1 text-[0.8125rem] leading-snug font-medium text-[var(--ink)]">
                {f.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </motion.div>
  );
}
