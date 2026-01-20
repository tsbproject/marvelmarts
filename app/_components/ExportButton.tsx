"use client";

import { exportSubscribersToCSV } from "@/app/lib/actions/newsletter-actions";
import { useNotification } from "@/app/_context/NotificationContext";
import { Download } from "lucide-react";
import { useState } from "react";

export default function ExportButton() {
  const { notifySuccess, notifyError } = useNotification();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    const result = await exportSubscribersToCSV();

    if (result.success && result.data) {
      // Create a blob and trigger download
      const blob = new Blob([result.data], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      
      link.setAttribute("href", url);
      link.setAttribute("download", `marvelmarts_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      notifySuccess("Subscribers list exported successfully!");
    } else {
      notifyError(result.message || "Export failed");
    }
    setIsExporting(false);
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="flex items-center gap-2 bg-[#F7931E] hover:bg-[#1E1E1E] text-white px-6 py-3 rounded-xl font-black uppercase italic tracking-wider transition-all active:scale-95 disabled:opacity-50"
    >
      <Download size={20} />
      {isExporting ? "Generating..." : "Export CSV"}
    </button>
  );
}