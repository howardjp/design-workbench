import type { ComponentRecord, Draft, HistoryEntry } from "./types";
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
  list: () => request<ComponentRecord[]>("/api/components"),
  get: (id: string) =>
    request<ComponentRecord>(`/api/components/${encodeURIComponent(id)}`),
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
