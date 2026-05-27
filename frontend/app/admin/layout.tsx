'use client';

import { useState } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminGuard from '../../components/admin/AdminGuard';
import { Menu } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <AdminGuard>
            <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row relative">
                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between bg-white border-b border-gray-100 p-4 sticky top-0 z-40">
                    <div className="flex flex-col">
                        <span className="text-xl font-outfit font-bold text-charcoal tracking-widest leading-none">SHWETA</span>
                        <span className="text-[8px] font-outfit font-semibold uppercase tracking-widest text-gold mt-1">Admin Portal</span>
                    </div>
                    <button 
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 -mr-2 text-charcoal hover:bg-gray-50 rounded-lg"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </div>

                {/* Sidebar Overlay for Mobile */}
                {isMobileMenuOpen && (
                    <div 
                        className="fixed inset-0 bg-charcoal/40 z-40 md:hidden backdrop-blur-sm transition-opacity"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}

                <AdminSidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
                <main className="flex-1 md:ml-64 p-4 md:p-8 w-full overflow-x-hidden">
                    {children}
                </main>
            </div>
        </AdminGuard>
    );
}
