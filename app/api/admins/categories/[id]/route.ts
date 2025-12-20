// //app/api/admins/categories/[id]/route

// import { NextRequest, NextResponse } from "next/server";
// import { prisma } from "@/app/lib/prisma";
// import { z } from "zod";

// const updateSchema = z.object({
//   name: z.string().min(1).optional(),
//   slug: z.string().min(1).optional(),
//   parentId: z.string().optional(),
//   position: z.number().optional(),
// });

// // 🔹 Update Category
// export async function PUT(
//   req: NextRequest,
//   { params }: { params: { id: string } }
// ) {
//   try {
//     const body = await req.json();
//     const parsed = updateSchema.safeParse(body);

//     if (!parsed.success) {
//       return NextResponse.json(
//         { error: "Invalid payload", details: parsed.error.format() },
//         { status: 400 }
//       );
//     }

//     const data = parsed.data;

//     // 🔹 Normalize parentId
//     if (data.parentId === "") {
//       data.parentId = null;
//     }

//     // 🔹 Slug conflict check
//     if (data.slug) {
//       const existing = await prisma.category.findUnique({
//         where: { slug: data.slug },
//       });
//       if (existing && existing.id !== params.id) {
//         return NextResponse.json(
//           { error: "Slug already exists" },
//           { status: 400 }
//         );
//       }
//     }

//     // 🔹 Update category
//     const category = await prisma.category.update({
//       where: { id: params.id },
//       data,
//     });

//     return NextResponse.json({ success: true, category }, { status: 200 });
//   } catch (err: any) {
//     console.error("Category update error:", err);
//     return NextResponse.json(
//       {
//         error: "Internal Server Error",
//         details: err.message || "Unknown error",
//       },
//       { status: 500 }
//     );
//   }
// }


// //DELETE CATEGORY

// export async function DELETE(
//   _req: NextRequest,
//   context: { params: Promise<{ id: string }> }
// ) {
//   // 🔹 Await the params
//   const { id } = await context.params;

//   if (!id) {
//     return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
//   }

//   const category = await prisma.category.findUnique({ where: { id } });
//   if (!category) {
//     return NextResponse.json({ error: "Category not found" }, { status: 404 });
//   }

//   await prisma.category.delete({ where: { id } });

//   return NextResponse.json({ success: true }, { status: 200 });
// }




// app/api/admins/categories/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  parentId: z.string().nullable().optional(), // ✅ allow null
  position: z.number().optional(),
});


export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }   // ✅ correct typing
) {
  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Normalize parentId
    if (data.parentId === "") {
      data.parentId = null;
    }

    // Slug conflict check
    if (data.slug) {
      const existing = await prisma.category.findUnique({
        where: { slug: data.slug },
      });
      if (existing && existing.id !== params.id) {
        return NextResponse.json(
          { error: "Slug already exists" },
          { status: 400 }
        );
      }
    }

    // Update category
    const category = await prisma.category.update({
      where: { id: params.id },   // ✅ params.id is now defined
      data,
    });

    return NextResponse.json({ success: true, category }, { status: 200 });
  } catch (err: any) {
    console.error("Category update error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}

// 🔹 Delete Category
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "Category ID is required" }, { status: 400 });
  }

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  await prisma.category.delete({ where: { id } });

  return NextResponse.json({ success: true }, { status: 200 });
}
