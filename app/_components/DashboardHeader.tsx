

"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Plus, Settings } from "lucide-react";
import SignOutButton from "./SignOutButton";

type ActionButton = {
  label: string;
  link: string;
  show?: boolean;
  style?: string;
};

type DashboardHeaderProps = {
  title: string;
  actions?: ActionButton[];
  showAddButton?: boolean;
  addButtonLabel?: string;
  addButtonLink?: string;
  showSecondaryButton?: boolean;
  secondaryButtonLabel?: string;
  secondaryButtonLink?: string;
};

export default function DashboardHeader({
  title,
  actions = [],
  showAddButton,
  addButtonLabel,
  addButtonLink,
  showSecondaryButton,
  secondaryButtonLabel,
  secondaryButtonLink,
}: DashboardHeaderProps) {
  const { data: session } = useSession();
  const role = session?.user?.role;
  const isSuperAdmin = role === "SUPER_ADMIN";

  return (
    <div
      className="
        sticky top-0 z-30
        bg-white/90 backdrop-blur
        border-b border-gray-200
        mb-6
      "
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 py-4">
        {/* Title */}
        <h1 className="text-xl sm:text-3xl font-semibold text-gray-900">
          {title}
        </h1>

        {/* Actions + Logout */}
        <div className="flex flex-col xs:flex-row gap-2 w-full xs:w-auto sm:items-center sm:justify-end">
          {/* Add button */}
          {showAddButton && addButtonLabel && addButtonLink && (
            <Link
              href={addButtonLink}
              className="
                inline-flex items-center gap-1 md:gap-2
                px-2 py-1 xs:px-3 xs:py-2 md:px-4 md:py-2
                rounded-md
                bg-blue-600 text-white font-medium
                text-sm md:text-base
                hover:bg-blue-700 transition
                w-full xs:w-auto
              "
            >
              <Plus size={16} />
              <span className="hidden xs:inline">{addButtonLabel}</span>
            </Link>
          )}

          {/* Secondary button */}
          {showSecondaryButton &&
            secondaryButtonLabel &&
            secondaryButtonLink && (
              <Link
                href={secondaryButtonLink}
                className="
                  inline-flex items-center gap-2
                  px-2 py-1 xs:px-3 xs:py-2 md:px-4 md:py-2
                  rounded-md
                  bg-green-600 text-white font-medium
                  text-sm md:text-base
                  hover:bg-green-700 transition
                  w-full xs:w-auto
                "
              >
                <Settings size={16} />
                <span className="hidden xs:inline">
                  {secondaryButtonLabel}
                </span>
              </Link>
            )}

          {/* Extra actions */}
          {actions
            .filter((a) => a.show !== false)
            .map((action) => (
              <Link
                key={action.label}
                href={action.link}
                className={`
                  inline-flex items-center gap-1 md:gap-2
                  px-2 py-1 xs:px-3 xs:py-2 md:px-4 md:py-2
                  rounded-md
                  text-white font-medium transition
                  text-sm md:text-base
                  w-full xs:w-auto
                  ${action.style ?? "bg-gray-900 hover:bg-black"}
                `}
              >
                <span className="truncate">{action.label}</span>
              </Link>
            ))}

          {/* Logout button (always visible on desktop) */}
          <SignOutButton
            label="Sign Out"
            className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
          />
        </div>
      </div>
    </div>
  );
}
