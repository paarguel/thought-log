import type { SupabaseClient } from "@supabase/supabase-js";
import type { ThoughtLogEntry } from "@/lib/thought-log/types";

type ThoughtLogRow = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  title: string;
  situation: string;
  feelings: string[];
  thought_text: string;
  extracted_thoughts: ThoughtLogEntry["extractedThoughts"];
  label_assignments: ThoughtLogEntry["labelAssignments"];
  rational_thought: string;
  review_mode_last_used: ThoughtLogEntry["reviewModeLastUsed"];
  schema_version: 1;
};

const toRow = (entry: ThoughtLogEntry, userId: string): ThoughtLogRow => ({
  id: entry.id,
  user_id: userId,
  created_at: entry.createdAt,
  updated_at: entry.updatedAt,
  title: entry.title,
  situation: entry.situation,
  feelings: entry.feelings,
  thought_text: entry.thoughtText,
  extracted_thoughts: entry.extractedThoughts,
  label_assignments: entry.labelAssignments,
  rational_thought: entry.rationalThought,
  review_mode_last_used: entry.reviewModeLastUsed,
  schema_version: entry.schemaVersion,
});

const fromRow = (row: ThoughtLogRow): ThoughtLogEntry => ({
  id: row.id,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  title: row.title,
  situation: row.situation,
  feelings: row.feelings ?? [],
  thoughtText: row.thought_text,
  extractedThoughts: row.extracted_thoughts ?? [],
  labelAssignments: row.label_assignments ?? [],
  rationalThought: row.rational_thought,
  reviewModeLastUsed: row.review_mode_last_used,
  schemaVersion: row.schema_version,
});

export const saveCloudThoughtLog = async (client: SupabaseClient, entry: ThoughtLogEntry) => {
  const { data: userData, error: userError } = await client.auth.getUser();

  if (userError || !userData.user) {
    throw new Error("Sign in before saving to cloud history.");
  }

  const { error } = await client.from("thought_logs").upsert(toRow(entry, userData.user.id));

  if (error) {
    throw error;
  }
};

export const listCloudThoughtLogs = async (client: SupabaseClient) => {
  const { data, error } = await client
    .from("thought_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<ThoughtLogRow[]>();

  if (error) {
    throw error;
  }

  return (data ?? []).map(fromRow);
};

export const deleteCloudThoughtLog = async (client: SupabaseClient, id: string) => {
  const { error } = await client.from("thought_logs").delete().eq("id", id);

  if (error) {
    throw error;
  }
};
