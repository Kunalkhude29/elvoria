'use client';

import Link from 'next/link';
import { LayoutDashboard, Package, ShoppingCart, Layers, LogOut } from 'lucide-react';

const MENU_ITEMS = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Collections', href: '/admin/collections', icon: Layers }, // Note: layers icon or similar
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
];

export default function AdminSidebar() {
    return (
        <aside className="w-64 bg-charcoal text-white h-screen fixed left-0 top-0 overflow-y-auto hidden md:block">
            <div className="p-6 border-b border-gray-700">
                <h2 className="text-2xl font-serif font-bold">ELVORIA <span className="text-xs font-sans font-normal opacity-50 block">Admin Panel</span></h2>
            </div>

            <nav className="p-4 space-y-2">
                {MENU_ITEMS.map(item => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center space-x-3 px-4 py-3 rounded-md hover:bg-gray-800 transition-colors text-sm uppercase tracking-wider"
                    >
                        <item.icon className="w-5 h-5 text-gold" />
                        <span>{item.name}</span>
                    </Link>
                ))}
            </nav>

            <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
                <button className="flex items-center space-x-3 px-4 py-3 text-sm uppercase tracking-wider text-gray-400 hover:text-white transition-colors w-full">
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                </button>
            </div>
        </aside>
    );
}
