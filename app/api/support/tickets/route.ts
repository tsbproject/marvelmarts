import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import DOMPurify from "isomorphic-dompurify";

// 1. Strict Validation Schema
const ticketSchema = z.object({
  email: z.string().email().max(100),
  subject: z.string().min(3).max(150),
  message: z.string().min(10).max(5000),
  articleId: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  try {
    // SECURITY: Get IP for basic rate limiting
    const ip = req.headers.get("x-forwarded-for") || "anonymous";

    const json = await req.json();
    
    // Check if bot honeypot was sent in the request body (if you send it)
    if (json.marvel_bot_gate) {
      return NextResponse.json({ message: "Security Protocol Active" }, { status: 200 });
    }

    // 2. Data Validation
    const body = ticketSchema.parse(json);

    // 3. Sanitization (XSS Defense)
    const cleanMessage = DOMPurify.sanitize(body.message);
    const cleanSubject = DOMPurify.sanitize(body.subject);

    // 4. Database Operation
    const ticket = await prisma.ticket.create({
      data: {
        subject: cleanSubject,
        message: cleanMessage,
        userEmail: body.email,
        articleId: body.articleId || null,
      }
    });

    // ... your existing email logic ...

    return NextResponse.json({ success: true, id: ticket.id });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid Data Structure" }, { status: 422 });
    }
    return NextResponse.json({ error: "Internal Security Error" }, { status: 500 });
  }
}