import { NextResponse, NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { getToken } from "next-auth/jwt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


export async function GET(req: NextRequest) {
  try {
    // Get Session
    const session = await getServerSession(authOptions);

    // Get JWT Token
    const token = await getToken({ req });

    return NextResponse.json(
      {
        message: "Debug session data",
        session: session ?? null,
        token: token ?? null,
        summary: {
          loggedIn: !!session,
          role: token?.role ?? "none",
          permissions: token?.permissions ?? {},
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
