import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma"; // Adjust this path to where your prisma client is defined

export async function GET() {
  try {
    // 1. Delete all images first (due to foreign key constraints)
    await prisma.productImage.deleteMany({});
    
    // 2. Delete all products
    await prisma.product.deleteMany({});

    return NextResponse.json({ 
      message: "Database cleared successfully! All products and images have been deleted." 
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: "Failed to clear database", 
      details: error.message 
    }, { status: 500 });
  }
}