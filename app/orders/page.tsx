'use client';

import Image from 'next/image';

export default function OrderPage() {
  const order = {
    id: 'ORD-20251215-001',
    date: 'Dec 15, 2025',
    status: 'Processing',
    items: [
      {
        id: 1,
        title: 'Wireless Headphones',
        imageUrl: '/images/headphones.jpg',
        qty: 1,
        price: 120,
      },
      {
        id: 2,
        title: 'Smartphone Case',
        imageUrl: '/images/case.jpg',
        qty: 2,
        price: 25,
      },
    ],
    total: 170,
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6">Order Details</h1>
      <div className="border rounded-lg p-4 shadow-sm">
        <p><strong>Order ID:</strong> {order.id}</p>
        <p><strong>Date:</strong> {order.date}</p>
        <p><strong>Status:</strong> {order.status}</p>

        <div className="mt-4 space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4 items-center border-b pb-4">
              <Image src={item.imageUrl} alt={item.title} width={80} height={80} />
              <div>
                <h2 className="text-lg font-semibold">{item.title}</h2>
                <p>Qty: {item.qty}</p>
                <p className="text-gray-700">${item.price}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-xl font-bold">
          Total: ${order.total}
        </div>
      </div>
    </div>
  );
}
