// app/api/test-email/route.ts
import { NextResponse } from "next/server";
import { sendVendorCreditPurchaseEmail } from "@/app/lib/mailer";

export async function GET(req: Request) {
  try {
    // Get the 'type' from the URL query, e.g., ?type=APPROVED or ?type=REJECTED
    const { searchParams } = new URL(req.url);
    const type = (searchParams.get("type") || "APPROVED") as "APPROVED" | "REJECTED";
    
    const testEmail = "tsbolarinwa@gmail.com"; 

    await sendVendorCreditPurchaseEmail({
      email: testEmail,
      firstName: "Tayo",
      storeName: "Marvelmarts Premium Store",
      amountAdded: 50,
      newBalance: 120,
    
         
    });

    return NextResponse.json({ 
      success: true, 
      message: `Test ${type} email sent to ${testEmail}.` 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}