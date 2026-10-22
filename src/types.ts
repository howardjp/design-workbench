export type Maturity = "proposed" | "experimental" | "stable" | "deprecated";
export interface Draft {
  name: string;
  summary: string;
  category: string;
  maturity: Maturity;
  targets: string[];
  acceptanceCriteria: string;
  evidence: string;
  martletNotes: string;
  krigsvoldNotes: string;
  migration: string;
}
export interface Implementation {
  family: "martlet" | "krigsvold";
  platform: string;
  package: string;
  version: string;
  state: "published" | "workspace";
}
export interface ComponentRecord extends Draft {
  id: string;
  revision: number;
  updatedAt: string;
  implementations: Implementation[];
}
export interface HistoryEntry {
  revision: number;
  at: string;
  snapshot: ComponentRecord;
}

export interface InventoryChange {
  id: string;
  name: string;
  kind: "add" | "implementations";
  revision: number | null;
  before: Implementation[];
  after: Implementation[];
  record?: Draft & { id: string; implementations: Implementation[] };
}
export interface InventoryPreview {
  schemaVersion: 1;
  source: string;
  inventoryVersion: string;
  token: string;
  changes: InventoryChange[];
  conflicts: { id: string; name: string; message: string }[];
  retained: { id: string; name: string; implementations: Implementation[] }[];
  unchanged: number;
}
export interface InventoryResult {
  applied: number;
  components: ComponentRecord[];
  preview: InventoryPreview;
}
