declare module "docs-family" {
  export * from "@martlet/react";
  export const family: "martlet" | "krigsvold";
  export const familyName: string;
}

declare module "docs-layout" {
  export const familyMark: string;
  export const FamilyLayout: import("react").ComponentType<
    import("./layout-types").LayoutProps
  >;
  export const ComponentPage: import("react").ComponentType<
    import("./layout-types").PageProps
  >;
  export const FamilyHome: import("react").ComponentType;
}
declare module "*.svg" {
  const url: string;
  export default url;
}
declare module "docs-pattern" {
  export const CollectionPattern: import("react").ComponentType;
}
declare module "*?raw" {
  const value: string;
  export default value;
}
declare module "docs-grammar" {
  const value: string;
  export default value;
}
declare module "docs-decisions" {
  const decisions: string;
  export default decisions;
}
