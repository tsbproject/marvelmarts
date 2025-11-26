export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-black text-white p-6">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>

        <nav className="space-y-3">
          <a href="/admin" className="block">Dashboard</a>
          <a href="/admin/products" className="block">Products</a>
          <a href="/admin/orders" className="block">Orders</a>
          <a href="/admin/users" className="block">Users</a>
        </nav>
      </aside>

      <main className="flex-1 p-8 bg-gray-50">{children}</main>
    </div>
  );
}
