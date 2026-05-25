'use client';

import Link from 'next/link';
import { Search, Heart, ShoppingBag, User, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';

export default function Navbar() {
    const { user, profile, loading } = useAuth();
    const activeUser = profile || user;
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { cartCount, openCart, isLoaded } = useCart();
    const { wishlistCount, activeNavTab, setActiveNavTab } = useWishlist();
    const { openSearch } = useSearch();
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);

        // Track main navigation tabs
        if (pathname === '/' || pathname === '/men' || pathname === '/shop') {
            setActiveNavTab(pathname);
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, [pathname, setActiveNavTab]);

    // Updated Links
    const NAV_LINKS = [
        { name: 'WOMEN', href: '/' },
        { name: 'MEN', href: '/men' },
        { name: 'SHOP', href: '/shop' },
    ];

    return (
        <>
            <header
                className={clsx(
                    'sticky top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
                    isScrolled ? 'py-4 border-stone-200 shadow-sm backdrop-blur-md' : 'py-6 border-stone-100'
                )}
                style={{ backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.92)' : '#ffffff' }}
            >
                <div className="main-container flex items-center justify-between relative">
                    {/* Left Section: Menu + Links */}
                    <div className="flex items-center gap-6">
                        {/* Hamburger Menu */}
                        <button
                            className="p-1 hover:text-gold transition-colors text-charcoal"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>

                        {/* Navigation Links */}
                        <nav className="hidden lg:flex items-center space-x-10">
                            {NAV_LINKS.map((link) => {
                                const isCurrentPath = link.href === '/' ? pathname === '/' : (pathname === link.href || pathname.startsWith(`${link.href}/`));
                                const isWishlistAndActive = pathname === '/wishlist' && activeNavTab === link.href;
                                const isActive = isCurrentPath || isWishlistAndActive;

                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={clsx(
                                            "text-sm font-outfit font-semibold font-medium uppercase tracking-widest transition-colors duration-300 group relative",
                                            isActive ? "text-gold" : "text-charcoal hover:text-gold"
                                        )}
                                    >
                                        {link.name}
                                        <span className={clsx(
                                            "absolute -bottom-1 left-0 h-[1px] bg-gold transition-all duration-500",
                                            isActive ? "w-full" : "w-0 group-hover:w-full"
                                        )}></span>
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Center Section: Brand Logo */}
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <Link href="/" className="text-2xl sm:text-3xl lg:text-4xl font-outfit tracking-widest font-bold text-charcoal">
                            SHWETA
                        </Link>
                    </div>

                    {/* Right Section: Icons */}
                    <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-6">
                        <button onClick={openSearch} className="hover:text-gold transition-all duration-300 hover:scale-105 text-charcoal">
                            <Search className="w-[18px] h-[18px]" />
                        </button>
                        <Link href="/wishlist" className="hover:text-gold transition-all duration-300 hover:scale-105 text-charcoal relative">
                            <Heart className="w-[18px] h-[18px]" />
                            {wishlistCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-gold text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                    {wishlistCount}
                                </span>
                            )}
                        </Link>
                        <button onClick={openCart} className="hover:text-gold transition-all duration-300 hover:scale-105 text-charcoal relative">
                            <ShoppingBag className="w-[18px] h-[18px]" />
                            {isLoaded && cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-gold text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                        <Link 
                            href={activeUser ? (activeUser.role === 'ADMIN' ? '/admin' : '/profile') : '/login'} 
                            className="hover:text-gold transition-all duration-300 hover:scale-105 text-charcoal"
                        >
                            <User className="w-[18px] h-[18px]" />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Dim Backdrop Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-[1px]"
                        />

                        {/* Slide-in Left Drawer (The Souled Store Style) */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                            className="fixed top-0 left-0 bottom-0 z-[60] bg-white h-screen w-[280px] sm:w-[320px] flex flex-col p-6 shadow-[10px_0_50px_rgba(0,0,0,0.15)] border-r border-stone-100"
                        >
                            {/* Drawer Title & Close Button */}
                            <div className="flex justify-between items-center pb-4 border-b border-stone-100 mb-6">
                                <span className="text-xs font-outfit uppercase tracking-widest font-bold text-stone-400">Navigation</span>
                                <button 
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-1 hover:bg-stone-50 rounded-full transition-colors text-charcoal hover:text-gold"
                                    aria-label="Close menu"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* User Profile / Greeting Card */}
                            <Link 
                                href={activeUser ? (activeUser.role === 'ADMIN' ? '/admin' : '/profile') : '/login'}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex items-center gap-3 bg-stone-50 hover:bg-stone-100/80 p-3.5 rounded-xl mb-6 border border-stone-100/50 transition-colors text-left"
                            >
                                <div className="w-8.5 h-8.5 rounded-full bg-beige/30 flex items-center justify-center border border-stone-100 p-2">
                                    <User className="w-4 h-4 text-charcoal/70" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <span className="text-[10px] font-outfit text-stone-400 font-bold uppercase tracking-wider block leading-none mb-1">
                                        {activeUser ? 'Your Account' : 'Welcome to SHWETA'}
                                    </span>
                                    <span className="text-xs font-outfit font-bold text-charcoal truncate block leading-none">
                                        {activeUser ? `${activeUser.firstName || 'Profile'}` : 'Login / Register'}
                                    </span>
                                </div>
                                <svg className="w-3.5 h-3.5 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </Link>

                            {/* Left-Aligned Category Navigation Links */}
                            <nav className="flex flex-col space-y-4 text-left">
                                {NAV_LINKS.map((link) => {
                                    const isCurrentPath = link.href === '/' ? pathname === '/' : (pathname === link.href || pathname.startsWith(`${link.href}/`));
                                    const isWishlistAndActive = pathname === '/wishlist' && activeNavTab === link.href;
                                    const isActive = isCurrentPath || isWishlistAndActive;

                                    return (
                                        <Link
                                            key={link.name}
                                            href={link.href}
                                            className={clsx(
                                                "text-xs font-outfit font-bold uppercase tracking-widest transition-colors py-3 flex items-center justify-between border-b border-stone-50 hover:text-gold",
                                                isActive ? "text-gold" : "text-charcoal"
                                            )}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <span>{link.name}</span>
                                            <svg className={`w-3.5 h-3.5 transition-colors ${isActive ? 'text-gold' : 'text-stone-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
