// import { notFound } from 'next/navigation';
// import  prisma  from '@/app/lib/prisma';
// import Image from 'next/image';

// interface Props {
//   params: { slug: string };
// }

// export default async function ProductPage({ params }: Props) {
//   const product = await prisma.product.findUnique({
//     where: { slug: params.slug },
//     include: {
//       category: { select: { id: true, name: true } },
//       images: true,
//       variants: true,
//     },
//   });

//   if (!product) return notFound();

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
//       <p className="text-gray-700 mb-4">{product.description}</p>

//       {product.category && (
//         <p className="text-sm text-gray-500 mb-2">
//           Category: {product.category.name}
//         </p>
//       )}

//       <p className="text-xl font-bold text-green-600 mb-4">
//         ₦{product.price.toLocaleString()}
//       </p>

//       {product.images && product.images.length > 0 && (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
//           {product.images.map((img) => (
//             <Image
//               key={img.id}
//               src={img.url}
//               alt={img.alt ?? product.title}
//               width={600}
//               height={400}
//               className="rounded object-cover w-full h-auto"
//             />
//           ))}
//         </div>
//       )}

//       {product.variants && product.variants.length > 0 && (
//         <div className="mt-4">
//           <h2 className="text-lg font-semibold mb-2">Variants</h2>
//           <ul className="list-disc pl-5">
//             {product.variants.map((variant) => (
//               <li key={variant.id}>
//                 {variant.name} — ₦{variant.price.toLocaleString()}
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// }



import { notFound } from "next/navigation";
import prisma from "@/app/lib/prisma";
import Image from "next/image";

interface Props {
  params: { slug: string };
}

export default async function ProductPage({ params }: Props) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      category: { select: { id: true, name: true } },
      productImages: true, // ✅ correct relation name
      variants: true,
    },
  });

  if (!product) return notFound();

  // Fallback placeholder image
  const fallbackImage = {
    id: "placeholder",
    url: "https://via.placeholder.com/600x400?text=No+Image",
    alt: "No image available",
  };

  const imagesToShow =
    product.productImages && product.productImages.length > 0
      ? product.productImages
      : [fallbackImage];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
      <p className="text-gray-700 mb-4">{product.description}</p>

      {product.category && (
        <p className="text-sm text-gray-500 mb-2">
          Category: {product.category.name}
        </p>
      )}

      <p className="text-xl font-bold text-green-600 mb-4">
        ₦
        {Number(product.price).toLocaleString("en-NG", {
          minimumFractionDigits: 2,
        })}
      </p>

      {/* ✅ Always show at least one image */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {imagesToShow.map((img) => (
          <Image
            key={img.id}
            src={img.url}
            alt={img.alt ?? product.title}
            width={600}
            height={400}
            className="rounded object-cover w-full h-auto"
          />
        ))}
      </div>

      {product.variants && product.variants.length > 0 && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Variants</h2>
          <ul className="list-disc pl-5">
            {product.variants.map((variant) => (
              <li key={variant.id}>
                {variant.name} — ₦
                {Number(variant.price).toLocaleString("en-NG", {
                  minimumFractionDigits: 2,
                })}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}