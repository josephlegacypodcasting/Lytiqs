"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { LeadSchema, type Lead } from "@/lib/lead";
import { cn } from "@/lib/utils";

export const GATE_COPY = {
  lyteCalculator: {
    eyebrow: "Your snapshot is ready",
    heading: "Where should we send your Workforce Analytics Snapshot?",
    body: "Your figures are calculated and waiting on this page.",
    action: "See my snapshot",
    reassurance:
      "Your snapshot appears on this page immediately. Your email is used to send it and occasional correspondence from LYTIQS. You may unsubscribe at any time.",
  },
} as const;

export function GateForm({
  framing,
  submitting,
  onSubmit,
  onBack,
  showIntro = true,
  bare = false,
}: {
  framing: keyof typeof GATE_COPY;
  submitting: boolean;
  onSubmit: (lead: Lead) => void;
  onBack?: () => void;
  showIntro?: boolean;
  bare?: boolean;
}) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const copy = GATE_COPY[framing];

  return (
    <motion.div
      className={cn("w-full", !bare && "mx-auto max-w-xl")}
      initial={!bare && { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {showIntro && (
        <div className="text-center">
          <p className="lyt-eyebrow">{copy.eyebrow}</p>
          <h2 className="lyt-display mt-3">{copy.heading}</h2>
          <p className="lyt-lede mx-auto mt-4 max-w-lg">{copy.body}</p>
        </div>
      )}
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          const parsed = LeadSchema.safeParse({ firstName, lastName, email });
          if (parsed.success) {
            setError(null);
            onSubmit(parsed.data);
          } else {
            setError(
              firstName.trim() && lastName.trim()
                ? "That email address does not appear to be valid."
                : "Please provide your first and last name.",
            );
          }
        }}
        className={cn(
          "grid gap-4",
          !bare &&
            "rounded-[var(--radius-lg)] bg-white p-5 shadow-[var(--shadow-card)] ring-1 ring-[var(--rule)] ring-inset sm:p-6",
          !bare && showIntro && "mt-7",
        )}
      >
        {!showIntro && !bare && (
          <p className="lyt-eyebrow border-b border-[var(--rule)] pb-3">Start here</p>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              name="firstName"
              autoComplete="given-name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              name="lastName"
              autoComplete="family-name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="email">Work email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-describedby={error ? "gate-error" : undefined}
          />
        </div>
        {error && (
          <p
            id="gate-error"
            role="alert"
            className="rounded-[var(--radius)] bg-[#fdf1e7] px-3 py-2 text-sm font-semibold text-[var(--warn)]"
          >
            {error}
          </p>
        )}
        <Button
          type="submit"
          size="lg"
          className="mt-1 h-auto w-full py-3.5 whitespace-normal"
          disabled={submitting}
        >
          {submitting ? "One moment" : copy.action}
          {!submitting && <ArrowRight className="h-5 w-5" aria-hidden />}
        </Button>
        <p className="flex items-start gap-2 text-[0.8125rem] leading-relaxed text-[var(--ink-faint)]">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>{copy.reassurance}</span>
        </p>
      </form>
      {onBack && (
        <div className="mt-5 text-center">
          <Button variant="ghost" size="sm" onClick={onBack}>
            Back
          </Button>
        </div>
      )}
    </motion.div>
  );
}
