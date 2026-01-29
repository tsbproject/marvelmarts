import { ProductFormState } from "@/app/_components/ProductForm";

export function normalizeProductData(initialData: any | null): ProductFormState {
  // 1. Hard Fallback for Create Mode (No data)
  if (!initialData) {
    return {
      title: "",
      description: "",
      price: 0,
      discountPrice: 0,
      status: "ACTIVE",
      isFeatured: false,
      categories: [],
      sku: "",
      stock: 0,
      brand: "",
      tags: [],
      mainImage: null,
      extraImages: [],
      metaTitle: "",
      metaDescription: "",
      shippingMethod: "Standard",
      variants: [],
      weight: 0,
    };
  }

  // 2. Data Transformation for Edit Mode
  return {
    title: initialData.title ?? "",
    description: initialData.description ?? "",
    variants: initialData.variants || [], // Ensure it exists here too
    
    // Ensure numbers are actual numbers and not Prisma Decimal objects
    price: initialData.price ? Number(initialData.price) : 0,
    discountPrice: initialData.discountPrice ? Number(initialData.discountPrice) : 0,
    
    status: initialData.status ?? "ACTIVE",
    
    // Convert boolean or handle truthy/falsy values
    isFeatured: Boolean(initialData.isFeatured), 

    // Handle nested data if initialData comes directly from Prisma
    categories: Array.isArray(initialData.categories) 
      ? initialData.categories 
      : (initialData.categoryId ? [initialData.categoryId] : []),
      
    sku: initialData.sku ?? "",
    stock: initialData.stock ? Number(initialData.stock) : 0,
    brand: initialData.brand ?? "",
    tags: Array.isArray(initialData.tags) ? initialData.tags : [],
    
    // Images: use mainImage directly or fallback
    mainImage: initialData.mainImage || null,
    // Note: React-Select logic in ProductForm uses the 'url' property for previewing strings
    extraImages: Array.isArray(initialData.images) 
      ? initialData.images.map((img: any) => typeof img === 'string' ? img : img.url) 
      : [],
    
    metaTitle: initialData.metaTitle ?? "",
    metaDescription: initialData.metaDescription ?? "",

    // --- ADDED TO FIX BUILD ---
    shippingMethod: initialData.shippingMethod ?? "Standard",
    weight: initialData.weight ? Number(initialData.weight) : 0,
  };
}