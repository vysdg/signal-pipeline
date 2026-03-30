import { z } from "zod";

export const LeadSchema = z.object({
  source: z.enum(["hubspot", "rdstation", "manual"]),
  contact: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    company: z.string().optional(),
  }),
  raw_text: z.string().min(10).max(50000),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type Lead = z.infer<typeof LeadSchema>;