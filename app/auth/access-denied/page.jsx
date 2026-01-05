// app/auth/denied/page.tsx
export default function DeniedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-md text-center max-w-md md:min-w-3xl md:h-150">
        <h1 className="text-3xl md:text-5xl font-bold text-red-600 mt-33">Access Denied</h1>
        <p className="mt-4 text-gray-700 text-2xl">
          You do not have permission to view this page.
        </p>

        <div className="mt-6 space-y-3">
          <a
            href="/"
            className="block w-full py-2 bg-accent-navy text-white text-2xl rounded-lg font-semibold hover:bg-gray-900 transition"
          >
            Go to Homepage
          </a>
          <a
            href="/auth/sign-in"
            className="block w-full py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 text-2xl hover:bg-gray-100 transition"
          >
            Sign in with another account
          </a>
        </div>
      </div>
    </div>
  );
}
