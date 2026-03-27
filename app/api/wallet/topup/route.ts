import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import prismadb from "@/app/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const { amount } = await req.json();

    if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });
    if (!amount || amount < 500) return new NextResponse("Invalid amount", { status: 400 });

    // Update the balance in the database
    const updatedUser = await prismadb.user.update({
      where: { email: session.user.email },
      data: {
        walletBalance: { increment: amount }
      }
    });

    return NextResponse.json({ balance: updatedUser.walletBalance });
  } catch (error) {
    console.error("[WALLET_TOPUP_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}