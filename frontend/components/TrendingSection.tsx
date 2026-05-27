'use client';

import { useState, useEffect, useRef } from 'react';
import ProductCard from './ProductCard';
import Link from 'next/link';
import clsx from 'clsx';

const FILTERS = ['Trending', 'Rings', 'Necklaces', 'Bangles', 'Earrings', 'Mangalsutras'];

// Module-level cache — survives filter switches, cleared on page reload
let _cachedAllProducts: any[] | null = null;

export default function TrendingSection() {
    const [activeFilter, setActiveFilter] = useState('Trending');
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const isMounted = useRef(true);

    // Fetch ALL products once, cache in memory, filter client-side
    useEffect(() => {
        isMounted.current = true;

        const loadProducts = async () => {
            setIsLoading(true);
            try {
                // Use memory cache if already loaded
                if (!_cachedAllProducts) {
                    const res = await fetch(
                        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/products`,
                        { next: { revalidate: 60 } } as RequestInit // hint for future SSR upgrade
                    );
                    if (!res.ok) throw new Error('Failed to fetch products');
                    _cachedAllProducts = await res.json();
                }

                if (!isMounted.current) return;

                const filter = activeFilter;
                const filtered =
                    filter === 'Trending'
                        ? _cachedAllProducts!
                        : _cachedAllProducts!.filter(
                              (p: any) =>
                                  p.category?.toLowerCase() === filter.toLowerCase() ||
                                  p.category?.toLowerCase() + 's' === filter.toLowerCase()
                          );

                setProducts(filtered);
            } catch (err) {
                console.warn('Failed to fetch trending products', err);
            } finally {
                if (isMounted.current) setIsLoading(false);
            }
        };

        loadProducts();

        return () => {
            isMounted.current = false;
        };
    }, [activeFilter]);

    return (
        <section className="w-full pt-6 md:pt-10 pb-8 md:pb-12 border-t border-gray-100">
            <div className="main-container">
                <div className="flex flex-col items-center mb-4 md:mb-6">
                    <h2 className="text-xl md:text-2xl font-outfit text-black uppercase tracking-[0.05em] md:tracking-[0.1em] font-medium text-center">
                        TRENDING JEWELLERY
                    </h2>
                </div>

                {/* Sticky Filter Bar - Palmonas Style */}
                <div className="sticky top-[65px] z-30 bg-white py-3 border-b border-gray-100 -mx-4 px-4 w-[calc(100%+2rem)] md:mx-0 md:px-0 md:w-full mb-8 md:mb-10 flex justify-center">
                    <div className="flex overflow-x-auto no-scrollbar scroll-smooth gap-2 md:flex-wrap md:justify-center md:gap-4 w-full md:w-auto">
                        {FILTERS.map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={clsx(
                                    "transition-all duration-300 border flex-shrink-0 text-center uppercase cursor-pointer",
                                    // Mobile style (rectangular, text-[11px], rounded-none, bold tracking)
                                    "px-4 py-2.5 rounded-none text-[11px] font-outfit tracking-widest font-bold",
                                    // Desktop style (pill, text-sm, rounded-full)
                                    "md:px-6 md:py-2 md:rounded-full md:text-sm md:font-semibold md:tracking-wider",
                                    activeFilter === filter
                                        ? "bg-charcoal text-white border-charcoal"
                                        : "bg-white text-charcoal border-gray-200 hover:border-gold hover:text-gold"
                                )}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="min-h-[400px]">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            {/* Simple Spinner */}
                            <div className="w-8 h-8 border-2 border-beige border-t-gold rounded-full animate-spin"></div>
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 animate-in fade-in zoom-in duration-500">
                            {products.slice(0, 8).map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-charcoal/50 font-outfit italic">No products found in this category.</p>
                        </div>
                    )}

                    {products.length > 8 && (
                        <div className="mt-16 flex justify-center">
                            <Link 
                                href={activeFilter === 'Trending' ? '/shop' : `/${activeFilter.toLowerCase()}`}
                                className="px-10 py-3 rounded-none border border-charcoal/20 hover:border-charcoal transition-colors uppercase text-xs tracking-widest font-bold text-charcoal inline-block"
                            >
                                View All
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
