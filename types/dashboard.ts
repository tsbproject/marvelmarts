// /types/dashboard.ts
import { ReactNode } from "react";

export type SectionLink = {
  href: string;
  label: string;
  icon?: ReactNode;       // <-- allow JSX icons
  visible?: boolean;
};

export type Sections = {
  general: SectionLink[];
  management: SectionLink[];
  permissionsMenu: SectionLink[];
};
