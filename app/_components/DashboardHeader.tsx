// "use client";

// import { useSession } from "next-auth/react";
// import Link from "next/link";

// type ActionButton = {
//   label: string;
//   link: string;
//   show?: boolean;
//   style?: string;
// };

// type DashboardHeaderProps = {
//   title: string;
//   actions?: ActionButton[];
//   showAddButton?: boolean;
//   addButtonLabel?: string;
//   addButtonLink?: string;
//   showSecondaryButton?: boolean;
//   secondaryButtonLabel?: string;
//   secondaryButtonLink?: string;
// };

// export default function DashboardHeader({
//   title,
//   actions = [],
//   showAddButton,
//   addButtonLabel,
//   addButtonLink,
//   showSecondaryButton,
//   secondaryButtonLabel,
//   secondaryButtonLink,
// }: DashboardHeaderProps) {
//   const { data: session } = useSession();
//   const role = session?.user?.role;
//   const isSuperAdmin = role === "SUPER_ADMIN";

//   return (
//     <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//       {/* Title */}
//       <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
//         {title}
//       </h1>

//       {/* Actions */}
//       <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full sm:w-auto">
//         {/* Primary Add button */}
//         {showAddButton && addButtonLabel && addButtonLink && (
//           <Link
//             href={addButtonLink}
//             className="w-full sm:w-auto text-center px-4 py-2 rounded-md
//                        text-white font-medium transition
//                        bg-blue-600 hover:bg-blue-700"
//           >
//             {addButtonLabel}
//           </Link>
//         )}

//         {/* Secondary button */}
//         {showSecondaryButton && secondaryButtonLabel && secondaryButtonLink && (
//           <Link
//             href={secondaryButtonLink}
//             className="w-full sm:w-auto text-center px-4 py-2 rounded-md
//                        text-white font-medium transition
//                        bg-green-600 hover:bg-green-700"
//           >
//             {secondaryButtonLabel}
//           </Link>
//         )}

//         {/* Extra actions (role-restricted) */}
//         {actions
//           .filter((a) => a.show !== false)
//           .filter((a) => {
//             const label = a.label.toLowerCase();
//             if (label.includes("admin") || label.includes("category")) {
//               return isSuperAdmin;
//             }
//             return true;
//           })
//           .map((action) => (
//             <Link
//               key={action.label}
//               href={action.link}
//               className={`w-full sm:w-auto text-center px-4 py-2 rounded-md
//                           text-white font-medium transition ${
//                             action.style ?? "bg-black hover:bg-gray-900"
//                           }`}
//             >
//               {action.label}
//             </Link>
//           ))}
//       </div>
//     </div>
//   );
// }


"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Plus, Settings } from "lucide-react";

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

        {/* Actions */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          {/* Add button */}
          {showAddButton && addButtonLabel && addButtonLink && (
            <Link
              href={addButtonLink}
              className="
                inline-flex items-center gap-2
                px-4 py-2 rounded-md
                bg-blue-600 text-white font-medium
                hover:bg-blue-700 transition
              "
            >
              <Plus size={18} />
              <span className="hidden sm:inline">{addButtonLabel}</span>
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
                  px-4 py-2 rounded-md
                  bg-green-600 text-white font-medium
                  hover:bg-green-700 transition
                "
              >
                <Settings size={18} />
                <span className="hidden sm:inline">
                  {secondaryButtonLabel}
                </span>
              </Link>
            )}

          {/* Extra actions */}
          {actions
            .filter((a) => a.show !== false)
            .filter((a) => {
              const label = a.label.toLowerCase();
              if (label.includes("admin") || label.includes("category")) {
                return isSuperAdmin;
              }
              return true;
            })
            .map((action) => (
              <Link
                key={action.label}
                href={action.link}
                className={`
                  inline-flex items-center gap-2
                  px-4 py-2 rounded-md
                  text-white font-medium transition
                  ${action.style ?? "bg-gray-900 hover:bg-black"}
                `}
              >
                <span className="truncate">{action.label}</span>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
}
