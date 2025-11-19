// app/api/products/route.ts

// app/api/products/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/app/_lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: { select: { id: true, name: true } },
        images: true,
        variants: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(products);
  } catch (err) {
    console.error('GET /api/products error', err);
    return NextResponse.json({ message: 'Failed to fetch products' }, { status: 500 });
  }
}








// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';
// import { supabase } from '@/app/_lib/supabase';

// // GET /api/products → list products
// export async function GET() {
//   try {
//     const { data: products, error } = await supabase
//       .from('products')
//       .select(`
//         *,
//         category:category_id ( id, name ),
//         images (*),
//         variants (*)
//       `)
//       .order('created_at', { ascending: false });

//     if (error) {
//       console.error('GET /api/products error', error);
//       return NextResponse.json({ message: 'Failed to fetch products' }, { status: 500 });
//     }

//     return NextResponse.json(products);
//   } catch (err) {
//     console.error('GET /api/products unexpected error', err);
//     return NextResponse.json({ message: 'Unexpected error' }, { status: 500 });
//   }
// }

// // POST /api/products → create product
// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();

//     const {
//       title,
//       slug,
//       description,
//       price,
//       categoryId,
//       brand,
//       stock,
//       status,
//       images,
//     } = body;

//     if (!title || !slug || !description || typeof price !== 'number') {
//       return NextResponse.json(
//         { message: 'title, slug, description and price are required' },
//         { status: 400 }
//       );
//     }

//     // Step 1: Insert product
//     const { data: productData, error: productError } = await supabase
//       .from('products')
//       .insert([
//         {
//           title,
//           slug,
//           description,
//           price,
//           brand,
//           stock: stock ?? 0,
//           status: status ?? 'active',
//           category_id: categoryId ?? null,
//         },
//       ])
//       .select('*')
//       .single();

//     if (productError || !productData) {
//       console.error('POST /api/products insert error', productError);
//       return NextResponse.json({ message: 'Failed to create product' }, { status: 500 });
//     }

//     // Step 2: Insert images if provided
//     if (images && Array.isArray(images)) {
//       const formattedImages = images.map((img: { url: string; alt?: string; position?: number }) => ({
//         url: img.url,
//         alt: img.alt ?? '',
//         position: img.position ?? 0,
//         product_id: productData.id,
//       }));

//       const { error: imageError } = await supabase.from('images').insert(formattedImages);
//       if (imageError) {
//         console.warn('Image insert failed:', imageError);
//       }
//     }

//     // Step 3: Fetch full product with relations
//     const { data: fullProduct, error: fetchError } = await supabase
//       .from('products')
//       .select(`
//         *,
//         category:category_id ( id, name ),
//         images (*),
//         variants (*)
//       `)
//       .eq('id', productData.id)
//       .single();

//     if (fetchError || !fullProduct) {
//       console.error('POST /api/products fetch error', fetchError);
//       return NextResponse.json({ message: 'Product created but failed to fetch full data' }, { status: 201 });
//     }

//     return NextResponse.json(fullProduct, { status: 201 });
//   } catch (err) {
//     console.error('POST /api/products unexpected error', err);
//     return NextResponse.json({ message: 'Failed to create product' }, { status: 500 });
//   }
// }