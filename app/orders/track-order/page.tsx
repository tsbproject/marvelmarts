
'use client';

export default function TrackOrderPage() {
  const tracking = {
    orderId: 'ORD-20251215-001',
    steps: [
      { status: 'Order Placed', date: 'Dec 15, 2025', completed: true },
      { status: 'Processing', date: 'Dec 16, 2025', completed: true },
      { status: 'Shipped', date: 'Dec 17, 2025', completed: false },
      { status: 'Out for Delivery', date: '', completed: false },
      { status: 'Delivered', date: '', completed: false },
    ],
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6">Track Your Order</h1>
      <p className="mb-4"><strong>Order ID:</strong> {tracking.orderId}</p>

      <div className="space-y-4">
        {tracking.steps.map((step, idx) => (
          <div
            key={idx}
            className={`flex items-center gap-4 p-4 rounded-lg border ${
              step.completed ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className={`w-4 h-4 rounded-full ${step.completed ? 'bg-green-500' : 'bg-gray-400'}`} />
            <div>
              <p className="font-semibold">{step.status}</p>
              {step.date && <p className="text-sm text-gray-500">{step.date}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
