import NextAuth from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { withApiLogging } from "@/app/lib/logging/with-api-logging";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handler = NextAuth(authOptions);

export const GET = withApiLogging(handler);
export const POST = withApiLogging(handler);