'use client';

export default function FaqPage() {
  const faqs = [
    {
      question: 'How do I place an order?',
      answer: 'Browse products, add them to your cart, and proceed to checkout.',
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept credit/debit cards, PayPal, and local bank transfers.',
    },
    {
      question: 'How long does delivery take?',
      answer: 'Delivery usually takes 3–7 business days depending on your location.',
    },
    {
      question: 'Can I return a product?',
      answer: 'Yes, returns are accepted within 14 days of delivery if the product is unused.',
    },
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl font-bold mb-6">Frequently Asked Questions</h1>
      <div className="space-y-6">
        {faqs.map((faq, idx) => (
          <div key={idx} className="border-b pb-4">
            <h2 className="text-xl font-semibold">{faq.question}</h2>
            <p className="text-gray-600 mt-2">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
