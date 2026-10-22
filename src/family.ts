import * as Martlet from "@martlet/react";
import * as Krigsvold from "@krigsvold/react";
export const family = location.pathname.startsWith("/krigsvold")
  ? "krigsvold"
  : "martlet";
export const title = family === "martlet" ? "Martlet" : "Krigsvold";
export const UI = family === "martlet" ? Martlet : Krigsvold;
