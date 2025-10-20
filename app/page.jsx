import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-4">Welcome to MarvelMarts</h1>
      <p className="mb-6">Shop the latest gadgets, phones, laptops, and accessories.</p>
      <Link href="/products" className="bg-red-600 text-white px-6 py-3 rounded">
        Browse Products
      </Link>
    </div>
  )
}
