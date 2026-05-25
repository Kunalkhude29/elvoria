'use client';

import { useState, useEffect, useRef } from 'react';
import ProductCard from './ProductCard';
import Navbar from './Navbar';
import Link from 'next/link';
import PageHero from './PageHero';
import { ChevronDown } from 'lucide-react';

// Module-level cache for category products to ensure instant filter/category switching
const _categoryProductCache: Record<string, any[]> = {};

interface CategoryPageClientProps {
    category: string;
    categoryName: string;
    initialProducts: any[];
    initialBanner: any | null;
}

export default function CategoryPageClient({ 
    category, 
    categoryName, 
    initialProducts, 
    initialBanner 
}: CategoryPageClientProps) {
    const [products, setProducts] = useState<any[]>(initialProducts);
    const [banner, setBanner] = useState<any>(initialBanner);
    const [visibleCount, setVisibleCount] = useState(12);
    const [isLoading, setIsLoading] = useState(false);
    const [sortBy, setSortBy] = useState('featured');
    const [isSortOpen, setIsSortOpen] = useState(false);
    const isMounted = useRef(true);
    const sortRef = useRef<HTMLDivElement>(null);

    const normalizedCategory = category.toLowerCase();

    useEffect(() => {
        isMounted.current = true;
        
        // If we have cached data for this specific category, use it to avoid fresh fetch
        if (_categoryProductCache[normalizedCategory]) {
            setProducts(_categoryProductCache[normalizedCategory]);
            return;
        }

        const fetchFreshData = async () => {
            setIsLoading(true);
            try {
                const prodRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/products`);
                if (prodRes.ok) {
                    const allProducts = await prodRes.json();
                    const filtered = allProducts.filter((p: any) => {
                        if (normalizedCategory === 'new-arrivals') return p.isNew;
                        if (normalizedCategory === 'collections' || normalizedCategory === 'shop') return true;

                        const pCat = p.category.toLowerCase();
                        return pCat === normalizedCategory.replace(/s$/, '') || pCat === normalizedCategory;
                    });
                    
                    _categoryProductCache[normalizedCategory] = filtered;
                    if (isMounted.current) setProducts(filtered);
                }
            } catch (error) {
                console.error("Background fetch failed:", error);
            } finally {
                if (isMounted.current) setIsLoading(false);
            }
        };

        // Only fetch if initialProducts is empty (safety fallback) or after initial render
        fetchFreshData();

        // Close sort dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
                setIsSortOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);

        return () => { 
            isMounted.current = false;
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [normalizedCategory]);

    const sortedProducts = [...products].sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return 0; // featured/default
    });

    const sortOptions = [
        { id: 'featured', label: 'Featured' },
        { id: 'newest', label: 'Newest' },
        { id: 'price-low', label: 'Price: Low to High' },
        { id: 'price-high', label: 'Price: High to Low' }
    ];

    return (
        <div className="min-h-screen pb-20 bg-background">
            <Navbar />
            
            {banner && (
                <PageHero 
                    title={banner.title || ''} 
                    subtitle={banner.subtitle}
                    backgroundImage={banner.image || banner.heroImage}
                    offerText={banner.offerText}
                    ctaText={banner.ctaText}
                    priority={true} // Priority loading for the top banner
                />
            )}

            {/* Breadcrumbs - Subtle Top Section */}
            <div className="main-container py-4">
                <nav className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.2em] text-charcoal/40 font-outfit font-bold">
                    <Link href="/" className="hover:text-gold transition-colors">Home</Link>
                    <span className="opacity-50">/</span>
                    <span className="text-charcoal/60">{categoryName}</span>
                </nav>
            </div>

            {/* Premium Category Header Bar */}
            <div className="w-full border-t border-b border-gray-100 bg-white">
                <div className="main-container flex items-center justify-between py-4 md:py-6">
                    {/* Left/Center Section - Category Name */}
                    <div className="flex-1">
                        <h1 className="text-sm md:text-lg font-outfit font-bold tracking-[0.3em] text-charcoal uppercase">
                            {categoryName}
                        </h1>
                    </div>

                    <div className="flex items-center">
                        {/* Sort By Dropdown */}
                        <div className="relative" ref={sortRef}>
                            <button 
                                onClick={() => setIsSortOpen(!isSortOpen)}
                                className="flex items-center space-x-2 text-[10px] md:text-xs uppercase tracking-[0.2em] text-charcoal font-bold hover:text-gold transition-colors"
                            >
                                <span className="hidden sm:inline">Sort By</span>
                                <span className="sm:hidden">Sort</span>
                                <ChevronDown size={14} className={`transition-transform duration-300 ${isSortOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isSortOpen && (
                                <div className="absolute right-0 mt-4 w-48 bg-white border border-gray-100 shadow-xl z-50 py-2">
                                    {sortOptions.map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => {
                                                setSortBy(option.id);
                                                setIsSortOpen(false);
                                            }}
                                            className={`w-full text-left px-6 py-2.5 text-[10px] uppercase tracking-widest font-bold transition-colors ${sortBy === option.id ? 'text-gold' : 'text-charcoal hover:bg-gray-50'}`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="main-container pt-4">
                {products.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                            {sortedProducts.slice(0, visibleCount).map((product: any) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        {products.length > visibleCount && (
                            <div className="mt-16 flex justify-center">
                                <button 
                                    onClick={() => setVisibleCount(prev => prev + 12)}
                                    className="px-10 py-3 rounded-full border border-charcoal/20 hover:border-charcoal transition-colors uppercase text-xs tracking-widest font-bold text-charcoal"
                                >
                                    Load More
                                </button>
                            </div>
                        )}
                    </>
                ) : !isLoading ? (
                    <div className="text-center py-20 text-charcoal/50">
                        No products found in this category.
                    </div>
                ) : (
                    <div className="text-center py-20 flex justify-center items-center flex-col gap-4">
                         <div className="w-8 h-8 border-2 border-beige border-t-gold rounded-full animate-spin"></div>
                         <p className="text-charcoal/40 text-sm tracking-widest">LOADING COLLECTION</p>
                    </div>
                )}
            </div>
        </div>
    );
}
