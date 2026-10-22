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
