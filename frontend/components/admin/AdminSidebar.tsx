'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
    LayoutDashboard, 
    Package, 
    ShoppingCart, 
    LogOut, 
    Library,
    Image,
    X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MENU_ITEMS = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { name: 'Products', icon: Package, href: '/admin/products' },
    { name: 'Orders', icon: ShoppingCart, href: '/admin/orders' },
    { name: 'Banners', icon: Library, href: '/admin/banners' },
    { name: 'Homepage Images', icon: Image, href: '/admin/homepage-images/categories', subLinks: [
        { name: 'Category Images', href: '/admin/homepage-images/categories' },
        { name: 'Curated For You', href: '/admin/homepage-images/curated' },
    ]},
];

interface AdminSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
    const pathname = usePathname();
    const { signOut } = useAuth();

    return (
        <aside className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
            {/* Header */}
            <div className="p-8 border-b border-gray-50 text-center relative">
                <Link href="/" className="text-2xl font-outfit font-bold text-charcoal tracking-widest block">SHWETA</Link>
                <p className="text-[10px] font-outfit font-semibold uppercase tracking-widest text-gold mt-1 font-bold">Admin Portal</p>
                <button 
                    onClick={onClose}
                    className="absolute right-4 top-8 p-1 text-gray-400 hover:text-charcoal md:hidden"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Menu */}
            <nav className="flex-1 p-6 space-y-1 overflow-y-auto">
                {MENU_ITEMS.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                    const isParentActive = item.subLinks?.some(s => pathname.startsWith(s.href));
                    return (
                        <div key={item.name}>
                            <Link
                                href={item.href}
                                onClick={onClose}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                                    isActive || isParentActive
                                        ? 'bg-charcoal text-white shadow-lg shadow-charcoal/20' 
                                        : 'text-gray-500 hover:bg-gray-50 hover:text-charcoal'
                                }`}
                            >
                                <item.icon className="w-5 h-5" />
                                <span className="font-outfit font-semibold text-sm font-medium">{item.name}</span>
                            </Link>
                            {/* Sub-links */}
                            {item.subLinks && (isActive || isParentActive) && (
                                <div className="ml-8 mt-1 space-y-1">
                                    {item.subLinks.map(sub => (
                                        <Link
                                            key={sub.href}
                                            href={sub.href}
                                            onClick={onClose}
                                            className={`block px-3 py-2 rounded-lg text-xs font-outfit font-semibold uppercase tracking-wider transition-colors ${
                                                pathname === sub.href
                                                    ? 'text-gold'
                                                    : 'text-gray-400 hover:text-charcoal'
                                            }`}
                                        >
                                            {sub.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
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
