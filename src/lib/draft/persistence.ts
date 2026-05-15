export interface PersistedDraft {
  title: string;
  description: string;
  category: string;
  slug: string;
  body: string;
  savedAt: number;
}

/** localStorage key for a draft, namespaced by mode + target. */
export function draftKey(mode: "new" | "edit", target: string): string {
  return `divine-draft:${mode}:${target}`;
}

export function loadDraft(key: string): PersistedDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as PersistedDraft) : null;
  } catch {
    return null;
  }
}

export function saveDraft(key: string, draft: PersistedDraft): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(draft));
  } catch {
    // Quota exceeded or storage disabled — non-fatal, drafting still works.
  }
}

export function clearDraft(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
