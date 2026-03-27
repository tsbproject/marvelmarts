import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";

// GET: Fetch existing bank details for the logged-in user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const bankDetails = await prisma.bankAccount.findFirst({
      where: {
        user: {
          email: session.user.email,
        },
      },
    });

    return NextResponse.json(bankDetails);
  } catch (error) {
    console.error("[BANK_DETAILS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST: Create or Update bank details
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { bankName, accountNumber, accountName } = body;

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!bankName || !accountNumber || !accountName) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Find the user first to get their ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // UPSERT: Update if exists, Create if not
    const bankAccount = await prisma.bankAccount.upsert({
      where: {
        userId: user.id,
      },
      update: {
        bankName,
        accountNumber,
        accountName,
      },
      create: {
        userId: user.id,
        bankName,
        accountNumber,
        accountName,
      },
    });

    return NextResponse.json(bankAccount);
  } catch (error) {
    console.error("[BANK_DETAILS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}