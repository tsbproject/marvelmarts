import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { VerificationType, UserRole, VendorStatus } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getLatestVerification, cleanupVerification } from "@/app/lib/registration";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const vendorRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  storeName: z.string().trim().min(1, "Store name is required"),
  storePhone: z.string().trim().min(10, "Business phone is required"),
  storeAddress: z.string().trim().min(5, "Store address is required"),
  state: z.string().trim().min(1, "State is required"),
  country: z.string().trim().default("Nigeria"),
  isReapplication: z.boolean().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = vendorRegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Missing required details", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      storeName, 
      storePhone, 
      storeAddress, 
      state, 
      country,
      isReapplication 
    } = parsed.data;

    // 1. DYNAMIC CHECK: Is this a new user, an upgrading customer, or a re-applicant?
    const existingUser = await prisma.user.findUnique({ 
      where: { email },
      include: { vendorProfile: true } 
    });

    // If they have a vendor profile and it's NOT a re-application, they are already a vendor.
    if (existingUser?.vendorProfile && !isReapplication) {
      return NextResponse.json({ error: "This email is already registered as a Vendor." }, { status: 400 });
    }

    // 2. Verification check: Only strictly required for brand new signups.
    // Existing customers are already verified by virtue of their account.
    if (!isReapplication && !existingUser) {
      const verification = await getLatestVerification(email, VerificationType.VENDOR_REGISTRATION);
      if (!verification) {
        return NextResponse.json({ error: "Email not verified. Please verify your email first." }, { status: 400 });
      }
    }

    // 3. Hash password (updates it for existing customers too)
    const finalPasswordHash = await bcrypt.hash(password, 12);

    // 4. Atomic Transaction: Upsert User + Vendor Profile
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.upsert({
        where: { email },
        update: {
          name: `${firstName} ${lastName}`,
          passwordHash: finalPasswordHash,
          IsVerified: true, 
          role: UserRole.VENDOR, // Upgrade role to VENDOR
          vendorProfile: {
            upsert: {
              create: {
                firstName,
                lastName,
                storeName,
                storePhone,
                storeAddress,
                state,
                country,
                isVerified: false, 
                status: VendorStatus.AWAITING_DOCUMENTS,
              },
              update: {
                firstName,
                lastName,
                storeName,
                storePhone,
                storeAddress,
                state,
                country,
               status: VendorStatus.AWAITING_DOCUMENTS,   
                rejectionReason: null, 
              },
            },
          },
        },
        create: {
          name: `${firstName} ${lastName}`,
          email,
          passwordHash: finalPasswordHash,
          role: UserRole.VENDOR,
          IsVerified: true,
          vendorProfile: {
            create: {
              firstName,
              lastName,
              storeName,
              storePhone,
              storeAddress,
              state,
              country,
              isVerified: false,
              status: VendorStatus.AWAITING_DOCUMENTS,
            },
          },
        },
        select: { id: true, email: true, role: true },
      });

      return user;
    });

    // 5. Cleanup Verification for new users
    if (!isReapplication && !existingUser) {
      await cleanupVerification(email, VerificationType.VENDOR_REGISTRATION);
    }

    return NextResponse.json({ 
      success: true, 
      message: isReapplication 
        ? "Application updated successfully" 
        : existingUser 
          ? "Account upgraded to Vendor successfully" 
          : "Store created successfully",
      user: result 
    }, { status: 201 });

  } catch (err: any) {
    console.error("Vendor registration error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}