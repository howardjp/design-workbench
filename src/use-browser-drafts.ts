import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { readDrafts, writeDraft, removeDraft } from "./draft-storage.mjs";
import { toDraft, newDraft } from "./contract.mjs";
import type { StoredDraft } from "./draft-types";
import type { ComponentRecord, Draft } from "./types";

/** Owns browser copies only; saved inventory and historical editing bases stay in App. */
export function useBrowserDrafts({
  editing,
  draft,
  editingBase,
  uncertain,
  saving,
  enabled,
}: {
  editing: boolean;
  draft: Draft;
  editingBase: ComponentRecord | null;
  uncertain: boolean;
  saving: boolean;
  enabled: boolean;
}) {
  const activeDraftId = useRef<string | null>(null);
  const [storedDrafts, setStoredDrafts] = useState<StoredDraft[]>([]);
  const [storageFailure, setStorageFailure] = useState("");
  const [invalidDraftKeys, setInvalidDraftKeys] = useState<string[]>([]);
  const [draftProtected, setDraftProtected] = useState(false);
  function refreshStoredDrafts() {
    try {
      const result = readDrafts(localStorage);
      setStoredDrafts(
        result.drafts.filter(
          (item) => item.id !== activeDraftId.current,
        ) as StoredDraft[],
      );
      setInvalidDraftKeys(result.invalidKeys);
    } catch {
      setStorageFailure(
        "Browser draft storage is unavailable. Keep this page open until you save your specification.",
      );
    }
  }
  function forgetActiveDraft() {
    if (activeDraftId.current) {
      try {
        removeDraft(localStorage, activeDraftId.current);
      } catch {
        setStorageFailure(
          "The saved browser draft could not be removed. A recovery copy may still appear when you return.",
        );
      }
    }
    activeDraftId.current = null;
    setDraftProtected(false);
    refreshStoredDrafts();
  }
  useEffect(() => {
    refreshStoredDrafts();
    const changed = (event: StorageEvent) => {
      if (
        event.key === null ||
        event.key?.startsWith("design-workbench:specification-draft:")
      )
        refreshStoredDrafts();
    };
    window.addEventListener("storage", changed);
    return () => {
      window.removeEventListener("storage", changed);
    };
  }, []);
  function protectDraftCopy(markUncertain: boolean) {
    if (!enabled) return;
    activeDraftId.current ??= crypto.randomUUID();
    try {
      writeDraft(localStorage, {
        schemaVersion: 1,
        id: activeDraftId.current,
        savedAt: new Date().toISOString(),
        recordId: editingBase?.id ?? null,
        baseRevision: editingBase?.revision ?? null,
        baseDraft: editingBase ? toDraft(editingBase) : null,
        draft,
        uncertain: markUncertain,
      });
      setDraftProtected(true);
      setStorageFailure("");
    } catch {
      setDraftProtected(false);
      setStorageFailure(
        "This draft could not be protected in browser storage. Keep this page open until you save it to the registry.",
      );
    }
  }
  useLayoutEffect(() => {
    if (!editing) return;
    if (!enabled) {
      setDraftProtected(false);
      return;
    }
    const changed =
      JSON.stringify(draft) !==
      JSON.stringify(editingBase ? toDraft(editingBase) : newDraft());
    if (!changed && !uncertain && !saving) {
      if (activeDraftId.current) {
        try {
          removeDraft(localStorage, activeDraftId.current);
          setDraftProtected(false);
        } catch {
          setStorageFailure(
            "The browser draft could not be cleared. A recovery copy may still appear when you return.",
          );
        }
      }
      return;
    }
    protectDraftCopy(uncertain || saving);
  }, [editing, draft, editingBase, uncertain, saving, enabled]);

  function discardStoredDraft(item: StoredDraft) {
    try {
      removeDraft(localStorage, item.id);
      refreshStoredDrafts();
    } catch {
      setStorageFailure(
        "The browser draft could not be discarded. It remains available for recovery.",
      );
    }
  }
  return {
    activeDraftId,
    storedDrafts,
    storageFailure,
    invalidDraftKeys,
    draftProtected,
    setStorageFailure,
    refreshStoredDrafts,
    forgetActiveDraft,
    protectDraftCopy,
    discardStoredDraft,
  };
}
