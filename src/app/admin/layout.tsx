"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Store } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import AdminSidebar from "@/component/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const isAdmin = isAuthenticated && (user?.role === "admin" || user?.role === "staff");

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 text-sm text-gray-500">
        Loading admin...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="w-full max-w-md border border-gray-200 bg-white p-8 text-center">
          <h1 className="text-2xl font-bold text-black">Admin access required</h1>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            {isAuthenticated
              ? "Your account does not have admin or staff permissions."
              : "Please sign in with an admin or staff account to continue."}
          </p>
          <Link
            href="/"
            className="mt-6 inline-block bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Back to store
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between gap-4 border-b border-gray-200 bg-white px-5 py-3">
          <p className="text-sm font-semibold text-gray-500 md:hidden">Kofora Admin</p>
          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              <Store size={15} />
              View store
            </Link>
            <span className="hidden text-sm text-gray-600 sm:inline">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </header>
        <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
