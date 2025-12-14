// app/api/auth/register/vendor/route.ts
import { prisma } from "@/app/lib/prisma";
import { VerificationType } from "@prisma/client";
import { NextResponse } from "next/server";


export const runtime = "nodejs";
export const dynamic = "force-dynamic";


export async function POST(req: Request) {
  try {
    // Frontend now sends the full payload again on final submit.
    // We accept it so we can merge with what's already stored in verification.vendorData.
    const {
      email,
      firstName,
      lastName,
      storeName,
      storePhone,
      storeAddress,
      country,
      state,
    } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Look up the latest verified code for this email
    const verification = await prisma.verificationCode.findFirst({
      where: { email, type: VerificationType.VENDOR_REGISTRATION, used: true },
      orderBy: { createdAt: "desc" },
    });

    if (!verification) {
      return NextResponse.json({ error: "Email not verified" }, { status: 400 });
    }

    // Merge data from the verification record with the payload from this request.
    // Payload values take precedence in case the user updated fields after sending the code.
    const verifiedVendorData = (verification.vendorData ?? {}) as Record<string, any>;
    const vendorData = {
      firstName: firstName ?? verifiedVendorData.firstName ?? "",
      lastName: lastName ?? verifiedVendorData.lastName ?? "",
      storeName: storeName ?? verifiedVendorData.storeName ?? "",
      storePhone: storePhone ?? verifiedVendorData.storePhone ?? "",
      storeAddress: storeAddress ?? verifiedVendorData.storeAddress ?? "",
      country: country ?? verifiedVendorData.country ?? "",
      state: state ?? verifiedVendorData.state ?? "",
    };

    // Simple server-side checks to avoid empty inserts
    const requiredMissing = Object.entries({
      firstName: vendorData.firstName,
      lastName: vendorData.lastName,
      storeName: vendorData.storeName,
      storePhone: vendorData.storePhone,
      storeAddress: vendorData.storeAddress,
      country: vendorData.country,
      state: vendorData.state,
    }).filter(([_, v]) => !String(v || "").trim());

    if (requiredMissing.length) {
      return NextResponse.json(
        {
          error: `Missing fields: ${requiredMissing.map(([k]) => k).join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Create or update the user and vendor profile
    let user = await prisma.user.findUnique({ where: { email: verification.email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: `${vendorData.firstName} ${vendorData.lastName}`.trim(),
          email: verification.email,
          // Password hash was created in send-code and is stored on the verification record
          passwordHash: verification.hashedPassword,
          role: "VENDOR",
          IsVerified: true,
          vendorProfile: {
            create: {
              firstName: vendorData.firstName,
              lastName: vendorData.lastName,
              storeName: vendorData.storeName,
              storePhone: vendorData.storePhone,
              storeAddress: vendorData.storeAddress,
              country: vendorData.country,
              state: vendorData.state,
              isVerified: true,
            },
          },
        },
      });
    } else {
      // Ensure role and verification flags are correct
      if (user.role !== "VENDOR" || !user.IsVerified) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "VENDOR", IsVerified: true },
        });
      }

      // Upsert vendor profile with merged data
      await prisma.vendorProfile.upsert({
        where: { userId: user.id },
        update: {
          firstName: vendorData.firstName,
          lastName: vendorData.lastName,
          storeName: vendorData.storeName,
          storePhone: vendorData.storePhone,
          storeAddress: vendorData.storeAddress,
          country: vendorData.country,
          state: vendorData.state,
          isVerified: true,
        },
        create: {
          userId: user.id,
          firstName: vendorData.firstName,
          lastName: vendorData.lastName,
          storeName: vendorData.storeName,
          storePhone: vendorData.storePhone,
          storeAddress: vendorData.storeAddress,
          country: vendorData.country,
          state: vendorData.state,
          isVerified: true,
        },
      });
    }

    // Clean up verification codes for this email (optional but recommended)
    await prisma.verificationCode.deleteMany({
      where: { email, type: VerificationType.VENDOR_REGISTRATION },
    });

    return NextResponse.json({ success: true, userId: user.id }, { status: 200 });
  } catch (err: any) {
    console.error("Vendor registration error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
