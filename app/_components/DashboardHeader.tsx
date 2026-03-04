"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";
import SignOutButton from "./SignOutButton";
import AdminNotificationBell from "./AdminNotificationBell"; 
import React from "react";
import { UserRole } from "@prisma/client";

type ActionButton = {
  label: string;
  link: string;
  show?: boolean;
  style?: string;
  icon?: React.ReactNode;
};

type DashboardHeaderProps = {
  title: string;
  showAddButton?: boolean;
  addButtonLabel?: string;
  addButtonLink?: string;
  addButtonIcon?: React.ReactNode;
  showSecondaryButton?: boolean;
  secondaryButtonLabel?: string;
  secondaryButtonLink?: string;
  secondaryButtonIcon?: React.ReactNode;
  actions?: ActionButton[];
  showLogout?: boolean;
  showNotificationBell?: boolean;
};

export default function DashboardHeader({
  title,
  actions = [],
  showAddButton,
  addButtonLabel,
  addButtonLink,
  addButtonIcon,
  showSecondaryButton,
  secondaryButtonLabel,
  secondaryButtonLink,
  secondaryButtonIcon,
  showLogout = true,
  showNotificationBell = true,
}: DashboardHeaderProps) {
  const { data: session } = useSession();

  return (
    <div className="sticky top-0 z-40 bg-neutral-white/80 backdrop-blur-xl border-b border-gray-100 mb-8">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between py-5 gap-5">
          
          {/* Title & Breadcrumb Style */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-brand-primary">
              <span>MarvelMarts</span>
              <ChevronRight size={10} className="text-neutral-gray opacity-50" />
              <span className="text-neutral-gray/60">Dashboard</span>
            </div>
            <h1 className="text-xl sm:text-xl xl:text-2xl 2xl:text-2xl font-black text-accent-navy uppercase tracking-tight">
              {title}
            </h1>
          </div>

          {/* Action Group */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            
            {/* Secondary Action */}
            {showSecondaryButton && secondaryButtonLabel && secondaryButtonLink && (
              <Link
                href={secondaryButtonLink}
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2
                  px-5 py-3 rounded-2xl
                  bg-neutral-light text-accent-navy text-[9px] xl:text-xl 2xl:text-2xl font-bold uppercase tracking-widest
                  hover:bg-brand-light transition-all active:scale-95 shadow-sm"
              >
                {secondaryButtonIcon ?? <Plus size={16} />}
                <span>{secondaryButtonLabel}</span>
              </Link>
            )}

            {/* Extra Custom Actions */}
            {actions
              .filter((a) => a.show !== false)
              .map((action) => (
                <Link
                  key={action.label}
                  href={action.link}
                  className={`flex-1 md:flex-none inline-flex items-center justify-center gap-2
                    px-5 py-3 rounded-2xl
                    text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-md
                    ${action.style ?? "bg-accent-navy text-neutral-white hover:bg-neutral-dark"}`}
                >
                  {action.icon ?? <Plus size={16} />}
                  <span>{action.label}</span>
                </Link>
              ))}

            {/* Primary Action (Add Button) */}
            {showAddButton && addButtonLabel && addButtonLink && (
              <Link
                href={addButtonLink}
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-2
                  px-6 py-3 rounded-2xl
                  bg-brand-primary text-white text-xs sm:text-xs 2xl:text-xs font-black uppercase tracking-widest
                  hover:bg-accent-navy hover:text-neutral-white transition-all active:scale-95 shadow-lg shadow-brand-primary/20"
              >
                {addButtonIcon ?? <Plus size={18} />}
                <span>{addButtonLabel}</span>
              </Link>
            )}

            {/* ADMIN NOTIFICATION BELL (Neatly tucked before logout) */}
            {(session?.user?.role === UserRole.ADMIN || session?.user?.role === UserRole.SUPER_ADMIN) && (
            <div className="flex items-center px-2 md:border-l md:border-gray-100 md:ml-2">
              <AdminNotificationBell />
            </div>
          )}

            {/* Logout Button */}
            {showLogout && (
              <div className="flex items-center ml-auto md:ml-0 md:pl-2">
                <SignOutButton
                  label="Sign Out"
                  className="inline-flex items-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm font-black text-[10px] uppercase tracking-widest"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}