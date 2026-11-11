"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND, LYT_SITE_URL } from "@/lib/brand";
import type { Lead } from "@/lib/lead";
import {
  EMPTY_DRAFT,
  SCREENS,
  calculate,
  leadAnswers,
  toInputs,
  toggleMulti,
  validateScreen,
  type Draft,
  type FieldError,
} from "./calc";
import { Chrome } from "./chrome";
import { GATE_COPY, GateForm } from "./gate-form";
import { Landing } from "./landing";
import { ProgressBar, StepRail } from "./progress";
import { Snapshot } from "./snapshot";
import { Step } from "./step";

type Phase = "landing" | number | "gate" | "result";

const LAST = SCREENS.length;

export function LyteExperience({ isEmbedded }: { isEmbedded?: boolean }) {
  const [phase, setPhase] = useState<Phase>("landing");
  const [direction, setDirection] = useState(1);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [error, setError] = useState<FieldError | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [phase]);

  const inputs = toInputs(draft);

  function go(next: Phase, dir: number) {
    setDirection(dir);
    setError(null);
    setPhase(next);
  }

  async function submitLead(lead: Lead) {
    setSubmitting(true);
    try {
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead,
          gateMode: "lyte-calculator",
          utm: Object.fromEntries(
            [...new URLSearchParams(window.location.search)].filter(([k]) =>
              k.startsWith("utm_"),
            ),
          ),
          answers: leadAnswers(inputs, draft),
        }),
      });
    } catch {
      // The snapshot is shown regardless of whether the lead was recorded.
    }
    setSubmitting(false);
    go("result", 1);
  }

  if (phase === "result") {
    return (
      <Chrome isEmbedded={isEmbedded}>
        <Snapshot inputs={inputs} result={calculate(inputs)} onEdit={() => go(0, -1)} />
      </Chrome>
    );
  }

  const current = phase === "gate" ? LAST : typeof phase === "number" ? phase : 0;
  const gate = GATE_COPY.lyteCalculator;
  const offset = reduceMotion ? 0 : 28;

  function back() {
    if (phase === "gate") go(LAST - 1, -1);
    else if (phase === 0) go("landing", -1);
    else if (typeof phase === "number") go(phase - 1, -1);
  }

  return (
    <div className="lyt-canvas flex min-h-screen flex-col items-center px-5 py-7 sm:px-8 sm:py-10">
      {!isEmbedded && (
        <div className="flex w-full max-w-[1040px] items-center justify-between gap-4">
          <a href={LYT_SITE_URL} className="-my-2.5 shrink-0 py-2.5" aria-label={BRAND.company}>
            <Image
              src="/lytiqs-logo.png"
              alt={BRAND.company}
              width={692}
              height={162}
              priority
              className="h-6 w-auto sm:h-7"
            />
          </a>
          {phase !== "landing" && (
            <p className="lyt-eyebrow hidden truncate sm:block">{BRAND.tagline}</p>
          )}
        </div>
      )}

      <div className="my-auto w-full max-w-[1040px] py-10 sm:py-14">
        {phase === "landing" ? (
          <Landing onStart={() => go(0, 1)} />
        ) : (
          <motion.div
            className="mx-auto grid max-w-[920px] overflow-hidden rounded-[12px] bg-[var(--surface)] shadow-[var(--shadow-lift)] ring-1 ring-[var(--rule-strong)] ring-inset lg:grid-cols-[250px_1fr]"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <aside className="hidden border-r border-[var(--rule)] bg-[var(--wash)] p-5 lg:block">
              <p className="px-3 pt-1 pb-4 text-[0.9375rem] leading-snug font-semibold text-[var(--ink)]">
                What is your workforce data trying to tell you?
              </p>
              <StepRail draft={draft} current={current} onJump={(i) => go(i, -1)} />
            </aside>

            <div className="flex min-h-[460px] flex-col">
              <div className="px-6 pt-6 lg:hidden">
                <ProgressBar current={current} />
              </div>

              <div className="relative flex-1 overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={String(phase)}
                    className="p-6 sm:p-10"
                    initial={{ opacity: 0, x: direction * offset }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -direction * offset }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {typeof phase === "number" ? (
                      <form
                        id="lyte-step"
                        noValidate
                        onSubmit={(e) => {
                          e.preventDefault();
                          const err = validateScreen(SCREENS[phase], draft);
                          if (err) setError(err);
                          else go(phase + 1 < SCREENS.length ? phase + 1 : "gate", 1);
                        }}
                      >
                        <Step
                          screen={SCREENS[phase]}
                          index={phase}
                          draft={draft}
                          error={error}
                          onNumber={(key, value) => {
                            setDraft((d) => ({ ...d, [key]: value }));
                            setError(null);
                          }}
                          onChoice={(key, value) => {
                            setDraft((d) => ({ ...d, [key]: value }));
                            setError(null);
                          }}
                          onMulti={(key, id) => {
                            setDraft((d) => ({ ...d, [key]: toggleMulti(d[key], id) }));
                            setError(null);
                          }}
                        />
                      </form>
                    ) : (
                      <div>
                        <p className="lyt-eyebrow text-[var(--accent-deep)]">{gate.eyebrow}</p>
                        <h1 className="mt-4 text-[1.5rem] leading-[1.2] font-bold tracking-[-0.03em] text-balance text-[var(--ink)] sm:text-[1.875rem]">
                          {gate.heading}
                        </h1>
                        <p className="mt-3 text-[1rem] text-[var(--ink-soft)]">{gate.body}</p>
                        <div className="mt-7">
                          <GateForm
                            framing="lyteCalculator"
                            submitting={submitting}
                            onSubmit={submitLead}
                            showIntro={false}
                            bare
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-[var(--rule)] bg-[var(--wash)] px-6 py-4 sm:px-10">
                <Button variant="secondary" size="sm" onClick={back}>
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  Previous
                </Button>
                {typeof phase === "number" && (
                  <Button type="submit" form="lyte-step">
                    {phase === SCREENS.length - 1 ? "See my snapshot" : "Next"}
                    <ArrowRight className="h-4.5 w-4.5" aria-hidden />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <p className="text-center text-[0.8125rem] leading-relaxed text-[var(--ink-faint)]">
        {BRAND.lyteLine}
      </p>
    </div>
  );
}
