"use client";

import { useSession } from "next-auth/react";
import SignOutButton from "./SignOutButton";

type DashboardHeaderProps = {
  title: string;           // Page title
  showAddButton?: boolean; // Optional: show an add button (for Admins)
  addButtonLabel?: string;
  addButtonLink?: string;
};

export default function DashboardHeader({
  title,
  showAddButton = false,
  addButtonLabel,
  addButtonLink,
}: DashboardHeaderProps) {
  const { data: session } = useSession();

  return (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-bold">{title}</h1>

      <div className="flex items-center space-x-4">
        {showAddButton && addButtonLink && addButtonLabel && (
          <a
            href={addButtonLink}
            className="px-4 py-2 bg-black text-2xl text-white rounded hover:bg-gray-900 transition"
          >
            {addButtonLabel}
          </a>
        )}

        {session?.user && (
          <div className="flex items-center space-x-2">
            <span className="text-lg text-gray-700">
              {session.user.name} ({session.user.role})
            </span>

            <SignOutButton
              redirectPath="/auth/sign-in"
              label="Sign Out"
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
            />
          </div>
        )}
      </div>
    </div>
  );
}
