'use client';

import AdminSidebar from '../../components/admin/AdminSidebar';

import AdminGuard from '../../components/admin/AdminGuard';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AdminGuard>
            <div className="min-h-screen bg-gray-100 flex">
                <AdminSidebar />
                <main className="flex-1 md:ml-64 p-8">
                    {children}
                </main>
            </div>
        </AdminGuard>
    );
}
