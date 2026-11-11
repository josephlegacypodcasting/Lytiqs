"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { SCREENS, stepSummary, type Draft } from "./calc";

/** Desktop side rail listing every step, with a summary of completed ones. */
export function StepRail({
  draft,
  current,
  onJump,
}: {
  draft: Draft;
  current: number;
  onJump: (index: number) => void;
}) {
  const items = [
    ...SCREENS.map((s) => ({ label: s.name, value: stepSummary(s, draft) })),
    { label: "Your snapshot", value: "" },
  ];
  return (
    <ol className="grid gap-1">
      {items.map((item, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={item.label}>
            <button
              type="button"
              disabled={!done}
              onClick={() => onJump(i)}
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex w-full items-center gap-3 rounded-[var(--radius)] px-3 py-2.5 text-left transition-colors",
                active && "bg-white ring-1 ring-[var(--rule-strong)] ring-inset",
                done && "hover:bg-white/70",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.75rem] font-semibold",
                  done && "bg-[var(--accent)] text-white",
                  active && "bg-[var(--btn)] text-[var(--ink)] ring-1 ring-[var(--btn-edge)]",
                  !done &&
                    !active &&
                    "bg-white text-[var(--ink-faint)] ring-1 ring-[var(--rule-strong)]",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "block text-[0.875rem] leading-tight font-semibold",
                    done || active ? "text-[var(--ink)]" : "text-[var(--ink-faint)]",
                  )}
                >
                  {item.label}
                </span>
                {done && item.value && (
                  <span className="mt-0.5 block truncate text-[0.8125rem] text-[var(--ink-soft)] tabular-nums">
                    {item.value}
                  </span>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

/** Mobile segmented progress bar. */
export function ProgressBar({ current }: { current: number }) {
  return (
    <div className="flex gap-1.5" aria-hidden>
      {Array.from({ length: SCREENS.length + 1 }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 flex-1 rounded-full transition-colors duration-300",
            i < current
              ? "bg-[var(--accent)]"
              : i === current
                ? "bg-[var(--btn)]"
                : "bg-[var(--rule)]",
          )}
        />
      ))}
    </div>
  );
}
