/**
 * Device-local persistence via IndexedDB.
 *
 * Two stores:
 *  - `draft`: the in-progress worksheet and the in-progress check-in, one
 *    of each, under separate keys (autosaved as the user works)
 *  - `entries`: completed worksheets and check-ins the user chose to keep on
 *    this device. A check-in carries `kind: "check-in"`; a worksheet has no
 *    `kind`, so entries saved before check-ins existed read back unchanged
 *    and the database needs no version bump.
 *
 * Nothing here ever touches the network. (R10–R12)
 */

import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Worksheet } from "@/lib/thought-log/types";
import { isCheckIn, type EmotionCheckIn, type Entry } from "@/lib/check-in/types";

interface ThoughtLogDB extends DBSchema {
  draft: {
    key: string;
    value: Entry;
  };
  entries: {
    key: string;
    value: Entry;
    indexes: { "by-updated": string };
  };
}

const DB_NAME = "thought-log";
const DB_VERSION = 1;
const DRAFT_KEY = "current";
const CHECK_IN_DRAFT_KEY = "check-in";

let dbPromise: Promise<IDBPDatabase<ThoughtLogDB>> | null = null;

function getDB(): Promise<IDBPDatabase<ThoughtLogDB>> {
  if (!dbPromise) {
    dbPromise = openDB<ThoughtLogDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        db.createObjectStore("draft");
        const entries = db.createObjectStore("entries", { keyPath: "id" });
        entries.createIndex("by-updated", "updatedAt");
      },
    });
  }
  return dbPromise;
}

// --- Draft (single in-progress worksheet) ---

export async function saveDraft(worksheet: Worksheet): Promise<void> {
  const db = await getDB();
  await db.put("draft", worksheet, DRAFT_KEY);
}

export async function loadDraft(): Promise<Worksheet | undefined> {
  const db = await getDB();
  const draft = await db.get("draft", DRAFT_KEY);
  return draft && !isCheckIn(draft) ? draft : undefined;
}

export async function clearDraft(): Promise<void> {
  const db = await getDB();
  await db.delete("draft", DRAFT_KEY);
}

// --- Check-in draft (kept apart so neither flow overwrites the other) ---

export async function saveCheckInDraft(checkIn: EmotionCheckIn): Promise<void> {
  const db = await getDB();
  await db.put("draft", checkIn, CHECK_IN_DRAFT_KEY);
}

export async function loadCheckInDraft(): Promise<EmotionCheckIn | undefined> {
  const db = await getDB();
  const draft = await db.get("draft", CHECK_IN_DRAFT_KEY);
  return draft && isCheckIn(draft) ? draft : undefined;
}

export async function clearCheckInDraft(): Promise<void> {
  const db = await getDB();
  await db.delete("draft", CHECK_IN_DRAFT_KEY);
}

// --- Saved local entries ---

export async function saveLocalEntry(entry: Entry): Promise<void> {
  const db = await getDB();
  await db.put("entries", entry);
}

export async function listLocalEntries(): Promise<Entry[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex("entries", "by-updated");
  return all.reverse(); // newest first
}

export async function getLocalEntry(id: string): Promise<Entry | undefined> {
  const db = await getDB();
  return db.get("entries", id);
}

export async function deleteLocalEntry(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("entries", id);
}

export async function clearAllLocalData(): Promise<void> {
  const db = await getDB();
  await db.clear("entries");
  await db.clear("draft");
}
