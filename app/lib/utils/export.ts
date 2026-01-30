import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import "jspdf-autotable";

// EXCEL EXPORT
export const exportToExcel = (data: any[], fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8" });
  saveAs(blob, `${fileName}.xlsx`);
};

// PDF EXPORT
export const exportToPDF = (data: any[], fileName: string) => {
  const doc = new jsPDF();
  doc.text("MarvelMarts Sales Activity Report", 14, 15);
  
  const tableColumn = ["Order #", "Customer", "Amount", "Status", "Date"];
  const tableRows = data.map(order => [
    order.orderNumber,
    `${order.firstName} ${order.lastName}`,
    `N${order.total}`,
    order.paymentStatus ? "Paid" : "Pending",
    new Date(order.createdAt).toLocaleDateString()
  ]);

  (doc as any).autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 25,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [79, 70, 229] } // Your brand indigo
  });

  doc.save(`${fileName}.pdf`);
};