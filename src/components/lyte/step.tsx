"use client";

import { useEffect, useRef, type Ref } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SCREENS,
  UNSURE,
  formatTyped,
  type ChoiceField,
  type Draft,
  type FieldError,
  type MultiField,
  type NumberField,
  type Screen,
} from "./calc";

type Focusable = HTMLInputElement & HTMLButtonElement;

export function Step({
  screen,
  index,
  draft,
  error,
  onNumber,
  onChoice,
  onMulti,
}: {
  screen: Screen;
  index: number;
  draft: Draft;
  error: FieldError | null;
  onNumber: (key: NumberField["key"], value: string) => void;
  onChoice: (key: ChoiceField["key"], value: string) => void;
  onMulti: (key: MultiField["key"], id: string) => void;
}) {
  const fieldRef = useRef<Focusable | null>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const startsWithNumber = screen.fields[0].kind === "number";

  useEffect(() => {
    const el = error || startsWithNumber ? fieldRef.current : headRef.current;
    el?.focus({ preventScroll: true });
  }, [screen.id, error, startsWithNumber]);

  return (
    <div>
      <div ref={headRef} tabIndex={-1}>
        <p className="lyt-eyebrow text-[var(--accent-deep)]">
          Step {index + 1} of {SCREENS.length}
        </p>
        <h1 className="mt-4 text-[1.5rem] leading-[1.2] font-bold tracking-[-0.03em] text-balance text-[var(--ink)] sm:text-[1.75rem]">
          {screen.heading}
        </h1>
      </div>
      <p className="mt-3 max-w-[58ch] text-[1rem] leading-relaxed text-[var(--ink-soft)]">
        {screen.lede}
      </p>
      <div className="mt-8 grid gap-8">
        {screen.fields.map((field, i) => {
          const message = error?.key === field.key ? error.message : null;
          const takesFocus = error ? !!message : i === 0 && startsWithNumber;
          const ref = takesFocus ? fieldRef : undefined;
          if (field.kind === "number")
            return (
              <NumberInput
                key={field.key}
                ref={ref}
                field={field}
                value={draft[field.key]}
                error={message}
                onChange={(v) => onNumber(field.key, v)}
              />
            );
          if (field.kind === "choice")
            return (
              <ChoiceInput
                key={field.key}
                ref={ref}
                field={field}
                value={draft[field.key]}
                error={message}
                onSelect={(v) => onChoice(field.key, v)}
              />
            );
          return (
            <MultiInput
              key={field.key}
              ref={ref}
              field={field}
              picked={draft[field.key]}
              error={message}
              onToggle={(id) => onMulti(field.key, id)}
            />
          );
        })}
      </div>
    </div>
  );
}

function FieldLabel({
  id,
  children,
  hint,
  as: As = "label",
}: {
  id: string;
  children: React.ReactNode;
  hint?: string;
  as?: "label" | "div";
}) {
  return (
    <>
      <As
        {...(As === "label" ? { htmlFor: id } : { id })}
        className="block text-[1.0625rem] leading-snug font-semibold text-balance text-[var(--ink)]"
      >
        {children}
      </As>
      {hint && <p className="mt-1.5 text-[0.875rem] text-[var(--ink-faint)]">{hint}</p>}
    </>
  );
}

function FieldErrorText({ id, message }: { id: string; message: string }) {
  return (
    <p id={id} role="alert" className="mt-2.5 text-[0.875rem] font-semibold text-[var(--warn)]">
      {message}
    </p>
  );
}

function NumberInput({
  ref,
  field,
  value,
  error,
  onChange,
}: {
  ref?: Ref<Focusable | null>;
  field: NumberField;
  value: string;
  error: string | null;
  onChange: (v: string) => void;
}) {
  const id = `lyte-${field.key}`;
  const unsure = value === UNSURE;
  return (
    <div>
      <FieldLabel id={id} hint={field.help}>
        {field.label}
      </FieldLabel>
      <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-3">
        <div
          className={cn(
            "flex items-baseline gap-1 border-b-2 pb-1 transition-colors",
            field.unit === "$" ? "w-[13rem]" : "w-[9rem]",
            unsure && "opacity-40",
            error
              ? "border-[var(--warn)]"
              : "border-[var(--line-strong)] focus-within:border-[var(--accent)]",
          )}
        >
          {field.unit === "$" && (
            <span aria-hidden className="text-[1.5rem] font-bold text-[var(--accent)]">
              $
            </span>
          )}
          <input
            id={id}
            ref={ref as Ref<HTMLInputElement>}
            name={field.key}
            style={{ outline: "none" }}
            inputMode="decimal"
            autoComplete="off"
            disabled={unsure}
            placeholder={field.placeholder}
            value={unsure ? "" : value}
            onChange={(e) => onChange(formatTyped(e.target.value, field))}
            aria-invalid={!!error}
            aria-describedby={error ? `${id}-error` : undefined}
            className="w-full min-w-0 bg-transparent text-[1.5rem] leading-tight font-bold tracking-[-0.02em] text-[var(--ink)] tabular-nums outline-none placeholder:font-semibold placeholder:text-[var(--accent-tint)] disabled:cursor-not-allowed"
          />
          {field.unit === "%" && (
            <span aria-hidden className="text-[1.5rem] font-bold text-[var(--accent)]">
              %
            </span>
          )}
        </div>
        {field.allowUnsure && (
          <button
            type="button"
            aria-pressed={unsure}
            onClick={() => onChange(unsure ? "" : UNSURE)}
            className={cn(
              "min-h-11 rounded-[var(--radius)] px-3.5 text-[0.9375rem] font-semibold transition-colors",
              unsure
                ? "bg-[var(--accent-soft)] text-[var(--accent-deep)] ring-1 ring-[var(--accent)] ring-inset"
                : "text-[var(--ink-soft)] ring-1 ring-[var(--rule-strong)] ring-inset hover:ring-[var(--line-strong)]",
            )}
          >
            I&apos;m not sure
          </button>
        )}
      </div>
      {error && <FieldErrorText id={`${id}-error`} message={error} />}
    </div>
  );
}

function ChoiceInput({
  ref,
  field,
  value,
  error,
  onSelect,
}: {
  ref?: Ref<Focusable | null>;
  field: ChoiceField;
  value: string;
  error: string | null;
  onSelect: (v: string) => void;
}) {
  const id = `lyte-${field.key}`;
  return (
    <div role="group" aria-labelledby={id} aria-describedby={error ? `${id}-error` : undefined}>
      <FieldLabel id={id} as="div" hint={field.help}>
        {field.label}
      </FieldLabel>
      <div className="mt-3.5 flex flex-wrap gap-2">
        {field.options.map((opt, i) => {
          const on = value === opt.value;
          return (
            <button
              key={opt.value}
              ref={i === 0 ? (ref as Ref<HTMLButtonElement>) : undefined}
              type="button"
              aria-pressed={on}
              onClick={() => onSelect(opt.value)}
              className={cn(
                "min-h-11 rounded-[var(--radius)] px-4 text-[0.9375rem] font-semibold transition-colors",
                on
                  ? "bg-[var(--accent-soft)] text-[var(--accent-deep)] ring-[1.5px] ring-[var(--accent)] ring-inset"
                  : "bg-[var(--surface)] text-[var(--ink-soft)] ring-1 ring-[var(--rule-strong)] ring-inset hover:ring-[var(--line-strong)]",
                error && !value && "ring-[var(--warn)]",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      {error && <FieldErrorText id={`${id}-error`} message={error} />}
    </div>
  );
}

function MultiInput({
  ref,
  field,
  picked,
  error,
  onToggle,
}: {
  ref?: Ref<Focusable | null>;
  field: MultiField;
  picked: string[];
  error: string | null;
  onToggle: (id: string) => void;
}) {
  const id = `lyte-${field.key}`;
  return (
    <div role="group" aria-labelledby={id} aria-describedby={error ? `${id}-error` : undefined}>
      <FieldLabel id={id} as="div" hint={field.hint}>
        {field.label}
      </FieldLabel>
      <div className="mt-3.5 grid gap-2">
        {field.options.map((opt, i) => {
          const on = picked.includes(opt.id);
          return (
            <button
              key={opt.id}
              ref={i === 0 ? (ref as Ref<HTMLButtonElement>) : undefined}
              type="button"
              aria-pressed={on}
              onClick={() => onToggle(opt.id)}
              className={cn(
                "flex min-h-11 w-full items-center gap-3 rounded-[var(--radius)] px-3.5 py-2.5 text-left text-[0.9375rem] leading-snug transition-colors",
                on
                  ? "bg-[var(--accent-soft)] font-semibold text-[var(--accent-deep)] ring-[1.5px] ring-[var(--accent)] ring-inset"
                  : "bg-[var(--surface)] text-[var(--ink-soft)] ring-1 ring-[var(--rule-strong)] ring-inset hover:ring-[var(--line-strong)]",
                error && picked.length === 0 && "ring-[var(--warn)]",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-[3px] transition-colors",
                  on
                    ? "bg-[var(--accent)] text-white"
                    : "bg-white ring-1 ring-[var(--line-strong)] ring-inset",
                )}
              >
                {on && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
              </span>
              {opt.label}
            </button>
          );
        })}
      </div>
      {error && <FieldErrorText id={`${id}-error`} message={error} />}
    </div>
  );
}
