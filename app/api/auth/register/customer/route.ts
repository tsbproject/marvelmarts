// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/app/lib/prisma";
// import bcrypt from "bcrypt";

// // Rate limiting (simple memory)
// type RateEntry = { timestamps: number[] };
// const RATE_LIMIT_STORE = new Map<string, RateEntry>();
// const RATE_LIMIT_MAX = 6;
// const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

// function getClientIp(req: NextRequest): string {
//   const xf = req.headers.get("x-forwarded-for");
//   if (xf) return xf.split(",")[0].trim();
//   return req.ip ?? req.headers.get("x-real-ip") ?? "unknown";
// }

// function checkRateLimit(ip: string): boolean {
//   const now = Date.now();
//   const entry = RATE_LIMIT_STORE.get(ip) ?? { timestamps: [] };
//   entry.timestamps = entry.timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

//   if (entry.timestamps.length >= RATE_LIMIT_MAX) {
//     RATE_LIMIT_STORE.set(ip, entry);
//     return false;
//   }

//   entry.timestamps.push(now);
//   RATE_LIMIT_STORE.set(ip, entry);
//   return true;
// }

// const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// const MIN_PASSWORD_LENGTH = 8;

// function sanitize(input: string): string {
//   return input.replace(/[<>]/g, "").trim();
// }

// export async function POST(req: NextRequest) {
//   try {
//     const ip = getClientIp(req);
//     if (!checkRateLimit(ip)) {
//       return NextResponse.json(
//         { error: "Too many attempts. Try again later." },
//         { status: 429 }
//       );
//     }

//     const body = await req.json();

//     const name = sanitize(body?.name ?? "");
//     const email = sanitize(body?.email ?? "").toLowerCase();
//     const password = String(body?.password ?? "");

//     if (!name || !email || !password) {
//       return NextResponse.json({ error: "All fields are required." }, { status: 400 });
//     }

//     if (!EMAIL_REGEX.test(email)) {
//       return NextResponse.json({ error: "Invalid email format." }, { status: 400 });
//     }

//     if (
//       password.length < MIN_PASSWORD_LENGTH ||
//       !/[A-Z]/.test(password) ||
//       !/\d/.test(password)
//     ) {
//       return NextResponse.json(
//         { error: "Password must include 8 chars, 1 uppercase, 1 number." },
//         { status: 400 }
//       );
//     }

//     // Email uniqueness
//     const existing = await prisma.user.findUnique({ where: { email } });
//     if (existing) {
//       return NextResponse.json(
//         { error: "Email already exists." },
//         { status: 409 }
//       );
//     }

//     const passwordHash = await bcrypt.hash(password, 12);

//     await prisma.user.create({
//       data: {
//         name,
//         email,
//         passwordHash,
//         role: "CUSTOMER",
//       },
//     });

//     return NextResponse.json({ success: true }, { status: 201 });

//   } catch (err) {
//     return NextResponse.json(
//       { error: "Server error. Please try again." },
//       { status: 500 }
//     );
//   }
// }



import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const securityHeader = req.headers.get("X-Form-Security");
    if (securityHeader !== "customer-registration-v1") {
      return NextResponse.json(
        { error: "Invalid request origin." },
        { status: 403 }
      );
    }

    const body = await req.json();

    const name = String(body.name || "").replace(/[<>]/g, "").trim();
    const email = String(body.email || "").toLowerCase().trim();
    const password = String(body.password || "");

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format." },
        { status: 400 }
      );
    }

    if (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      return NextResponse.json(
        {
          error:
            "Password must be 8+ characters, include 1 uppercase letter and 1 number.",
        },
        { status: 400 }
      );
    }

    // Prevent duplicate accounts
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Email already in use." },
        { status: 409 }
      );
    }

    // Password hashing
    const hash = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hash,
        role: "CUSTOMER", // CUSTOMER
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Customer registration error:", err);
    return NextResponse.json(
      { error: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}

