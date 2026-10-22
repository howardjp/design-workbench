import type {
  ComponentRecord,
  Draft,
  HistoryEntry,
  InventoryPreview,
  InventoryResult,
  ImportPreview,
  ImportResult,
} from "./types";
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fields: Record<string, string> = {},
  ) {
    super(message);
  }
}
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: options?.body ? { "Content-Type": "application/json" } : undefined,
  });
  const data = await response.json();
  if (!response.ok)
    throw new ApiError(
      response.status,
      data.message ?? "The request failed.",
      data.fields,
    );
  return data;
}
export const api = {
  previewImport: (source: string, fileName: string) =>
    request<ImportPreview>("/api/import/preview", {
      method: "POST",
      body: JSON.stringify({ source, fileName }),
    }),
  applyImport: (source: string, fileName: string, token: string) =>
    request<ImportResult>("/api/import/apply", {
      method: "POST",
      body: JSON.stringify({ source, fileName, token }),
    }),
  previewInventory: () => request<InventoryPreview>("/api/inventory/preview"),
  applyInventory: (token: string) =>
    request<InventoryResult>("/api/inventory/apply", {
      method: "POST",
      body: JSON.stringify({ token }),
    }),
  list: () => request<ComponentRecord[]>("/api/components"),
  get: (id: string, signal?: AbortSignal) =>
    request<ComponentRecord>(`/api/components/${encodeURIComponent(id)}`, {
      signal,
    }),
  history: (id: string) =>
    request<HistoryEntry[]>(
      `/api/components/${encodeURIComponent(id)}/history`,
    ),
  save: (record: Draft, previous: ComponentRecord | null) =>
    request<ComponentRecord>(
      previous
        ? `/api/components/${encodeURIComponent(previous.id)}`
        : "/api/components",
      {
        method: previous ? "PUT" : "POST",
        body: JSON.stringify({ record, revision: previous?.revision }),
      },
    ),
};
