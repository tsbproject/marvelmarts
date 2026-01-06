// app/dashboard/admins/categories/DashboardHeaderClient.tsx
"use client";

import DashboardHeader from "@/app/_components/DashboardHeader";

export default function DashboardHeaderClient({
  title,
  showAddButton,
  addButtonLabel,
  addButtonLink,
}: {
  title: string;
  showAddButton?: boolean;
  addButtonLabel?: string;
  addButtonLink?: string;
}) {
  return (
    <DashboardHeader
      title={title}
      showAddButton={showAddButton}
      addButtonLabel={addButtonLabel}
      addButtonLink={addButtonLink}
    />
  );
}
