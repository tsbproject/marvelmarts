export interface PayoutStatusData {
  to: string;
  vendorName: string;
  amount: number;
  status: "APPROVED" | "REJECTED";
  remarks?: string;
}