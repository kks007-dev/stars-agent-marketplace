import { z } from "zod";

export const AUDIENCES = ["student", "teacher", "parent", "self-learner"] as const;
export const SUBJECTS = [
  "math",
  "reading-writing",
  "science",
  "coding",
  "test-prep",
  "college-career",
  "study-skills",
  "languages",
  "teaching",
  "parenting",
  "ai-literacy",
  "accessibility",
  "social-studies",
  "arts",
  "life-skills",
] as const;
export const LEVELS = ["beginner", "intermediate", "advanced", "all"] as const;

export const SUBJECT_LABELS: Record<(typeof SUBJECTS)[number], string> = {
  math: "Math",
  "reading-writing": "Reading & Writing",
  science: "Science",
  coding: "Coding",
  "test-prep": "Test Prep",
  "college-career": "College & Career",
  "study-skills": "Study Skills",
  languages: "Languages",
  teaching: "Teaching",
  parenting: "Parenting & Family",
  "ai-literacy": "AI Literacy",
  accessibility: "Accessibility & Neurodiversity",
  "social-studies": "Social Studies",
  arts: "Arts & Music",
  "life-skills": "Life Skills",
};

export const AUDIENCE_LABELS: Record<(typeof AUDIENCES)[number], string> = {
  student: "Students",
  teacher: "Teachers",
  parent: "Parents",
  "self-learner": "Self-learners",
};

const url = z.string().url().refine((u) => u.startsWith("https://"), "URL must be https");

export const InspiredBySchema = z.object({
  name: z.string().min(2),
  url,
  license: z.string().min(2), // SPDX id or plain-language license, verified
  note: z.string().optional(),
});

export const AgentSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "kebab-case only").min(3).max(60),
    kind: z.enum(["agent", "skill"]).default("agent"),
    name: z.string().min(3).max(60),
    tagline: z.string().min(10).max(120),
    description: z.string().min(80).max(900),
    ageRange: z.object({ min: z.number().int().min(3).max(99), max: z.number().int().min(3).max(99) }),
    audiences: z.array(z.enum(AUDIENCES)).min(1),
    subject: z.enum(SUBJECTS),
    level: z.enum(LEVELS),
    tags: z.array(z.string().regex(/^[a-z0-9-]+$/)).min(2).max(10),
    systemPrompt: z.string().min(1500),
    starterPrompts: z.array(z.string().min(5).max(200)).min(3).max(6),
    safety: z.object({
      notes: z.array(z.string().min(10)).min(1),
      escalation: z.string().min(10).optional(),
    }),
    learningGoals: z.array(z.string().min(5)).min(3).max(8),
    sampleConversation: z
      .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1) }))
      .min(4),
    inspiredBy: z.array(InspiredBySchema).default([]),
    createdAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    author: z.object({ name: z.string().min(2), url: url.optional() }),
  })
  .strict();

export type Agent = z.infer<typeof AgentSchema>;
export type Audience = (typeof AUDIENCES)[number];
export type Subject = (typeof SUBJECTS)[number];

/** Age bands used for browsing and the coverage matrix. */
export const AGE_BANDS = [
  { id: "4-6", label: "Ages 4-6", min: 4, max: 6 },
  { id: "7-9", label: "Ages 7-9", min: 7, max: 9 },
  { id: "10-12", label: "Ages 10-12", min: 10, max: 12 },
  { id: "13-15", label: "Ages 13-15", min: 13, max: 15 },
  { id: "16-18", label: "Ages 16-18", min: 16, max: 18 },
  { id: "adult", label: "Adults", min: 19, max: 99 },
] as const;

export function overlapsBand(agent: Pick<Agent, "ageRange">, band: { min: number; max: number }) {
  return agent.ageRange.min <= band.max && agent.ageRange.max >= band.min;
}

export function ageLabel(a: Pick<Agent, "ageRange">) {
  const { min, max } = a.ageRange;
  return max >= 99 ? `Ages ${min}+` : `Ages ${min}-${max}`;
}
