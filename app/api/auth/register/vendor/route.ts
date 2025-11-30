import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/app/lib/prisma"; 



export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      firstName,
      lastName,
      email,
      password,
      storeName,
      storePhone,
      storeAddress,
      country,
      state
    } = body;

    // Check for missing fields
    if (!firstName || !lastName || !email || !password || !storeName || !storePhone || !storeAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if the email already exists in the User model
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }

    // Hash the password
    const hashed = await bcrypt.hash(password, 10);

    // Create a new User in the database
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashed,
        // Other user fields if applicable, e.g., firstName, lastName, etc.
      }
    });

    // Create a new VendorProfile and associate it with the newly created User
    const vendorProfile = await prisma.vendorProfile.create({
      data: {
        firstName,
        lastName,
        storeName,
        storePhone,
        storeAddress,
        country,
        state,
        userId: user.id,  // Associate the vendor profile with the user
      }
    });

    // Return the vendor profile data (excluding sensitive information like password)
    return NextResponse.json({
      success: true,
      vendorProfile: {
        id: vendorProfile.id,
        firstName: vendorProfile.firstName,
        lastName: vendorProfile.lastName,
        email: user.email,  // Returning the user's email here
        storeName: vendorProfile.storeName,
        storePhone: vendorProfile.storePhone,
        storeAddress: vendorProfile.storeAddress,
        country: vendorProfile.country,
        state: vendorProfile.state,
      }
    });
  } catch (err) {
    console.error("Error during vendor registration:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
