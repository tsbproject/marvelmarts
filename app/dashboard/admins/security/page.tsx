import Link from "next/link";
import {
  Activity,
  FileSearch,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import SecurityBackButton from "./_components/SecurityBackButton";

interface SecurityBackButtonProps {
  href?: string;
  label?: string;
}

export default function SecurityPage() {
  const sections = [
    {
      title: "Audit Logs",
      description:
        "Review administrative actions, resource changes, and system activity.",
      href: "/dashboard/admins/security/audit",
      icon: FileSearch,
    },
    {
      title: "Security Logs",
      description:
        "Investigate security events, blocked activity, and elevated-risk events.",
      href: "/dashboard/admins/security/security",
      icon: ShieldAlert,
    },
    {
      title: "API / Auth Logs",
      description:
        "Review API activity and authentication success or failure events.",
      href: "/dashboard/admins/security/api-auth",
      icon: Activity,
    },
  ];

  return (
    <div className="space-y-6">

      <SecurityBackButton
        href="/dashboard/admins"
        label="Back to Admin Dashboard"
      />
      
      <section className="rounded-[2.5rem] border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <ShieldCheck size={24} />
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">
              Security Administration
            </p>

            <h1 className="mt-2 text-2xl font-black uppercase tracking-tight text-accent-navy sm:text-3xl">
              Security Center
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
              Centralized visibility into administrative activity,
              security events, API requests, and authentication activity
              across MarvelMarts.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {sections.map((section) => {
          const Icon = section.icon;

          return (
            <Link
              key={section.href}
              href={section.href}
              className="group rounded-[2rem] border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-100 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-50 text-gray-600 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-600">
                <Icon size={21} />
              </div>

              <h2 className="mt-5 text-sm font-black uppercase tracking-tight text-accent-navy">
                {section.title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                {section.description}
              </p>

              <div className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-indigo-600">
                Open Console →
              </div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}