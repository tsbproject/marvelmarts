"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Plus, LogOut, ChevronRight } from "lucide-react";
import SignOutButton from "./SignOutButton";
import React from "react";

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
}: DashboardHeaderProps) {
  const { data: session } = useSession();

  return (
    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 mb-8">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between py-5 gap-5">
          
          {/* Title & Breadcrumb Style */}
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500">
              <span>MarvelMarts</span>
              <ChevronRight size={10} />
              <span className="text-gray-400">Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tight">
              {title}
            </h1>
          </div>

          {/* Action Group */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            
            {/* Secondary Action */}
            {showSecondaryButton && secondaryButtonLabel && secondaryButtonLink && (
              <Link
                href={secondaryButtonLink}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2
                  px-5 py-3 rounded-2xl
                  bg-gray-100 text-gray-900 text-xs font-black uppercase tracking-widest
                  hover:bg-gray-200 transition-all active:scale-95 shadow-sm"
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
                  className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2
                    px-5 py-3 rounded-2xl
                    text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-md
                    ${action.style ?? "bg-gray-900 text-white hover:bg-black"}`}
                >
                  {action.icon ?? <Plus size={16} />}
                  <span>{action.label}</span>
                </Link>
              ))}

            {/* Primary Action (Add Button) */}
            {showAddButton && addButtonLabel && addButtonLink && (
              <Link
                href={addButtonLink}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2
                  px-6 py-3 rounded-2xl
                  bg-indigo-600 text-white text-xs font-black uppercase tracking-widest
                  hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-200"
              >
                {addButtonIcon ?? <Plus size={18} />}
                <span>{addButtonLabel}</span>
              </Link>
            )}

            {/* Logout (Hidden on very small mobile, visible from 500px up) */}
            {showLogout && (
              <div className="hidden sm:block ml-2 border-l border-gray-100 pl-4">
                <SignOutButton
                  label="Sign Out" // Pass string here
                  className="inline-flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-sm font-black text-[10px] uppercase tracking-widest"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}