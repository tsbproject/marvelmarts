"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface SecurityBackButtonProps {
  href?: string;
  label?: string;
}

export default function SecurityBackButton({
  href = "/dashboard/admins/security",
  label = "Back to Security Center",
}: SecurityBackButtonProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push(href)}
      className="
        inline-flex
        items-center
        gap-2
        rounded-xl
        border
        border-gray-100
        bg-white
        px-4
        py-2.5
        text-[10px]
        font-black
        uppercase
        tracking-[0.14em]
        text-accent-navy
        shadow-sm
        transition
        hover:border-indigo-100
        hover:bg-indigo-50
        hover:text-indigo-600
        active:scale-[0.98]
      "
    >
      <ArrowLeft size={15} />
      {label}
    </button>
  );
}