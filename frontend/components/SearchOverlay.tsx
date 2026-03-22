'use client';

import { useSearch } from '../context/SearchContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

const SUGGESTED_TERMS = ['Rings', 'Necklaces', 'Earrings', 'Diamond', 'Gold', 'Wedding'];

export default function SearchOverlay() {
    const { isSearchOpen, closeSearch } = useSearch();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [allProducts, setAllProducts] = useState<any[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Prevent scrolling when drawer is open
    useEffect(() => {
        if (isSearchOpen) {
            document.body.style.overflow = 'hidden';
            // Auto focus input
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);

            // Fetch live products for search
            const fetchLiveProducts = async () => {
                try {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products`);
                    if (res.ok) {
                        setAllProducts(await res.json());
                    }
                } catch (e) {
                    console.error('Failed to fetch products for search overlay', e);
                }
            };
            fetchLiveProducts();

        } else {
            document.body.style.overflow = 'unset';
            setQuery(''); // Clear on close
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isSearchOpen]);

    // Live filtering with debounce
    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const timer = setTimeout(() => {
            const lowerQuery = query.toLowerCase();
            const filtered = allProducts.filter(product =>
                product.name.toLowerCase().includes(lowerQuery) ||
                product.category?.toLowerCase().includes(lowerQuery)
            ).slice(0, 6); // Max 6 results

            setResults(filtered);
        }, 300);

        return () => clearTimeout(timer);
    }, [query, allProducts]);

    const handleSearchSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (query.trim()) {
            closeSearch();
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    const handleProductClick = () => {
        closeSearch();
    };

    return (
        <AnimatePresence>
            {isSearchOpen && (
                <div className="fixed inset-0 z-[100] flex flex-col">
                    {/* Background Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 bg-ivory/80 backdrop-blur-md"
                        onClick={closeSearch}
                    />

                    {/* Modal Window */}
                    <div className="absolute inset-x-0 inset-y-0 md:inset-x-auto md:inset-y-auto md:top-24 md:left-1/2 md:-translate-x-1/2 w-full md:w-[700px] lg:w-[800px] flex justify-center">
                        <motion.div
                            initial={{ y: -50, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: -50, opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white text-charcoal w-full h-full md:h-auto md:max-h-[80vh] md:rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.08)] flex flex-col overflow-hidden border border-stone-200"
                        >
                            {/* Search Header Row */}
                            <div className="px-8 py-6 border-b border-stone-100 flex flex-col relative top-0 z-10 bg-white">
                                <form onSubmit={handleSearchSubmit} className="flex items-center relative w-full">
                                    <Search className="w-5 h-5 text-charcoal/40 absolute left-4" />
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Search for products..."
                                        className="w-full text-lg font-serif text-charcoal bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-stone-300 focus:ring-4 focus:ring-stone-50 transition-all pl-12 pr-12 py-3 placeholder:text-charcoal/30 shadow-sm"
                                    />
                                    <div className="absolute right-3 flex items-center gap-2">
                                        {query && (
                                            <button
                                                type="button"
                                                onClick={() => setQuery('')}
                                                className="p-1.5 text-charcoal/40 hover:text-charcoal bg-stone-100/50 hover:bg-stone-100 rounded-full transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>

                            {/* Content Area */}
                            <div className="flex-1 overflow-y-auto flex flex-col sm:flex-row min-h-[400px]">
                                {/* Suggestions (Left Column) */}
                                <div className="w-full sm:w-1/3 p-8 sm:border-r border-stone-100 flex-shrink-0 bg-stone-50/30">
                                    <h3 className="text-[10px] font-semibold tracking-widest uppercase text-charcoal/40 mb-5">Suggestions</h3>
                                    <ul className="space-y-4">
                                        {SUGGESTED_TERMS.map((term, index) => (
                                            <li key={index}>
                                                <button
                                                    onClick={() => { setQuery(term); }}
                                                    className="text-sm font-medium text-charcoal/80 hover:text-gold transition-colors flex items-center group w-full text-left"
                                                >
                                                    {term}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Results (Right Column) */}
                                <div className="w-full sm:w-2/3 p-8 pb-24 sm:pb-8 relative flex flex-col bg-white">
                                    <h3 className="text-[10px] font-semibold tracking-widest uppercase text-charcoal/40 mb-5">
                                        {query ? `Products` : 'Popular Right Now'}
                                    </h3>

                                    {!query ? (
                                        <p className="text-charcoal/40 text-sm font-serif italic">Type to start searching...</p>
                                    ) : results.length > 0 ? (
                                        <div className="space-y-3">
                                            {results.map(product => (
                                                <Link
                                                    key={product.id}
                                                    href={`/product/${product.id}`}
                                                    onClick={handleProductClick}
                                                    className="flex items-center gap-4 group rounded-xl transition-all duration-300 hover:bg-stone-50 py-2 -mx-3 px-3 border border-transparent hover:border-stone-100"
                                                >
                                                    <div className="relative w-14 h-16 bg-stone-100 flex-shrink-0 overflow-hidden rounded-md border border-stone-200/50">
                                                        {product.image ? (
                                                            <Image
                                                                src={product.image}
                                                                alt={product.name}
                                                                fill
                                                                className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                                                unoptimized
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[10px] text-charcoal/30 bg-stone-100 uppercase tracking-widest font-medium">
                                                                No Image
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-medium text-charcoal group-hover:text-gold transition-colors truncate">
                                                            {product.name}
                                                        </h4>
                                                        <div className="flex items-center gap-2 mt-1 text-xs">
                                                            {product.isSale ? (
                                                                <>
                                                                    <span className="font-semibold text-charcoal">${Number(product.price).toFixed(2)}</span>
                                                                    <span className="text-charcoal/40 line-through">${(Number(product.price) * 1.2).toFixed(2)}</span>
                                                                </>
                                                            ) : (
                                                                <span className="font-semibold text-charcoal">${Number(product.price).toFixed(2)}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center text-charcoal/40 text-sm">
                                            No products found matching "{query}"
                                        </div>
                                    )}

                                    {/* Bottom Sticky Action inside right column */}
                                    {query && results.length > 0 && (
                                        <div className="absolute bottom-6 left-8 right-8 pt-4 bg-white border-t border-stone-100 mt-4">
                                            <button
                                                onClick={() => handleSearchSubmit()}
                                                className="w-full flex items-center justify-between text-left text-sm font-medium text-charcoal hover:text-gold transition-colors group px-2 py-1"
                                            >
                                                <span>Search for "{query}"</span>
                                                <ArrowRight className="w-4 h-4 text-charcoal/30 group-hover:text-gold group-hover:translate-x-1 transition-all" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Mobile Modal Close Button (Floating) */}
                            <button
                                onClick={closeSearch}
                                className="absolute top-6 right-6 p-2 bg-white rounded-full shadow-sm border border-stone-100 text-charcoal/50 hover:text-charcoal hover:bg-stone-50 transition-all z-20 md:hidden"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </motion.div>

                        {/* Desktop External Close Button */}
                        <button
                            onClick={closeSearch}
                            className="absolute top-4 right-4 md:right-8 p-3 text-charcoal/60 hover:text-charcoal hover:bg-white/50 rounded-full transition-all hidden md:flex"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
}

// Inline Icon to avoid circular dependency
function ArrowRight(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
        </svg>
    )
}
