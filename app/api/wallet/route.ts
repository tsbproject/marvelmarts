import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import prisma from "@/app/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ balance: 0, message: "Guest Mode" }, { status: 200 });
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
      select: { balance: true },
    });

    return NextResponse.json({
      balance: wallet?.balance ? Number(wallet.balance) : 0,
    });
  } catch (error: any) {
    console.error("CRITICAL_WALLET_API_ERROR:", error.message);

    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}