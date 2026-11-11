"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND, LYT_CTA_URL } from "@/lib/brand";
import { cn } from "@/lib/utils";
import {
  ASSUMED_REPLACEMENT_PCT,
  count,
  money,
  moneyShort,
  type Area,
  type Inputs,
  type Level,
  type Result,
} from "./calc";

const AREA_COPY: Record<Area, { title: string; body: string }> = {
  turnover: {
    title: "Turnover & Retention",
    body: "Move beyond an overall turnover rate to understand where turnover is happening, which employee populations are most affected, and where retention efforts could have the greatest impact.",
  },
  acquisition: {
    title: "Talent Acquisition",
    body: "Connect recruiting activity to downstream outcomes to understand which sources, roles and hiring patterns are producing employees who stay.",
  },
  mobility: {
    title: "Internal Mobility",
    body: "See how talent moves across the organization and understand where internal hiring and career movement may create additional opportunities.",
  },
};

const LEVEL_STYLE: Record<Level, string> = {
  HIGH: "bg-[var(--accent)] text-white",
  MODERATE:
    "bg-[var(--accent-soft)] text-[var(--accent-deep)] ring-1 ring-[var(--accent)] ring-inset",
  LIMITED:
    "bg-[var(--wash)] text-[var(--ink-faint)] ring-1 ring-[var(--rule-strong)] ring-inset",
};

function Reveal({
  delay = 0,
  className,
  children,
}: {
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, delay: reduce ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Snapshot({
  inputs,
  result,
  onEdit,
}: {
  inputs: Inputs;
  result: Result;
  onEdit: () => void;
}) {
  const { earlyTenure } = result;
  const figures = [
    {
      label: "Estimated annual cost of voluntary turnover",
      value: moneyShort(result.voluntaryTurnoverCost),
      note: `${count(inputs.employees)} employees at ${inputs.voluntaryTurnoverPct}% voluntary turnover, each replacement estimated at ${result.replacementCostPct}% of ${money(inputs.avgSalary)}`,
    },
    {
      label: "Estimated replacement cost associated with first-year turnover",
      value: earlyTenure ? moneyShort(earlyTenure.replacementCost) : null,
      note: earlyTenure
        ? `${count(earlyTenure.departures)} of your ${count(inputs.annualHires)} hires left within their first year, at ${money(result.costPerDeparture)} each`
        : "You told us you are not sure what share of new hires leave within their first year, so this was not calculated.",
    },
    {
      label: "Recruiting investment associated with hires who left within one year",
      value:
        earlyTenure && earlyTenure.recruitingSpend !== null
          ? moneyShort(earlyTenure.recruitingSpend)
          : null,
      note:
        earlyTenure && earlyTenure.recruitingSpend !== null
          ? `${count(earlyTenure.departures)} early-tenure departures at your average cost per hire of ${money(inputs.costPerHire ?? 0)}`
          : "This needs both your first-year turnover rate and your average cost per hire. We have not applied a benchmark in place of either.",
    },
  ];
  const missing = figures.filter((f) => f.value === null).length;

  return (
    <div>
      <Reveal delay={0.05}>
        <p className="lyt-eyebrow">Your workforce analytics opportunity</p>
        <h1 className="mt-4 max-w-[24ch] text-[1.75rem] leading-[1.15] font-bold tracking-[-0.03em] text-balance text-[var(--ink)] sm:text-[2.125rem]">
          Your Workforce Analytics Snapshot
        </h1>
        <p className="lyt-lede mt-4 max-w-[62ch]">
          Calculated from the figures you entered for {count(inputs.employees)} employees. These
          are estimates of what your current workforce patterns may represent, not an analysis of
          your organization&apos;s data.
        </p>
      </Reveal>

      <Reveal delay={0.18}>
        <dl className="mt-8 grid overflow-hidden rounded-[6px] border border-[var(--rule-strong)] sm:grid-cols-3">
          {figures.map((f, i) => (
            <div
              key={f.label}
              className={cn(
                "bg-[var(--surface)] px-5 py-6",
                i > 0 && "border-t border-[var(--rule-strong)] sm:border-t-0 sm:border-l",
              )}
            >
              {f.value ? (
                <p className="text-[2.25rem] leading-none font-bold tracking-[-0.03em] text-[var(--accent)] tabular-nums">
                  {f.value}
                </p>
              ) : (
                <p className="text-[1.125rem] leading-none font-bold text-[var(--ink-faint)]">
                  Not calculated
                </p>
              )}
              <dt className="mt-3 text-[0.9375rem] leading-snug font-semibold text-[var(--ink)]">
                {f.label}
              </dt>
              <dd className="mt-2.5 text-[0.8125rem] leading-snug text-[var(--ink-faint)]">
                {f.note}
              </dd>
            </div>
          ))}
        </dl>
        {result.replacementCostAssumed && (
          <p className="mt-3 text-[0.875rem] leading-relaxed text-[var(--ink-faint)]">
            You selected &quot;Not sure&quot; for replacement cost, so these figures use an
            assumption of {ASSUMED_REPLACEMENT_PCT}% of annual salary. It is an estimate, not your
            organization&apos;s figure.
          </p>
        )}
      </Reveal>

      <Reveal delay={0.28}>
        <p className="mt-9 max-w-[62ch] text-[1.125rem] leading-relaxed font-medium text-pretty text-[var(--ink)]">
          {earlyTenure ? (
            <>
              Knowing that first-year turnover represents {money(earlyTenure.replacementCost)} in
              estimated replacement cost is interesting. Being able to determine which recruiting
              sources, roles, locations or employee populations are disproportionately contributing
              to it is actionable.
            </>
          ) : (
            <>
              Knowing that voluntary turnover represents {money(result.voluntaryTurnoverCost)} a
              year is interesting. Being able to determine which departments, roles, tenures or
              employee populations are disproportionately contributing to it is actionable.
            </>
          )}
        </p>
      </Reveal>

      {result.scenarios.length > 0 && (
        <Reveal delay={0.36}>
          <section className="mt-9 rounded-[6px] bg-[var(--surface)] p-6 ring-1 ring-[var(--rule-strong)] ring-inset sm:p-7">
            <h2 className="lyt-heading text-[1.125rem]">
              Small changes can have meaningful impact.
            </h2>
            <dl className="mt-5 grid gap-5 sm:grid-cols-2">
              {result.scenarios.map((s) => (
                <div key={s.id}>
                  <dt className="text-[0.9375rem] leading-snug font-semibold text-[var(--ink)]">
                    {s.label}
                  </dt>
                  <dd className="mt-2 text-[1.75rem] leading-none font-bold tracking-[-0.03em] text-[var(--ink)] tabular-nums">
                    {money(s.amount)}
                  </dd>
                  <dd className="mt-2 text-[0.875rem] leading-snug text-[var(--ink-faint)]">
                    Potential impact, from {s.movement}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 border-t border-[var(--rule)] pt-4 text-[0.875rem] leading-relaxed text-[var(--ink-soft)]">
              These are illustrative scenarios calculated using your own inputs, not promised
              savings from implementing {BRAND.product}.
            </p>
          </section>
        </Reveal>
      )}

      <Reveal delay={0.44}>
        <h2 className="lyt-heading mt-12 text-[1.375rem]">What could your data tell you?</h2>
        <div className="mt-5 grid overflow-hidden rounded-[6px] border border-[var(--rule-strong)]">
          {result.opportunities.map((o, i) => {
            const copy = AREA_COPY[o.area];
            return (
              <div
                key={o.area}
                className={cn(
                  "bg-[var(--surface)] px-5 py-6 sm:px-7",
                  i > 0 && "border-t border-[var(--rule-strong)]",
                )}
              >
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <h3 className="lyt-eyebrow text-[var(--ink)]">{copy.title}</h3>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[0.6875rem] font-bold tracking-[0.08em] uppercase",
                      LEVEL_STYLE[o.level],
                    )}
                  >
                    Opportunity: {o.level}
                  </span>
                </div>
                <p className="mt-3 max-w-[66ch] text-[0.9375rem] leading-relaxed text-[var(--ink-soft)]">
                  {copy.body}
                </p>
                <p className="mt-2.5 text-[0.875rem] font-medium text-[var(--ink-faint)]">
                  {o.unseen === 0
                    ? `You told us you can already answer all ${o.total} of these questions today.`
                    : `You told us you cannot easily answer ${o.unseen} of these ${o.total} questions today.`}
                </p>
              </div>
            );
          })}
        </div>
        {missing > 0 && (
          <p className="mt-4 max-w-[62ch] text-[0.9375rem] leading-relaxed text-[var(--ink-soft)]">
            {missing === 1 ? "One figure above" : `${missing} figures above`} could not be
            calculated from what you had to hand. That is usually the clearest signal of all: the
            data exists in your systems, but the answer is not easy to reach.
          </p>
        )}
      </Reveal>

      <Reveal delay={0.52}>
        <section className="lyt-band no-print mt-10 p-7 sm:p-10">
          <h2 className="max-w-[26ch] text-[1.5rem] leading-[1.12] font-bold tracking-[-0.03em] text-balance sm:text-[2rem]">
            {BRAND.lyteCtaHeading}
          </h2>
          <p className="mt-4 max-w-[62ch] text-[0.9375rem] leading-relaxed text-pretty text-[var(--ink-onblue-soft)] sm:text-base">
            {BRAND.lyteCtaBody}
          </p>
          <Button
            asChild
            size="lg"
            variant="onBand"
            className="mt-7 h-auto w-full py-3.5 text-center text-balance whitespace-normal sm:w-auto"
          >
            <a href={LYT_CTA_URL} target="_blank" rel="noopener noreferrer">
              {BRAND.lyteCta}
              <ArrowRight className="h-4.5 w-4.5 shrink-0" aria-hidden />
            </a>
          </Button>
          <p className="mt-4 text-[0.8125rem] leading-relaxed text-[var(--ink-onblue-soft)]">
            Opens {BRAND.company}&apos;s calendar in a new tab. Your snapshot remains on this page.
          </p>
        </section>
      </Reveal>

      <Reveal delay={0.58}>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <p className="text-[0.875rem] text-[var(--ink-faint)]">
            Based on {count(inputs.employees)} employees and {count(inputs.annualHires)} hires in
            the last 12 months.
          </p>
          <Button variant="secondary" size="sm" onClick={onEdit}>
            <PencilLine className="h-3.5 w-3.5" aria-hidden />
            Edit my answers
          </Button>
        </div>
        <footer className="mt-8 border-t border-[var(--rule)] pt-5 text-[0.8125rem] leading-relaxed text-[var(--ink-faint)]">
          <p>
            Every figure above is arithmetic on the figures you entered. Annual voluntary turnover
            cost is your headcount multiplied by your voluntary turnover rate, your average salary
            and your replacement cost percentage. First-year figures are your hires in the last 12
            months multiplied by your first-year turnover rate, then by that same replacement cost
            and by your average cost per hire. Scenarios apply the stated reduction to the rate you
            entered. No industry benchmark has been substituted for anything you did not provide.
          </p>
        </footer>
      </Reveal>
    </div>
  );
}
