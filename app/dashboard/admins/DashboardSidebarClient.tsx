// app/dashboard/admins/DashboardSidebarClient.tsx
"use client";

import DashboardSidebar from "@/app/_components/DashboardSidebar";
import { Sections } from "@/types/dashboard";

export default function DashboardSidebarClient({
  sections,
  children,
}: {
  sections: Sections;
  children?: React.ReactNode;
}) {
  return <DashboardSidebar sections={sections}>{children}</DashboardSidebar>;
}
