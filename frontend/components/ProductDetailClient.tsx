'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Heart, ShoppingBag, Minus, Plus, Loader2, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { cloudinaryUrl, isCloudinaryUrl } from '@/lib/cloudinary';

export default function ProductDetailClient({ initialProduct }: { initialProduct: any }) {
    const [PRODUCT, setProduct] = useState<any>(initialProduct);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const { addToCart, cart, openCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const [isAdding, setIsAdding] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const pathname = usePathname();

    const [similarProducts, setSimilarProducts] = useState<any[]>([]);
    const carouselRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (carouselRef.current) {
            const { scrollLeft, clientWidth } = carouselRef.current;
            const scrollAmount = clientWidth;
            carouselRef.current.scrollTo({
                left: direction === 'left' ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    const toggleWishlistForProduct = (p: any) => {
        if (isInWishlist(p.id)) {
            removeFromWishlist(p.id);
        } else {
            addToWishlist({
                id: p.id,
                name: p.name,
                price: p.price,
                image: p.image,
                category: p.category || 'Jewellery'
            }, pathname);
            setToastMessage(`Added ${p.name} to wishlist`);
            setTimeout(() => setToastMessage(null), 3000);
        }
    };

    // Still fetch in background to ensure data is absolutely fresh, but UI is ready instantly
    useEffect(() => {
        const fetchFreshData = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/products/${initialProduct.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setProduct(data);
                }
            } catch (error) {
                console.error("Background fetch failed:", error);
            }
        };
        fetchFreshData();
    }, [initialProduct.id]);

    useEffect(() => {
        const fetchSimilarProducts = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/products`);
                if (res.ok) {
                    const allProducts = await res.json();
                    // Filter out current product
                    const otherProducts = allProducts.filter((p: any) => p.id !== PRODUCT.id);
                    
                    // Score function based on category, collection, and keywords
                    const getScore = (p: any) => {
                        let score = 0;
                        if (p.category && PRODUCT.category && p.category.toLowerCase() === PRODUCT.category.toLowerCase()) {
                            score += 5;
                        }
                        if (p.collection && PRODUCT.collection && p.collection.toLowerCase() === PRODUCT.collection.toLowerCase()) {
                            score += 3;
                        }
                        
                        const getWords = (str: string) => {
                            if (!str) return [];
                            return str.toLowerCase().split(/\s+/).filter(w => w.length > 2 && !['and', 'the', 'with', 'for', 'luxe', 'gold', 'silver', 'diamond', 'timeless'].includes(w));
                        };
                        const currentWords = getWords(PRODUCT.name);
                        const pWords = getWords(p.name);
                        const commonWords = currentWords.filter(w => pWords.includes(w));
                        score += commonWords.length * 2;

                        return score;
                    };

                    const scored = otherProducts.map((p: any) => ({
                        ...p,
                        score: getScore(p)
                    }));

                    let filtered = scored.filter((p: any) => p.score > 0);
                    if (filtered.length === 0) {
                        filtered = otherProducts.filter((p: any) => p.category?.toLowerCase() === PRODUCT.category?.toLowerCase());
                    }
                    if (filtered.length === 0) {
                        filtered = otherProducts;
                    }

                    filtered.sort((a: any, b: any) => b.score - a.score);
                    setSimilarProducts(filtered.slice(0, 10));
                }
            } catch (error) {
                console.error("Failed to fetch similar products:", error);
            }
        };

        if (PRODUCT.id) {
            fetchSimilarProducts();
        }
    }, [PRODUCT.id, PRODUCT.category, PRODUCT.collection, PRODUCT.name]);

    const isInCart = cart.some(item => item.id === PRODUCT.id);
    const isWished = isInWishlist(PRODUCT.id);

    const handleAddToCart = async () => {
        setIsAdding(true);
        try {
            await addToCart({
                id: PRODUCT.id,
                name: PRODUCT.name,
                price: PRODUCT.price,
                image: PRODUCT.image,
                category: PRODUCT.category,
                stock: PRODUCT.stock ?? 10,
                quantity: quantity
            });
            openCart();
        } catch (error) {
            console.error(error);
        } finally {
            setIsAdding(false);
        }
    };

    const toggleWishlist = () => {
        if (isWished) {
            removeFromWishlist(PRODUCT.id);
        } else {
            addToWishlist({
                id: PRODUCT.id,
                name: PRODUCT.name,
                price: PRODUCT.price,
                image: PRODUCT.image,
                category: PRODUCT.category || 'Jewellery'
            }, pathname);
            setToastMessage('Added to wishlist');
            setTimeout(() => setToastMessage(null), 3000);
        }
    };

    // Ensure the primary image (PRODUCT.image) is displayed first if it exists
    let displayImages: string[] = [];
    if (PRODUCT.images && Array.isArray(PRODUCT.images)) {
        if (PRODUCT.image) {
            const others = PRODUCT.images.filter((img: string) => img !== PRODUCT.image);
            displayImages = [PRODUCT.image, ...others];
        } else {
            displayImages = PRODUCT.images;
        }
    } else if (PRODUCT.image) {
        displayImages = [PRODUCT.image];
    }

    const isOutOfStock = PRODUCT.stock === 0;

    return (
        <div className="min-h-screen pb-20 bg-ivory">
            <Navbar />
            
            <div className="main-container pt-8">
                {/* Breadcrumbs */}
                <nav className="flex items-center space-x-2 text-[10px] uppercase tracking-[0.2em] text-charcoal/40 font-outfit font-semibold mb-10">
                    <Link href="/" className="hover:text-gold transition-colors font-medium">Home</Link>
                    <span className="text-[10px] opacity-50">&gt;</span>
                    <Link href="/shop" className="hover:text-gold transition-colors font-medium">Shop</Link>
                    <span className="text-[10px] opacity-50">&gt;</span>
                    <span className="text-charcoal/60">{PRODUCT.name}</span>
                </nav>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">

                {/* Image Gallery */}
                <div className="space-y-4">
                    <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden rounded-sm">
                        {displayImages.length > 0 ? (
                            <>
                                {console.log(`[ProductDetailPage] product ID ${PRODUCT.id} main image URL:`, cloudinaryUrl(displayImages[selectedImage]))}
                                <Image
                                    src={cloudinaryUrl(displayImages[selectedImage])}
                                    alt={PRODUCT.name}
                                    fill
                                    priority // High priority for the main product image
                                    unoptimized={!isCloudinaryUrl(displayImages[selectedImage])}
                                    className="object-cover"
                                />
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-charcoal/40 bg-gray-200 uppercase tracking-widest text-sm font-medium">
                                No Image Available
                            </div>
                        )}
                    </div>
                    {displayImages.length > 1 && (
                        <div className="flex space-x-4 overflow-x-auto pb-2">
                            {displayImages.map((img: any, idx: any) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`relative w-24 h-24 flex-shrink-0 border-2 ${selectedImage === idx ? 'border-charcoal' : 'border-transparent'}`}
                                >
                                    <Image 
                                        src={cloudinaryUrl(img)} 
                                        alt={`${PRODUCT.name} view ${idx + 1}`} 
                                        fill 
                                        loading="lazy" // Lazy load thumbnails
                                        unoptimized={!isCloudinaryUrl(img)} 
                                        className="object-cover" 
                                    />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="space-y-8">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-outfit text-charcoal mb-2">{PRODUCT.name}</h1>
                        <p className="text-xl font-outfit font-bold text-gold">₹{Number(PRODUCT.price).toFixed(2)}</p>
                    </div>

                    <div className="prose text-charcoal/80 font-outfit">
                        <p>{PRODUCT.description || 'Elegant and timeless, this beautiful piece is crafted with exquisite attention to detail. Perfect for everyday wear or special occasions.'}</p>
                    </div>

                    {/* Actions */}
                    <div className="space-y-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center space-x-4">
                            <span className="text-sm font-outfit font-semibold font-bold uppercase tracking-widest text-charcoal">Quantity</span>
                            <div className="flex items-center border border-gray-300">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-gray-100" disabled={isOutOfStock}><Minus className="w-4 h-4" /></button>
                                <span className="w-12 text-center text-charcoal font-outfit font-semibold font-bold">{isOutOfStock ? 0 : quantity}</span>
                                <button
                                    onClick={() => setQuantity(Math.min(PRODUCT.stock, quantity + 1))}
                                    className={`p-2 transition-colors ${quantity >= PRODUCT.stock || isOutOfStock ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-100'}`}
                                    disabled={quantity >= PRODUCT.stock || isOutOfStock}
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex space-x-4">
                            <button
                                onClick={handleAddToCart}
                                disabled={isAdding || isOutOfStock}
                                className={`flex-1 btn-primary flex items-center justify-center space-x-2 transition-all duration-300 ${isAdding || isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isAdding ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span>Adding...</span>
                                    </>
                                ) : isOutOfStock ? (
                                    <>
                                        <span>Out of Stock</span>
                                    </>
                                ) : (
                                    <>
                                        <ShoppingBag className="w-5 h-5" />
                                        <span>Add to Cart</span>
                                    </>
                                )}
                            </button>
                            <button
                                onClick={toggleWishlist}
                                className={`p-3 border border-gray-300 rounded-none transition-colors ${isWished ? 'bg-gold border-gold text-white' : 'hover:bg-gray-50 hover:border-charcoal text-charcoal'}`}
                            >
                                <Heart className="w-6 h-6" fill={isWished ? 'currentColor' : 'none'} />
                            </button>
                        </div>
                    </div>

                    {/* Addl Info */}
                    <div className="space-y-4 pt-8 text-sm text-charcoal/60 font-outfit">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>In stock and ready to ship</span>
                        </div>
                        <p>Free shipping on orders over ₹150.</p>
                    </div>
                </div>
                </div>
            </div>

            {/* Similar Products Section */}
            {similarProducts.length > 0 && (
                <section className="w-full py-16 md:py-24 border-t border-gray-100 bg-white mt-16 md:mt-24">
                    <div className="main-container relative">
                        <div className="flex items-center justify-between mb-8 md:mb-12">
                            <h2 className="text-xl md:text-2xl font-outfit uppercase tracking-[0.05em] md:tracking-[0.1em] text-charcoal">
                                Similar Products
                            </h2>
                            {/* Navigation Arrows for Desktop */}
                            <div className="hidden md:flex items-center space-x-2">
                                <button
                                    onClick={() => scroll('left')}
                                    className="p-2 border border-gray-200 hover:border-charcoal hover:bg-gray-50 text-charcoal transition-colors rounded-full"
                                    aria-label="Scroll left"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => scroll('right')}
                                    className="p-2 border border-gray-200 hover:border-charcoal hover:bg-gray-50 text-charcoal transition-colors rounded-full"
                                    aria-label="Scroll right"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Carousel Wrapper */}
                        <div
                            ref={carouselRef}
                            className="flex overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory gap-4 md:gap-6 pb-4"
                        >
                            {similarProducts.map((p: any) => (
                                <Link
                                    key={p.id}
                                    href={`/product/${p.id}`}
                                    className="group relative w-[calc(50%-8px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] flex-shrink-0 snap-start bg-white border border-gray-50 rounded-[10px] p-3 flex flex-col transition-all duration-300 hover:shadow-md"
                                >
                                    {/* Product Image Container */}
                                    <div className="relative aspect-square w-full mb-4 overflow-hidden rounded-md bg-stone-50/50 flex items-center justify-center">
                                        {p.image ? (
                                            <Image
                                                src={cloudinaryUrl(p.image)}
                                                alt={p.name}
                                                fill
                                                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                                                unoptimized={!isCloudinaryUrl(p.image)}
                                            />
                                        ) : (
                                            <span className="text-xs text-charcoal/40">NO IMAGE</span>
                                        )}

                                        {/* Wishlist Button on Top-Right */}
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                toggleWishlistForProduct(p);
                                            }}
                                            className="absolute top-2.5 right-2.5 p-2 bg-white/80 hover:bg-white rounded-full shadow-sm text-charcoal hover:text-gold transition-colors z-10"
                                            aria-label="Add to Wishlist"
                                        >
                                            <Heart
                                                className="w-3.5 h-3.5"
                                                fill={isInWishlist(p.id) ? 'currentColor' : 'none'}
                                            />
                                        </button>
                                    </div>

                                    {/* Product Meta */}
                                    <div className="flex flex-col flex-1">
                                        <span className="text-[10px] text-charcoal/50 uppercase tracking-widest mb-1 font-semibold font-outfit">
                                            {p.category}
                                        </span>
                                        <h3 className="text-sm font-outfit font-medium text-charcoal group-hover:text-gold transition-colors truncate mb-1">
                                            {p.name}
                                        </h3>
                                        <span className="text-sm font-outfit font-bold text-charcoal mt-auto">
                                            ₹{Number(p.price).toFixed(2)}
                                        </span>

                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Toast Notification */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-charcoal text-white px-6 py-4 shadow-xl z-50 flex items-center space-x-3"
                    >
                        <CheckCircle className="w-5 h-5 text-gold" />
                        <span className="font-medium tracking-wide">{toastMessage}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
