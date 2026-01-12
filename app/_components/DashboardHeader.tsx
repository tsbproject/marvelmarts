"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Plus, Settings, UserPlus, FolderPlus } from "lucide-react"; //import relevant icons
import SignOutButton from "./SignOutButton";

type ActionButton = {
  label: string;
  link: string;
  show?: boolean;
  style?: string;
  icon?: React.ReactNode; //allow custom icon
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
  /**new prop to toggle logout */
  showLogout?: boolean;
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
  showLogout = true, // default: show logout
}: DashboardHeaderProps) {
  const { data: session } = useSession();
  const role = session?.user?.role;
  const isSuperAdmin = role === "SUPER_ADMIN";

  return (
    <div
      className="
        sticky top-0 z-5
        bg-white/90 backdrop-blur
        border-b border-gray-200
        mb-6
      "
    >
      <div className="flex flex-col  md:flex-col lg:flex-row xl:flex-row sm:items-center sm:justify-between gap-4 px-4 py-4">
        {/* Title */}
        <h1 className="text-xl sm:text-3xl font-semibold text-gray-900">
          {title}
        </h1>

        {/* Actions + Logout */}
        <div className="flex flex-col xs:flex-col md-flex-row lg:flex-row gap-4 w-full xs:w-auto sm:items-center sm:justify-end">
          {/* Add Admin button */}
          {showAddButton && addButtonLabel === "Add Admin" && addButtonLink && (
            <Link
              href={addButtonLink}
              className="
                inline-flex items-center justify-center gap-2
                px-3 py-2 md:px-4 md:py-2
                rounded-md
                bg-blue-600 text-white font-medium
                text-base md:text-lg
                hover:bg-blue-700 transition
                w-full xs:w-auto
              "
            >
              <UserPlus size={22} /> 
              <span>{addButtonLabel}</span>
            </Link>
          )}

          {/* Add Category button */}
          {showSecondaryButton &&
            secondaryButtonLabel === "Add Category" &&
            secondaryButtonLink && (
              <Link
                href={secondaryButtonLink}
                className="
                  inline-flex items-center justify-center gap-2
                  px-3 py-2 md:px-4 md:py-2
                  rounded-md
                  bg-green-600 text-white font-medium
                  text-base md:text-lg
                  hover:bg-green-700 transition
                  w-full xs:w-auto
                "
              >
                <FolderPlus size={22} /> 
                <span>{secondaryButtonLabel}</span>
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
                  inline-flex  md:flex-row  items-center justify-center gap-2
                  px-3 py-2 md:px-4 md:py-2
                  rounded-md
                  text-white font-medium transition
                  text-2xl md:text-lg
                  w-full sm:w-full xs:w-full
                  ${action.style ?? "bg-gray-900 hover:bg-black"}
                `}
              >
                {action.icon ?? <Plus size={20} />} {/*fallback icon */}
                <span className="truncate">{action.label}</span>
              </Link>
            ))}

          {/*Optional Logout button (desktop only) */}
          {showLogout && (
            <div className="hidden sm:block">
              <SignOutButton
                label="SignOut"
                className="px-8 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition text-lg"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
