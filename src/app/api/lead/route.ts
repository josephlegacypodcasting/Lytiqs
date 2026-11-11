import { NextResponse } from "next/server";
import { z } from "zod";
import { AnswersSchema, LeadSchema } from "@/lib/lead";

const BodySchema = z.object({
  lead: LeadSchema,
  gateMode: z.string().optional(),
  utm: z.record(z.string(), z.string()).optional(),
  answers: AnswersSchema,
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
  }

  // Flat payload so every field can be mapped directly in a GHL
  // "Inbound Webhook" workflow trigger (no nested objects).
  const { lead, gateMode, utm = {}, answers } = parsed.data;
  const payload: Record<string, string> = {
    first_name: lead.firstName,
    last_name: lead.lastName,
    email: lead.email,
    source: gateMode ?? "lyte-calculator",
    submitted_at: new Date().toISOString(),
    ...Object.fromEntries(
      Object.entries(answers).map(([k, v]) => [k, Array.isArray(v) ? v.join(", ") : v]),
    ),
    ...utm,
  };
  const webhook = process.env.LEAD_WEBHOOK_URL;

  if (!webhook) {
    console.log("[lead]", JSON.stringify(payload));
    return NextResponse.json({ ok: true, forwarded: false });
  }

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return NextResponse.json({ ok: res.ok, forwarded: true });
  } catch (err) {
    console.error("[lead] webhook failed", err);
    return NextResponse.json({ ok: false, forwarded: false }, { status: 502 });
  }
}
