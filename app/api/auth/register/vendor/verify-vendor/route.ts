import { prisma } from "@/app/lib/prisma";
import { VerificationType } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { uid, code } = await req.json();

    if (!uid || !code) {
      return NextResponse.json(
        { error: "Verification ID and code required." },
        { status: 400 }
      );
    }

    const verification = await prisma.verificationCode.findUnique({
      where: { id: uid },
    });

    if (!verification || verification.type !== VerificationType.VENDOR_REGISTRATION) {
      return NextResponse.json({ error: "Invalid verification record." }, { status: 404 });
    }

    if (verification.expiresAt < new Date()) {
      return NextResponse.json({ error: "Verification code expired." }, { status: 400 });
    }

    if (verification.used) {
      return NextResponse.json({ error: "Code already used." }, { status: 400 });
    }

    if (verification.code !== code) {
      return NextResponse.json({ error: "Invalid verification code." }, { status: 400 });
    }

    // ✅ Extract vendor data from JSON column
    const vendorData = verification.vendorData as {
      firstName: string;
      lastName: string;
      storeName: string;
      storePhone: string;
      storeAddress: string;
      country: string;
      state: string;
    };

    // ✅ Check if user already exists
    let user = await prisma.user.findUnique({ where: { email: verification.email } });

    if (!user) {
      // Create new vendor user + profile
      user = await prisma.user.create({
        data: {
          name: `${vendorData.firstName} ${vendorData.lastName}`,
          email: verification.email,
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
      // Update or create vendor profile if needed
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

      // Ensure user role is set to VENDOR
      if (user.role !== "VENDOR") {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "VENDOR", IsVerified: true },
        });
      }
    }

    // ✅ Mark verification as used
    await prisma.verificationCode.update({
      where: { id: uid },
      data: { used: true },
    });

    return NextResponse.json({ success: true, userId: user.id }, { status: 200 });
  } catch (err: any) {
    console.error("Vendor verify-code error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
