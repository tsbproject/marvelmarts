// /app/api/auth/vendor/send-code/route.ts

import { NextResponse } from "next/server";

// Your email sending function
const sendVerificationEmail = async (email: string, code: string) => {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      to: email,
      subject: "Your Verification Code",
      text: `Your verification code is ${code}`,
    }),
  });

  const data = await res.json();
  return data;
};

export async function POST(req: Request) {
  try {
    const { email, verificationCode } = await req.json();

    // Call your email function here
    await sendVerificationEmail(email, verificationCode);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error sending verification email:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
