// import { NextResponse } from "next/server";
// import { prisma } from "@/app/lib/prisma";
// import { VerificationType } from "@prisma/client";
// import bcrypt from "bcryptjs";
// import crypto from "crypto";
// import { sendVerificationEmailWithNodemailer } from "@/app/lib/mailer";

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { email, password, firstName, lastName } = body;

//     if (!email || !password) {
//       return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
//     }

//     // 1. Hash password immediately to store in verification record
//     const hashedPassword = await bcrypt.hash(password, 12);
//     const code = crypto.randomBytes(3).toString("hex").toUpperCase();

//     // 2. Save intent
//     const verification = await prisma.verificationCode.create({
//       data: {
//         email,
//         hashedPassword,
//         code,
//         type: VerificationType.VENDOR_REGISTRATION,
//         expiresAt: new Date(Date.now() + 15 * 60 * 1000),
//       },
//     });

//     // 3. Send Mail
//     await sendVerificationEmailWithNodemailer(email, code, verification.id, firstName, "VENDOR");

//     return NextResponse.json({ success: true, verificationId: verification.id });
//   } catch (err: any) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }





import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { VerificationType } from "@prisma/client";
import crypto from "crypto";
import { sendVerificationEmailWithNodemailer } from "@/app/lib/mailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // REMOVED: password requirement
    const { email, firstName, lastName } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // 1. Generate a 6-character hex code
    const code = crypto.randomBytes(3).toString("hex").toUpperCase();

    // 2. Save the verification intent 
    // Note: We are NO LONGER saving hashedPassword here. 
    // The password will be handled in the final registration step.
    const verification = await prisma.verificationCode.create({
      data: {
        email,
        code,
        type: VerificationType.VENDOR_REGISTRATION,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
      },
    });

    // 3. Send Mail
    await sendVerificationEmailWithNodemailer(
      email, 
      code, 
      verification.id, 
      firstName || "Valued Merchant", 
      "VENDOR"
    );

    return NextResponse.json({ 
      success: true, 
      verificationId: verification.id 
    });
    
  } catch (err: any) {
    console.error("SEND_CODE_ERROR:", err);
    return NextResponse.json({ error: "Failed to send verification code" }, { status: 500 });
  }
}