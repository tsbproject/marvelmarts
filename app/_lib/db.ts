// lib/db.ts
import { prisma } from "./prisma";

export async function getProducts() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return products;







// lib/db.ts
// import { supabase } from './supabase';

// export async function getProducts() {
//   const { data, error } = await supabase
//     .from('products')
//     .select('*')
//     .order('created_at', { ascending: false })
//     .limit(10);

//   if (error) throw error;
//   return data;
// }




