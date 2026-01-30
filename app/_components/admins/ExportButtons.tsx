"use client";

import { Download, FileSpreadsheet, FileText } from "lucide-react";
import { exportToExcel, exportToPDF } from "@/app/lib/utils/export";

export default function ExportButtons({ data }: { data: any[] }) {
  const fileName = `MarvelMarts_Activity_${new Date().toISOString().split('T')[0]}`;

  return (
    <div className="flex gap-3">
      <button 
        onClick={() => exportToExcel(data, fileName)}
        className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-green-100 transition-all border border-green-200"
      >
        <FileSpreadsheet size={16} />
        Excel
      </button>
      <button 
        onClick={() => exportToPDF(data, fileName)}
        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-100 transition-all border border-red-200"
      >
        <FileText size={16} />
        PDF
      </button>
    </div>
  );
}