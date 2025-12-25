// app/not-found.tsx
export const dynamic = "force-dynamic"; 

export default function NotFound() {
  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold text-gray-800">404 - Page Not Found</h1>
      <p className="text-gray-600 mt-2">
        Sorry, the page you’re looking for doesn’t exist.
      </p>
    </div>
  );
}
