// import { prisma } from "@/app/lib/prisma";
// import crypto from "crypto";
// import { sendPasswordResetEmail } from "@/app/lib/mailer";

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { email } = body;

//     // Basic validation
//     if (!email || typeof email !== "string") {
//       return Response.json(
//         { success: false, error: "Invalid email" },
//         { status: 400 }
//       );
//     }

//     // 1️⃣ Find ANY user by email (SUPER_ADMIN, ADMIN, CUSTOMER)
//     const user = await prisma.user.findUnique({
//       where: { email },
//     });

//     if (!user) {
//       return Response.json(
//         { success: false, error: "No account found with this email" },
//         { status: 404 }
//       );
//     }

//     // 2️⃣ Generate 6-digit reset code
//     const resetCode = crypto.randomInt(100000, 999999).toString();

//     // 3️⃣ Upsert token (unique by userId)
//     await prisma.passwordResetToken.upsert({
//       where: { userId: user.id },
//       update: {
//         token: resetCode,
//         expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
//       },
//       create: {
//         userId: user.id,
//         token: resetCode,
//         expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
//       },
//     });

//     // 4️⃣ Send reset email
//     await sendPasswordResetEmail(user.email, resetCode);

//     return Response.json(
//       { success: true, message: "Password reset code sent successfully" },
//       { status: 200 }
//     );
//   } catch (error: unknown) {
//     console.error("Forgot-password route error:", error);
//     const message =
//       error instanceof Error ? error.message : "Internal server error";

//     return Response.json(
//       { success: false, error: message },
//       { status: 500 }
//     );
//   }
// }


import { prisma } from "@/app/lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/app/lib/mailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
      return Response.json(
        { success: false, error: "Invalid email" },
        { status: 400 }
      );
    }

    // ✅ Find user by email, any role
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return Response.json(
        { success: false, error: "No account found with this email" },
        { status: 404 }
      );
    }

    // ✅ Generate 6-digit reset code
    const resetCode = crypto.randomInt(100000, 999999).toString();

    // ✅ Upsert token
    await prisma.passwordResetToken.upsert({
      where: { userId: user.id },
      update: {
        token: resetCode,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
      create: {
        userId: user.id,
        token: resetCode,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    // ✅ Send email
    await sendPasswordResetEmail(user.email, resetCode);

    return Response.json(
      { success: true, message: "Password reset code sent successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Forgot-password route error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return Response.json({ success: false, error: message }, { status: 500 });
  }
}


