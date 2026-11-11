"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-11 w-full rounded-[var(--radius)] bg-[var(--wash)] px-3.5 text-base text-[var(--ink)] ring-1 ring-[var(--rule-strong)] ring-inset transition-colors placeholder:text-[var(--ink-faint)] hover:ring-[var(--line-strong)] focus:bg-white focus:ring-[1.5px] focus:ring-[var(--accent)]",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "mb-1.5 block text-[0.8125rem] font-semibold text-[var(--ink-soft)]",
      className,
    )}
    {...props}
  />
));
Label.displayName = "Label";
