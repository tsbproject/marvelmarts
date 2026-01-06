// app/dashboard/admins/DashboardHeaderClient.tsx
"use client";

import DashboardHeader from "@/app/_components/DashboardHeader";

type ActionButton = {
  label: string;
  link: string;
  show?: boolean;
  style?: string;
};

export default function DashboardHeaderClient({
  title,
  actions = [],
  showSecondaryButton,
  secondaryButtonLabel,
  secondaryButtonLink,
}: {
  title: string;
  actions?: ActionButton[];
  showSecondaryButton?: boolean;
  secondaryButtonLabel?: string;
  secondaryButtonLink?: string;
}) {
  return (
    <DashboardHeader
      title={title}
      actions={actions}
      showSecondaryButton={showSecondaryButton}
      secondaryButtonLabel={secondaryButtonLabel}
      secondaryButtonLink={secondaryButtonLink}
    />
  );
}
