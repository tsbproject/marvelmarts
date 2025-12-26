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
//     <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
//       {/* Title */}
//       <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>

//       {/* Actions — horizontal row */}
//       <div className="flex flex-row items-center gap-3">
//         {showAddButton && addButtonLabel && addButtonLink && (
//           <Link
//             href={addButtonLink}
//             className="px-4 py-2 rounded text-white font-medium transition bg-blue-600 hover:bg-blue-700"
//           >
//             {addButtonLabel}
//           </Link>
//         )}

//         {showSecondaryButton && secondaryButtonLabel && secondaryButtonLink && (
//           <Link
//             href={secondaryButtonLink}
//             className="px-4 py-2 rounded text-white font-medium transition bg-green-600 hover:bg-green-700"
//           >
//             {secondaryButtonLabel}
//           </Link>
//         )}

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
//               className={`px-4 py-2 rounded text-white font-medium transition ${
//                 action.style ?? "bg-black hover:bg-gray-900"
//               }`}
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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h1>

      {/* Actions — horizontal row */}
      <div className="flex flex-row items-center gap-3">
        {/* Primary Add button */}
        {showAddButton && addButtonLabel && addButtonLink && (
          <Link
            href={addButtonLink}
            className="px-4 py-2 rounded text-white font-medium transition bg-blue-600 hover:bg-blue-700"
          >
            {addButtonLabel}
          </Link>
        )}

        {/* Secondary button */}
        {showSecondaryButton && secondaryButtonLabel && secondaryButtonLink && (
          <Link
            href={secondaryButtonLink}
            className="px-4 py-2 rounded text-white font-medium transition bg-green-600 hover:bg-green-700"
          >
            {secondaryButtonLabel}
          </Link>
        )}

        {/* Extra actions (Super Admin‑restricted if needed) */}
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
              className={`px-4 py-2 rounded text-white font-medium transition ${
                action.style ?? "bg-black hover:bg-gray-900"
              }`}
            >
              {action.label}
            </Link>
          ))}
      </div>
    </div>
  );
}
