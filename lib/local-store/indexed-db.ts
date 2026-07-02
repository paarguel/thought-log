/**
 * Device-local persistence via IndexedDB.
 *
 * Two stores:
 *  - `draft`: the single in-progress worksheet (autosaved as the user works)
 *  - `entries`: completed worksheets the user chose to keep on this device
 *
 * Nothing here ever touches the network. (R10–R12)
 */

import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Worksheet } from "@/lib/thought-log/types";

interface ThoughtLogDB extends DBSchema {
  draft: {
    key: string;
    value: Worksheet;
  };
  entries: {
    key: string;
    value: Worksheet;
    indexes: { "by-updated": string };
  };
}

const DB_NAME = "thought-log";
const DB_VERSION = 1;
const DRAFT_KEY = "current";

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
  return db.get("draft", DRAFT_KEY);
}

export async function clearDraft(): Promise<void> {
  const db = await getDB();
  await db.delete("draft", DRAFT_KEY);
}

// --- Saved local entries ---

export async function saveLocalEntry(worksheet: Worksheet): Promise<void> {
  const db = await getDB();
  await db.put("entries", worksheet);
}

export async function listLocalEntries(): Promise<Worksheet[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex("entries", "by-updated");
  return all.reverse(); // newest first
}

export async function getLocalEntry(id: string): Promise<Worksheet | undefined> {
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
