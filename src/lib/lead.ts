import { z } from "zod";

export const LeadSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(200),
});

export type Lead = z.infer<typeof LeadSchema>;

export const AnswersSchema = z.record(
  z.string(),
  z.union([z.string(), z.array(z.string())]),
);
