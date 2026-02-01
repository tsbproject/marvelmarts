// import { NextResponse } from "next/server";
// import prisma from "@/app/lib/prisma";

// export async function PATCH(req: Request) {
//   try {
//     const body = await req.json();
//     const { 
//       ids, 
//       updateType, 
//       applyToAll, 
//       filters // { search, searchType, filter }
//     } = body;

//     // 1. Map the field name correctly
//     const fieldMapping: Record<string, string> = {
//       isFeatured: "isFeatured",
//       isFlashSale: "isFlashSale",
//       isNew: "isNewArrival",
//       isNewArrival: "isNewArrival"
//     };

//     const dbField = fieldMapping[updateType];
//     if (!dbField) {
//       return NextResponse.json({ success: false, message: "Invalid update type" }, { status: 400 });
//     }

//     let targetIds: string[] = [];

//     if (applyToAll && filters) {
//       // 2. GLOBAL MODE: Find ALL IDs matching the current filters
//       const where: any = {};
      
//       // Apply Search logic (matching your GET /api/products logic)
//       if (filters.search) {
//         if (filters.searchType === "title") {
//           where.title = { contains: filters.search, mode: "insensitive" };
//         } else if (filters.searchType === "category") {
//           where.category = { name: { contains: filters.search, mode: "insensitive" } };
//         } else if (filters.searchType === "vendor") {
//           where.vendor = { name: { contains: filters.search, mode: "insensitive" } };
//         } else {
//           where.OR = [
//             { title: { contains: filters.search, mode: "insensitive" } },
//             { category: { name: { contains: filters.search, mode: "insensitive" } } },
//             { vendor: { name: { contains: filters.search, mode: "insensitive" } } },
//           ];
//         }
//       }

//       // Apply Filter logic
//       if (filters.filter === "featured") where.isFeatured = true;
//       if (filters.filter === "new") where.isNewArrival = true;
//       if (filters.filter === "flash") where.isFlashSale = true;

//       const allMatchingProducts = await prisma.product.findMany({
//         where,
//         select: { id: true }
//       });
//       targetIds = allMatchingProducts.map(p => p.id);
//     } else {
//       // 3. SELECTION MODE: Use provided IDs
//       if (!ids || !Array.isArray(ids) || ids.length === 0) {
//         return NextResponse.json({ success: false, message: "No IDs provided" }, { status: 400 });
//       }
//       targetIds = ids;
//     }

//     // 4. Perform the Toggle via Transaction
//     // We fetch current values first to flip them individually
//     const currentStatus = await prisma.product.findMany({
//       where: { id: { in: targetIds } },
//       select: { id: true, [dbField]: true }
//     });

//     await prisma.$transaction(
//       currentStatus.map((p: any) =>
//         prisma.product.update({
//           where: { id: p.id },
//           data: { [dbField]: !p[dbField] }
//         })
//       )
//     );

//     return NextResponse.json({
//       success: true,
//       message: `Successfully updated ${targetIds.length} products`,
//       affectedIds: targetIds // Return these so Redux can sync if needed
//     });

//   } catch (error) {
//     console.error("Bulk Toggle Error:", error);
//     return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
//   }
// }




import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { ids, updateType, applyToAll, filters } = body;

    const fieldMapping: Record<string, string> = {
      isFeatured: "isFeatured",
      isFlashSale: "isFlashSale",
      isNew: "isNewArrival",
      isNewArrival: "isNewArrival"
    };

    const dbField = fieldMapping[updateType];
    if (!dbField) {
      return NextResponse.json({ success: false, message: "Invalid update type" }, { status: 400 });
    }

    let targetIds: string[] = [];

    // 1. Determine Target IDs
    if (applyToAll && filters) {
      const where: any = {};
      
      if (filters.search) {
        const searchConstraint = { contains: filters.search, mode: "insensitive" };
        if (filters.searchType === "title") where.title = searchConstraint;
        else if (filters.searchType === "category") where.category = { name: searchConstraint };
        else if (filters.searchType === "vendor") where.vendor = { name: searchConstraint };
        else {
          where.OR = [
            { title: searchConstraint },
            { category: { name: searchConstraint } },
            { vendor: { name: searchConstraint } },
          ];
        }
      }

      if (filters.filter === "featured") where.isFeatured = true;
      if (filters.filter === "new") where.isNewArrival = true;
      if (filters.filter === "flash") where.isFlashSale = true;

      const products = await prisma.product.findMany({ where, select: { id: true } });
      targetIds = products.map(p => p.id);
    } else {
      targetIds = ids || [];
    }

    if (targetIds.length === 0) {
      return NextResponse.json({ success: false, message: "No products targeted" }, { status: 400 });
    }

    // 2. Perform Toggle in a Transaction
    const currentStatus = await prisma.product.findMany({
      where: { id: { in: targetIds } },
      select: { id: true, [dbField]: true }
    });

    await prisma.$transaction(
      currentStatus.map((p: any) =>
        prisma.product.update({
          where: { id: p.id },
          data: { [dbField]: !p[dbField] }
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: `Updated ${targetIds.length} products`,
      affectedIds: targetIds
    });

  } catch (error) {
    console.error("Bulk Update Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}