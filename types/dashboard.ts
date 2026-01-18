// @/types/dashboard.ts

export interface SectionLink {
  label: string;
  href: string;
  icon?: React.ReactNode;
  visible: boolean;
  hasChildren?: boolean; 
  children?: {
    label: string;
    href: string;
  }[];
}

export interface Sections {
  general: SectionLink[];
  management: SectionLink[];
  permissionsMenu?: { label: string }[];
}