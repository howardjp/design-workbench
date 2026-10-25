import type { ReactNode } from "react";
export type LayoutProps = {
  mode: string;
  onModeChange: () => void;
  directory: ReactNode;
  page: string;
  children: ReactNode;
};
export type PageProps = {
  name: string;
  description: string;
  category: string;
  playground: ReactNode;
  api: ReactNode;
  accessibility: ReactNode;
};
