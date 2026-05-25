'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearch } from '../context/SearchContext';
import Image from 'next/image';
import Link from 'next/link';

export default function SearchOverlay() {
    const { isSearchOpen, closeSearch } = useSearch();
    const [query, setQuery] = useState('');
    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [allCategories, setAllCategories] = useState<any[]>([]);
    const [allCollections, setAllCollections] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    // Fetch live products, categories, and collections from actual database on mount/open
    useEffect(() => {
        if (isSearchOpen) {
            setIsLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
            
            Promise.all([
                fetch(`${apiUrl}/api/products`).then(res => res.ok ? res.json() : []),
                fetch(`${apiUrl}/api/categories`).then(res => res.ok ? res.json() : []),
                fetch(`${apiUrl}/api/collections`).then(res => res.ok ? res.json() : [])
            ])
            .then(([products, categories, collections]) => {
                setAllProducts(Array.isArray(products) ? products : []);
                setAllCategories(Array.isArray(categories) ? categories : []);
                setAllCollections(Array.isArray(collections) ? collections : []);
                setIsLoading(false);
            })
            .catch(err => {
                console.error("Live Database Search Fetch Error:", err);
                setIsLoading(false);
            });
        }
    }, [isSearchOpen]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query)}`);
            closeSearch();
            setQuery('');
        }
    };

    const handleProductClick = () => {
        closeSearch();
        setQuery('');
    };

    const handleQueryClick = (term: string) => {
        setQuery(term);
    };

    // 1. DYNAMIC PRODUCTS FILTERING (Only real matching products from DB)
    const filteredProducts = query.trim()
        ? allProducts.filter(p => 
            p.name.toLowerCase().includes(query.toLowerCase()) || 
            (p.category?.name || p.category || '').toString().toLowerCase().includes(query.toLowerCase()) ||
            (p.collection?.name || p.collection || '').toString().toLowerCase().includes(query.toLowerCase())
          )
        : allProducts.slice(0, 3); // Empty search: show first 3 real products from DB as popular items

    // 2. DYNAMIC TOP SEARCH QUERIES GENERATION
    let dynamicQueries: string[] = [];

    if (query.trim() === '') {
        // Empty search: Compute actual popular categories and collections based on product counts in DB
        const popularCats = allCategories
            .map(cat => {
                const count = allProducts.filter(p => 
                    p.categoryId === cat.id || 
                    (p.category && (p.category.name === cat.name || p.category === cat.name))
                ).length;
                return { name: cat.name, count };
            })
            .sort((a, b) => b.count - a.count);

        const popularCols = allCollections
            .map(col => {
                const count = allProducts.filter(p => 
                    p.collectionId === col.id || 
                    (p.collection && (p.collection.name === col.name || p.collection === col.name))
                ).length;
                return { name: col.name, count };
            })
            .sort((a, b) => b.count - a.count);

        // Combine and take top 5 real categories and collections
        dynamicQueries = Array.from(new Set([
            ...popularCats.map(c => c.name),
            ...popularCols.map(c => c.name)
        ])).slice(0, 5);
    } else {
        // Active search: Filter actual matching categories, collections, and specific products from database
        const matchingCats = allCategories
            .filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
            .map(c => c.name);

        const matchingCols = allCollections
            .filter(c => c.name.toLowerCase().includes(query.toLowerCase()))
            .map(c => c.name);

        const matchingProdNames = allProducts
            .filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
            .map(p => p.name)
            .slice(0, 2); // Top 2 specific matching products

        dynamicQueries = Array.from(new Set([
            ...matchingCats,
            ...matchingCols,
            ...matchingProdNames
        ])).slice(0, 5);
    }

    return (
        <AnimatePresence>
            {isSearchOpen && (
                <>
                    {/* Light Dismissible Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeSearch}
                        className="fixed inset-0 z-40 bg-black/15 backdrop-blur-[0.5px]"
                    />

                    {/* Compact Floating Search Dropdown Box (The Souled Store Style) */}
                    <motion.div
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="fixed z-50 bg-white rounded-2xl border border-stone-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-4 flex flex-col gap-3.5
                                   top-3 left-3 right-3 
                                   md:top-[16px] md:left-auto md:right-16 lg:right-28 md:w-[350px] lg:w-[360px]"
                    >
                        {/* Compact Search Bar with Rounded Elegant Border */}
                        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                            <Search className="w-4 h-4 text-stone-400 absolute left-3.5" />
                            <input
                                type="text"
                                placeholder="What are you looking for?"
                                className="w-full pl-9 pr-9 py-2 rounded-full border border-stone-200 focus:border-gold outline-none font-outfit text-xs text-charcoal bg-stone-50/50 focus:bg-white transition-all shadow-inner"
                                autoFocus
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <button 
                                type="button"
                                onClick={closeSearch}
                                className="p-1 hover:bg-stone-100 rounded-full transition-colors absolute right-2.5 text-stone-400 hover:text-charcoal"
                                aria-label="Close search"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </form>

                        {/* Search Dropdown Widget */}
                        <div className="bg-white border border-stone-50 rounded-xl overflow-hidden flex flex-col gap-3">
                            
                            {/* 1. POPULAR PRODUCTS HEADER */}
                            <div className="flex flex-col gap-1.5">
                                <div className="bg-stone-50/80 px-3 py-1 border-b border-stone-100 text-left rounded-t-md">
                                    <span className="text-[10px] font-outfit font-bold uppercase tracking-wider text-stone-400">
                                        {query.trim() === '' ? 'Featured Products' : 'Popular Products'}
                                    </span>
                                </div>

                                {/* Products List */}
                                <div className="max-h-[160px] overflow-y-auto no-scrollbar divide-y divide-stone-100/60 px-1">
                                    {isLoading ? (
                                        <div className="py-3 text-center text-[10px] font-outfit text-stone-400 italic">Searching database...</div>
                                    ) : filteredProducts.length === 0 ? (
                                        <div className="py-3 text-center text-[10px] font-outfit text-stone-400 italic font-medium">No products found for "{query}"</div>
                                    ) : (
                                        filteredProducts.slice(0, 3).map((product) => (
                                            <Link 
                                                key={product.id} 
                                                href={`/product/${product.id}`}
                                                onClick={handleProductClick}
                                                className="flex items-center gap-3 py-2 hover:bg-stone-50/80 px-1.5 rounded-md transition-colors"
                                            >
                                                <div className="relative w-8 h-8 bg-stone-50 flex-shrink-0 rounded-md overflow-hidden border border-stone-100">
                                                    <Image 
                                                        src={Array.isArray(product.images) ? product.images[0] : (product.image || '/images/placeholder.png')} 
                                                        alt={product.name} 
                                                        fill 
                                                        className="object-cover" 
                                                        unoptimized 
                                                    />
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <p className="text-[11px] font-outfit font-semibold text-charcoal truncate max-w-[210px]">{product.name}</p>
                                                    <p className="text-[10px] font-outfit text-stone-400 font-bold">₹{Number(product.price).toFixed(2)}</p>
                                                </div>
                                            </Link>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* 2. TOP SEARCH QUERIES HEADER */}
                            <div className="flex flex-col gap-1.5">
                                <div className="bg-stone-50/80 px-3 py-1 border-t border-b border-stone-100 text-left">
                                    <span className="text-[10px] font-outfit font-bold uppercase tracking-wider text-stone-400">
                                        {query.trim() === '' ? 'Popular Categories & Collections' : 'Top Search Queries'}
                                    </span>
                                </div>

                                {/* Clickable Quick Suggestions from real database data only */}
                                <div className="flex flex-col divide-y divide-stone-50 px-1">
                                    {isLoading ? (
                                        <div className="py-2.5 text-center text-[10px] font-outfit text-stone-400 italic">Loading queries...</div>
                                    ) : dynamicQueries.length === 0 ? (
                                        <div className="py-2.5 text-center text-[10px] font-outfit text-stone-400 italic">No matches in categories or collections</div>
                                    ) : (
                                        dynamicQueries.map((term) => (
                                            <button
                                                key={term}
                                                type="button"
                                                onClick={() => handleQueryClick(term)}
                                                className="flex items-center justify-between py-2 px-2 hover:bg-stone-50/80 rounded-md text-left transition-colors group"
                                            >
                                                <span className="text-[11px] font-outfit font-medium text-charcoal group-hover:text-gold transition-colors">{term}</span>
                                                {/* Trending Chart Upward Icon */}
                                                <svg className="w-3 h-3 text-stone-400 group-hover:text-gold transform group-hover:scale-110 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                </svg>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>

                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
