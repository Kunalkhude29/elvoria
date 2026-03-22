'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '../../components/ProductCard';
import Navbar from '../../components/Navbar';
import { Search } from 'lucide-react';
import Link from 'next/link';

function SearchResults() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products`);
                if (res.ok) {
                    const data = await res.json();
                    setProducts(data);
                }
            } catch (err) {
                console.error("Failed to fetch products for search", err);
            }
        };
        fetchProducts();
    }, []);

    // Filter results based on query
    const lowerQuery = query.toLowerCase();
    const results = products.filter(product =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.category?.toLowerCase().includes(lowerQuery)
    );

    return (
        <main className="min-h-screen pt-32 pb-24 bg-ivory">
            <div className="container mx-auto px-6">

                {/* Header */}
                <div className="mb-12 border-b border-gray-200 pb-8 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <Link href="/" className="text-xs font-medium uppercase tracking-widest text-charcoal/50 hover:text-charcoal transition-colors mb-4 inline-block">
                            ← Back to Home
                        </Link>
                        <h1 className="text-3xl md:text-5xl font-serif text-charcoal">
                            Search Results
                        </h1>
                    </div>
                    {query && (
                        <p className="text-charcoal/60 text-lg">
                            Results for "<span className="text-charcoal font-medium">{query}</span>"
                            <span className="text-sm ml-3 uppercase tracking-widest text-charcoal/40">({results.length})</span>
                        </p>
                    )}
                </div>

                {/* Results Grid */}
                {!query ? (
                    <div className="text-center py-20">
                        <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <h2 className="text-2xl font-serif text-charcoal mb-2">What are you looking for?</h2>
                        <p className="text-charcoal/60">Type a keyword in the search bar to explore our collection.</p>
                    </div>
                ) : results.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {results.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-24 bg-white/50 border border-gray-100 rounded-lg">
                        <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <h2 className="text-2xl font-serif text-charcoal mb-2">No results found</h2>
                        <p className="text-charcoal/60 max-w-md mx-auto mb-8">
                            We couldn't find any products matching "{query}". Try checking your spelling or use more general terms like "Rings" or "Gold".
                        </p>
                        <Link
                            href="/shop"
                            className="inline-block px-8 py-3 bg-charcoal text-white text-sm uppercase tracking-widest font-medium hover:bg-gold transition-colors"
                        >
                            View All Products
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}

export default function SearchPage() {
    return (
        <>
            <Navbar />
            <Suspense fallback={<div className="min-h-screen bg-ivory flex items-center justify-center pt-20"><div className="w-8 h-8 border-2 border-beige border-t-gold rounded-full animate-spin"></div></div>}>
                <SearchResults />
            </Suspense>
        </>
    );
}
