import { z } from "zod";
import { distortionIds } from "./distortions";

export const extractedThoughtSchema = z.object({
  id: z.string().min(1),
  text: z.string(),
  start: z.number().int().nonnegative(),
  end: z.number().int().nonnegative(),
  source: z.enum(["manual", "auto"]),
});

export const labelAssignmentSchema = z.object({
  thoughtId: z.string().min(1),
  distortionIds: z.array(z.enum(distortionIds as [string, ...string[]])),
});

export const rationalResponseSchema = z.object({
  thoughtId: z.string().min(1),
  text: z.string(),
});

export const thoughtLogEntrySchema = z.object({
  id: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  title: z.string().min(1),
  situation: z.string(),
  feelings: z.array(z.string()),
  thoughtText: z.string(),
  extractedThoughts: z.array(extractedThoughtSchema),
  labelAssignments: z.array(labelAssignmentSchema),
  rationalThought: z.string(),
  rationalResponses: z.array(rationalResponseSchema).default([]),
  reviewModeLastUsed: z.enum(["original", "all", "one"]),
  schemaVersion: z.union([z.literal(1), z.literal(2)]),
});
