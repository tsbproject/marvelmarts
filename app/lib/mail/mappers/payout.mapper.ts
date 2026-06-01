export function mapPayoutToStatusEmail(
  payout: any,
  status: "APPROVED" | "REJECTED",
  remarks?: string
) {
  return {
    to:
      payout.vendor?.email ?? "",

    vendorName:
      payout.vendor?.name ??
      "Vendor",

    amount:
      Number(payout.amount),

    status,

    remarks,
  };
}