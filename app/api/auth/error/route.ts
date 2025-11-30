// app/api/auth/error/route.ts

import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // Example logic: Simulate a server-side error
    throw new Error("An example error occurred");

    // If no error occurs
    return NextResponse.json({ message: "No errors" });
  } catch (error) {
    console.error("Caught error:", error);  // Log the error
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
