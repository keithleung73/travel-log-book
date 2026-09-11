import type { Journal } from "@/lib/types";

const DB_NAME = "mkpc-global-exploration-journal";
const DB_VERSION = 2;
const STORE = "journals";
const SUBMISSIONS = "submissions";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(SUBMISSIONS)) {
        db.createObjectStore(SUBMISSIONS, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

const SESSION_KEY = "mkpc-gej-current-journal";

export function loadSessionJournal(): Journal | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as Journal;
  } catch {
    return null;
  }
}

export function saveSessionJournal(journal: Journal) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(journal));
  } catch {
    // Private browsing / quota should not wipe the in-progress form.
  }
}

export async function saveJournal(journal: Journal): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(journal);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function loadJournal(id: string): Promise<Journal | null> {
  const db = await openDb();
  const result = await new Promise<Journal | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve(req.result as Journal | undefined);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return result ?? null;
}

export async function listJournals(): Promise<Journal[]> {
  const db = await openDb();
  const result = await new Promise<Journal[]>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve((req.result as Journal[]) ?? []);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return result.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function deleteJournal(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function saveSubmission(journal: Journal): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(SUBMISSIONS, "readwrite");
    tx.objectStore(SUBMISSIONS).put(journal);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function loadSubmission(id: string): Promise<Journal | null> {
  const db = await openDb();
  const result = await new Promise<Journal | undefined>((resolve, reject) => {
    const tx = db.transaction(SUBMISSIONS, "readonly");
    const req = tx.objectStore(SUBMISSIONS).get(id);
    req.onsuccess = () => resolve(req.result as Journal | undefined);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return result ?? null;
}

export async function listSubmissions(): Promise<Journal[]> {
  const db = await openDb();
  const result = await new Promise<Journal[]>((resolve, reject) => {
    const tx = db.transaction(SUBMISSIONS, "readonly");
    const req = tx.objectStore(SUBMISSIONS).getAll();
    req.onsuccess = () => resolve((req.result as Journal[]) ?? []);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return result.sort((a, b) =>
    (b.submittedAt || b.updatedAt).localeCompare(a.submittedAt || a.updatedAt)
  );
}

export async function deleteSubmission(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(SUBMISSIONS, "readwrite");
    tx.objectStore(SUBMISSIONS).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}
