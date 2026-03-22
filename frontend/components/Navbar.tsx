'use client';

import Link from 'next/link';
import { Search, Heart, ShoppingBag, User, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useSearch } from '../context/SearchContext'; export default function Navbar() {
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
                    'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
                    isScrolled ? 'bg-ivory/90 backdrop-blur-md py-4 border-stone-200 shadow-sm' : 'bg-ivory py-6 border-stone-100'
                )}
            >
                <div className="container mx-auto px-6 flex items-center justify-between relative">
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
                                            "text-sm font-medium uppercase tracking-widest transition-colors duration-300 group relative",
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
                        <Link href="/" className="text-3xl lg:text-4xl font-serif tracking-widest font-bold text-charcoal">
                            ELVORIA
                        </Link>
                    </div>

                    {/* Right Section: Icons */}
                    <div className="flex items-center space-x-4 lg:space-x-6">
                        <button onClick={openSearch} className="hover:text-gold transition-all duration-300 hover:scale-105 text-charcoal">
                            <Search className="w-[18px] h-[18px]" />
                        </button>
                        <Link href="/wishlist" className="hover:text-gold transition-all duration-300 hover:scale-105 text-charcoal hidden sm:block relative">
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
                        <Link href="/login" className="hover:text-gold transition-all duration-300 hover:scale-105 text-charcoal hidden sm:block">
                            <User className="w-[18px] h-[18px]" />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: -100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        className="fixed inset-0 z-[60] bg-white h-screen w-full flex flex-col p-6"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <span className="text-2xl font-serif font-bold">Menu</span>
                            <button onClick={() => setIsMobileMenuOpen(false)}>
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <nav className="flex flex-col space-y-6 text-center">
                            {NAV_LINKS.map((link) => {
                                const isCurrentPath = link.href === '/' ? pathname === '/' : (pathname === link.href || pathname.startsWith(`${link.href}/`));
                                const isWishlistAndActive = pathname === '/wishlist' && activeNavTab === link.href;
                                const isActive = isCurrentPath || isWishlistAndActive;

                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={clsx(
                                            "text-lg uppercase tracking-wider transition-colors",
                                            isActive ? "text-gold font-medium" : "text-charcoal hover:text-gold"
                                        )}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {link.name}
                                        {isActive && (
                                            <div className="mx-auto mt-1 w-12 h-[1px] bg-gold transition-all"></div>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
