// app/api/auth/_log/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Log the incoming data (or process as needed)
    console.log("Received log data:", body);

    // You can save to a database or perform additional actions here.
    
    return NextResponse.json({ message: "Log saved successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error logging:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
