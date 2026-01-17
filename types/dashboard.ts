// @/types/dashboard.ts

export interface SectionLink {
  label: string;
  href: string;
  icon?: React.ReactNode;
  visible: boolean;
  // Add these optional properties:
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