import { NextResponse } from "next/server";
import ws from "ws";

import { AuthService } from "@/app/lib/services/auth.service";
import { handleApiError } from "@/app/lib/auth/api";

// Neon requires a WebSocket global for Prisma Accelerate
(global as any).WebSocket = ws;

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const session = await AuthService.login(
      email,
      password
    );

    const response = NextResponse.json({
      success: true,
      message: "Login successful.",
      user: session,
    });

    response.cookies.set(
      "marvelmarts_session",
      JSON.stringify(session),
      {
        httpOnly: true,
        secure:
          process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      }
    );

    return response;
  } catch (error) {
    return handleApiError(error);
  }
}