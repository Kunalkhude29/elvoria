'use client';

import { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import clsx from 'clsx';

const FILTERS = ['Trending', 'Rings', 'Necklaces', 'Bangles', 'Earrings', 'Anklets'];

export default function TrendingSection() {
    const [activeFilter, setActiveFilter] = useState('Trending');
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const fetchProducts = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products`);
                let ALL_PRODUCTS = await res.json();

                let filtered = ALL_PRODUCTS;

                if (activeFilter !== 'Trending') {
                    filtered = ALL_PRODUCTS.filter((p: any) =>
                        p.category?.toLowerCase() === activeFilter.toLowerCase() ||
                        p.category?.toLowerCase() + 's' === activeFilter.toLowerCase() // Handle singular/plural
                    );
                }

                setProducts(filtered);
            } catch (err) {
                console.error("Failed to fetch trending products", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProducts();
    }, [activeFilter]);

    return (
        <section className="container py-20 border-t border-gray-100">
            <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-serif text-charcoal mb-8">Trending Jewellery</h2>

                {/* Filter Pills */}
                <div className="flex flex-wrap justify-center gap-3 md:gap-4">
                    {FILTERS.map(filter => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={clsx(
                                "px-6 py-2 rounded-full text-sm uppercase tracking-wider transition-all duration-300 border",
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 animate-in fade-in zoom-in duration-500">
                        {products.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-charcoal/50 italic">No products found in this category.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
