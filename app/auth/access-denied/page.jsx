export default function DeniedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md text-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="mt-4 text-gray-700">
          You do not have permission to view this page.
        </p>
      </div>
    </div>
  );
}
