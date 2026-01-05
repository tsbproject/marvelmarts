// // /types/dashboard.ts
// export type SectionLink = {
//   href: string;
//   label: string;
//   icon?: React.ReactNode;
//   visible?: boolean;
// };

// export type Sections = {
//   general: SectionLink[];
//   management?: SectionLink[];
//   permissionsMenu?: { label: string; icon?: React.ReactNode }[];
// };


// /types/dashboard.ts
export type SectionLink = {
  href: string;
  label: string;
  icon?: React.ReactNode;   // optional
  visible?: boolean;        // optional
};

export type Sections = {
  general: SectionLink[];
  management?: SectionLink[];
  permissionsMenu?: { label: string; icon?: React.ReactNode }[];
};
