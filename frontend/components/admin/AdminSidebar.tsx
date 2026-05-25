'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard, 
    Package, 
    ShoppingCart, 
    LogOut, 
    Library 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MENU_ITEMS = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { name: 'Products', icon: Package, href: '/admin/products' },
    { name: 'Orders', icon: ShoppingCart, href: '/admin/orders' },
    { name: 'Banners', icon: Library, href: '/admin/banners' },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const { signOut } = useAuth();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col z-50">
            {/* Header */}
            <div className="p-8 border-b border-gray-50 text-center">
                <Link href="/" className="text-2xl font-outfit font-bold text-charcoal tracking-widest block">SHWETA</Link>
                <p className="text-[10px] font-outfit font-semibold uppercase tracking-widest text-gold mt-1 font-bold">Admin Portal</p>
            </div>

            {/* Menu */}
            <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                                isActive 
                                    ? 'bg-charcoal text-white shadow-lg shadow-charcoal/20' 
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-charcoal'
                            }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="font-outfit font-semibold text-sm font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-6 border-t border-gray-50">
                <button
                    onClick={signOut}
                    className="flex items-center gap-3 px-4 py-3 w-full text-red-500 hover:bg-red-50 rounded-xl transition-all font-outfit font-semibold text-sm font-medium"
                >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
}
