/**
 * Cloud history data access. Every call goes straight from the browser
 * to Supabase under the signed-in user's session; RLS enforces that
 * rows are only ever visible to their owner (R13).
 */

import { getSupabase } from "@/lib/supabase/client";
import type { Worksheet } from "@/lib/thought-log/types";
import { WORKSHEET_SCHEMA_VERSION, worksheetTitle } from "@/lib/thought-log/types";

interface ThoughtLogRow {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  title: string;
  situation: string;
  feelings: Worksheet["feelings"];
  thought_text: string;
  phrases: Worksheet["phrases"];
  rational_thought: string;
  review_mode_last_used: Worksheet["reviewModeLastUsed"];
  schema_version: number;
}

function rowToWorksheet(row: ThoughtLogRow): Worksheet {
  return {
    id: row.id,
    schemaVersion: row.schema_version ?? WORKSHEET_SCHEMA_VERSION,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    title: row.title ?? "",
    situation: row.situation ?? "",
    feelings: row.feelings ?? [],
    thoughtText: row.thought_text ?? "",
    phrases: row.phrases ?? [],
    rationalThought: row.rational_thought ?? "",
    reviewModeLastUsed: row.review_mode_last_used ?? "original",
  };
}

function requireSupabase() {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Cloud sync is not configured.");
  return supabase;
}

export async function getCurrentUser() {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function saveToCloud(worksheet: Worksheet): Promise<void> {
  const supabase = requireSupabase();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error("You need to be signed in to save to cloud.");

  const { error } = await supabase.from("thought_logs").upsert({
    id: worksheet.id,
    user_id: userData.user.id,
    created_at: worksheet.createdAt,
    updated_at: worksheet.updatedAt,
    title: worksheetTitle(worksheet),
    situation: worksheet.situation,
    feelings: worksheet.feelings,
    thought_text: worksheet.thoughtText,
    phrases: worksheet.phrases,
    rational_thought: worksheet.rationalThought,
    review_mode_last_used: worksheet.reviewModeLastUsed,
    schema_version: worksheet.schemaVersion,
  });
  if (error) throw new Error(error.message);
}

export async function listCloudEntries(): Promise<Worksheet[]> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("thought_logs")
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data as ThoughtLogRow[]).map(rowToWorksheet);
}

export async function getCloudEntry(id: string): Promise<Worksheet | null> {
  const supabase = requireSupabase();
  const { data, error } = await supabase
    .from("thought_logs")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data ? rowToWorksheet(data as ThoughtLogRow) : null;
}

export async function deleteCloudEntry(id: string): Promise<void> {
  const supabase = requireSupabase();
  const { error } = await supabase.from("thought_logs").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
