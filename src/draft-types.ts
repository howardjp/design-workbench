import type { Draft } from "./types";
export interface StoredDraft {
  schemaVersion: 1;
  id: string;
  savedAt: string;
  recordId: string | null;
  baseRevision: number | null;
  baseDraft: Draft | null;
  draft: Draft;
  uncertain: boolean;
}
