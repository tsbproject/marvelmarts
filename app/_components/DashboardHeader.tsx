// // "use client";

// // import { useSession } from "next-auth/react";
// // import SignOutButton from "./SignOutButton";
// // import Link from "next/link";

// // type ActionButton = {
// //   label: string;
// //   link: string;
// //   show?: boolean;
// //   style?: string;
// // };

// // type DashboardHeaderProps = {
// //   title: string;
// //   actions?: ActionButton[];
// // };

// // export default function DashboardHeader({ title, actions = [] }: DashboardHeaderProps) {
// //   const { data: session } = useSession();
// //   const role = session?.user?.role;
// //   const isSuperAdmin = role === "SUPER_ADMIN";

// //   return (
// //     <div className="flex items-center justify-between mb-6">
// //       <h1 className="text-3xl font-bold">{title}</h1>

// //       <div className="flex items-center space-x-4">
// //         {actions
// //           .filter((a) => a.show !== false)
// //           .filter((a) => {
// //             // 🔹 Restrict Add Admin and Add Category to SUPER_ADMIN only
// //             const label = a.label.toLowerCase();
// //             if (label.includes("admin") || label.includes("category")) {
// //               return isSuperAdmin;
// //             }
// //             return true;
// //           })
// //           .map((action) => (
// //             <Link
// //               key={action.label}
// //               href={action.link}
// //               className={`px-4 py-2 rounded text-white font-medium transition ${
// //                 action.style ?? "bg-black hover:bg-gray-900"
// //               }`}
// //             >
// //               {action.label}
// //             </Link>
// //           ))}

// //         {session?.user && (
// //           <div className="flex items-center space-x-2">
// //             <span className="text-lg text-gray-700">
// //               {session.user.name} ({session.user.role})
// //             </span>

// //             <SignOutButton
// //               redirectPath="/auth/sign-in"
// //               label="Sign Out"
// //               className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
// //             />
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }



// "use client";

// import { useSession } from "next-auth/react";
// import SignOutButton from "./SignOutButton";
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
//   showAddButton?: boolean;       // 🔹 new optional prop
//   addButtonLabel?: string;       // 🔹 new optional prop
//   addButtonLink?: string;        // 🔹 new optional prop
// };

// export default function DashboardHeader({
//   title,
//   actions = [],
//   showAddButton,
//   addButtonLabel,
//   addButtonLink,
// }: DashboardHeaderProps) {
//   const { data: session } = useSession();
//   const role = session?.user?.role;
//   const isSuperAdmin = role === "SUPER_ADMIN";

//   return (
//     <div className="flex items-center justify-between mb-6">
//       <h1 className="text-3xl font-bold">{title}</h1>

//       <div className="flex items-center space-x-4">
//         {/* 🔹 Render Add button if props are passed */}
//         {showAddButton && addButtonLabel && addButtonLink && (
//           <Link
//             href={addButtonLink}
//             className="px-4 py-2 rounded text-white font-medium transition bg-blue-600 hover:bg-blue-700"
//           >
//             {addButtonLabel}
//           </Link>
//         )}

//         {/* 🔹 Render any extra actions */}
//         {actions
//           .filter((a) => a.show !== false)
//           .filter((a) => {
//             // Restrict Add Admin and Add Category to SUPER_ADMIN only
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

//         {session?.user && (
//           <div className="flex items-center space-x-2">
//             <span className="text-lg text-gray-700">
//               {session.user.name} ({session.user.role})
//             </span>

//             <SignOutButton
//               redirectPath="/auth/sign-in"
//               label="Sign Out"
//               className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
//             />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }




"use client";

import { useSession } from "next-auth/react";
import SignOutButton from "./SignOutButton";
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
  showSecondaryButton?: boolean;      // 🔹 new optional prop
  secondaryButtonLabel?: string;      // 🔹 new optional prop
  secondaryButtonLink?: string;       // 🔹 new optional prop
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
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-3xl font-bold">{title}</h1>

      <div className="flex items-center space-x-4">
        {/* 🔹 Render Add button if props are passed */}
        {showAddButton && addButtonLabel && addButtonLink && (
          <Link
            href={addButtonLink}
            className="px-4 py-2 rounded text-white font-medium transition bg-blue-600 hover:bg-blue-700"
          >
            {addButtonLabel}
          </Link>
        )}

        {/* 🔹 Render Secondary button if props are passed */}
        {showSecondaryButton && secondaryButtonLabel && secondaryButtonLink && (
          <Link
            href={secondaryButtonLink}
            className="px-4 py-2 rounded text-white font-medium transition bg-green-600 hover:bg-green-700"
          >
            {secondaryButtonLabel}
          </Link>
        )}

        {/* 🔹 Render any extra actions */}
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

