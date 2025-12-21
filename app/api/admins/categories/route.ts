// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/app/lib/prisma";
// import type { Prisma } from "@prisma/client";

// import { z } from "zod";

// const createSchema = z.object({
//   name: z.string().min(1),
//   slug: z.string().min(1),
//   parentId: z.string().optional(),
//   position: z.number().optional(),
// });

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();
//     const parsed = createSchema.safeParse(body);

//     if (!parsed.success) {
//       return NextResponse.json(
//         { error: "Invalid payload", details: parsed.error.format() },
//         { status: 400 }
//       );
//     }

//     const data = parsed.data;

//     // Normalize parentId
//     if (data.parentId === "") {
//       data.parentId = null;
//     }

//     // Slug conflict check
//     const existing = await prisma.category.findUnique({
//       where: { slug: data.slug },
//     });
//     if (existing) {
//       return NextResponse.json(
//         { error: "Slug already exists" },
//         { status: 400 }
//       );
//     }

//     const category = await prisma.category.create({
//       data: {
//         name: data.name,
//         slug: data.slug,
//         parentId: data.parentId,
//         position: data.position ?? 0,
//       },
//     });

//     return NextResponse.json({ success: true, category }, { status: 201 });
//   } catch (err: any) {
//     console.error("Category create error:", err);
//     return NextResponse.json(
//       {
//         error: "Internal Server Error",
//         details: err.message ?? "Unknown error",
//       },
//       { status: 500 }
//     );
//   }
// }

// // 🔹 List Categories
// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);

//   const all = searchParams.get("all") === "true"; // 🔹 flag for full list
//   const page = parseInt(searchParams.get("page") || "1", 10);
//   const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
//   const search = searchParams.get("search") || "";
//   const sortBy = searchParams.get("sortBy") || "position";
//   const sortOrder = searchParams.get("sortOrder") || "asc";

//   const where: Prisma.CategoryWhereInput | undefined = search
//     ? {
//         OR: [
//           { name: { contains: search, mode: "insensitive" } },
//           { slug: { contains: search, mode: "insensitive" } },
//         ],
//       }
//     : undefined;

//   if (all) {
//     // 🔹 Return full list (for create/edit dropdowns)
//     const categories = await prisma.category.findMany({
//       where,
//       include: { parent: true, children: true },
//       orderBy: { [sortBy]: sortOrder },
//     });

//     return NextResponse.json({ success: true, categories });
//   }

//   // 🔹 Paginated mode (for table view)
//   const [categories, total] = await Promise.all([
//     prisma.category.findMany({
//       where,
//       include: { parent: true, children: true },
//       orderBy: { [sortBy]: sortOrder },
//       skip: (page - 1) * pageSize,
//       take: pageSize,
//     }),
//     prisma.category.count({ where }),
//   ]);

//   return NextResponse.json({
//     categories,
//     total,
//     page,
//     pageSize,
//     totalPages: Math.ceil(total / pageSize),
//     sortBy,
//     sortOrder,
//   });
// }




// app/api/admins/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import type { Prisma } from "@prisma/client";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  parentId: z.string().optional(),
  position: z.number().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // ✅ Normalize into a new object instead of mutating
    const normalizedData = {
      ...data,
      parentId: data.parentId && data.parentId !== "" ? data.parentId : null,
      position: data.position ?? 0,
    };

    // Slug conflict check
    const existing = await prisma.category.findUnique({
      where: { slug: normalizedData.slug },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Slug already exists" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: normalizedData,
    });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (err: any) {
    console.error("Category create error:", err);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: err.message ?? "Unknown error",
      },
      { status: 500 }
    );
  }
}

// 🔹 List Categories
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const all = searchParams.get("all") === "true"; // 🔹 flag for full list
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
  const search = searchParams.get("search") || "";
  const sortBy = searchParams.get("sortBy") || "position";
  const sortOrder = searchParams.get("sortOrder") || "asc";

  const where: Prisma.CategoryWhereInput | undefined = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
        ],
      }
    : undefined;

  if (all) {
    // 🔹 Return full list (for create/edit dropdowns)
    const categories = await prisma.category.findMany({
      where,
      include: { parent: true, children: true },
      orderBy: { [sortBy]: sortOrder },
    });

    return NextResponse.json({ success: true, categories });
  }

  // 🔹 Paginated mode (for table view)
  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      include: { parent: true, children: true },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.category.count({ where }),
  ]);

  return NextResponse.json({
    categories,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    sortBy,
    sortOrder,
  });
}
