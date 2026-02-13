// app/api/test-email/route.ts
import { NextResponse } from "next/server";
import { sendVerificationEmailWithNodemailer } from "@/app/lib/mailer";

export async function GET() {
  try {
    // Replace with your actual email to see the result
    const testEmail = "bolarinwatayo@gmail.com"; 
    
    await sendVerificationEmailWithNodemailer(
      testEmail,
      "123456",
      "test-uid-123",
      "Tayo Bolarinwa",
      "VENDOR"
    );

    return NextResponse.json({ 
      success: true, 
      message: `Test email sent to ${testEmail}. Check your inbox (and spam folder)!` 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}