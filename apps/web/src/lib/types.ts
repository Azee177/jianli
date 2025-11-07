import { z } from "zod";

export const ResumeBlockSchema = z.object({
  type: z.enum([
    "header",
    "summary",
    "education",
    "experience",
    "project",
    "skills",
    "awards",
    "research",
    "internship",
    "other",
  ]),
  text: z.string(),
});

export const ResumeMetadataSchema = z.object({
  ocrEngine: z.string().optional(),
  pageCount: z.number().optional(),
  confidence: z.number().optional(),
  latencyMs: z.number().optional(),
  sha256: z.string().optional(),
  ocrGatewayUsed: z.boolean().optional(),
  language: z.string().optional(),
  templateKey: z.string().optional(),
  title: z.string().optional(),
  fileName: z.string().optional(),
  mimeType: z.string().optional(),
});

export const ResumeSchema = z.object({
  id: z.string(),
  raw_text: z.string(),
  parsed_blocks: z.array(ResumeBlockSchema).default([]),
  skills: z.array(z.string()).default([]),
  contacts: z
    .object({ 
      name: z.string().optional(), 
      email: z.string().optional(), 
      phone: z.string().optional() 
    })
    .default({}),
  metadata: ResumeMetadataSchema.optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type Resume = z.infer<typeof ResumeSchema>;

export const JDSchema = z.object({
  id: z.string(),
  company: z.string(),
  title: z.string(),
  jd_text: z.string(),
  must_have_skills: z.array(z.string()).default([]),
  nice_to_have: z.array(z.string()).default([]),
});
export type JD = z.infer<typeof JDSchema>;

export const KnowledgeItemSchema = z.object({ 
  title: z.string(), 
  url: z.string(), 
  why: z.string() 
});
export type KnowledgeItem = z.infer<typeof KnowledgeItemSchema>;

export const OutputSchema = z.object({
  id: z.string(),
  resume_md: z.string(),
  interview_questions: z.array(z.string()),
  knowledge_items: z.array(KnowledgeItemSchema),
});
export type Output = z.infer<typeof OutputSchema>;

export const TaskSchema = z.object({
  id: z.string(),
  status: z.enum(["queued", "running", "done", "error"]),
  cost: z.number().nullable().optional(),
  latency_ms: z.number().nullable().optional(),
  output: OutputSchema.optional(),
  error: z.string().nullable().optional(),
});
export type Task = z.infer<typeof TaskSchema>;
