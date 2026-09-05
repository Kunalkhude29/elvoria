'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Heart, ShoppingBag, Minus, Plus, Loader2, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './Navbar';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { cloudinaryUrl, isCloudinaryUrl } from '@/lib/cloudinary';
import ProductCard from './ProductCard';
import CustomerReviews from './CustomerReviews';

export default function ProductDetailClient({ initialProduct }: { initialProduct: any }) {
    const [PRODUCT, setProduct] = useState<any>(initialProduct);
    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const { addToCart, cart, openCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const [isAdding, setIsAdding] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const pathname = usePathname();
    const router = useRouter();

    const [similarProducts, setSimilarProducts] = useState<any[]>([]);
    const carouselRef = useRef<HTMLDivElement>(null);

    // EDD States
    const [deliveryPincode, setDeliveryPincode] = useState('');
    const [isCheckingPincode, setIsCheckingPincode] = useState(false);
    const [deliveryEstimate, setDeliveryEstimate] = useState<any>(null);

    const handleCheckPincode = async () => {
        if (!deliveryPincode || deliveryPincode.length !== 6) return;
        setIsCheckingPincode(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/shipping/serviceability?pincode=${deliveryPincode}`);
            if (res.ok) {
                const data = await res.json();
                setDeliveryEstimate(data);
            } else {
                setDeliveryEstimate({ serviceable: false });
            }
        } catch (error) {
            console.error('Pincode check error:', error);
            setDeliveryEstimate({ serviceable: false });
        } finally {
            setIsCheckingPincode(false);
        }
    };

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
                    <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden rounded-sm touch-pan-y">
                        {displayImages.length > 0 ? (
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedImage}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    drag="x"
                                    dragConstraints={{ left: 0, right: 0 }}
                                    dragElastic={0.2}
                                    onDragEnd={(e, { offset, velocity }) => {
                                        const swipeDistance = offset.x;
                                        const swipeVelocity = velocity.x;
                                        
                                        if (swipeDistance < -50 || swipeVelocity < -500) {
                                            if (displayImages.length > 1) {
                                                setSelectedImage(prev => (prev === displayImages.length - 1 ? 0 : prev + 1));
                                            }
                                        } else if (swipeDistance > 50 || swipeVelocity > 500) {
                                            if (displayImages.length > 1) {
                                                setSelectedImage(prev => (prev === 0 ? displayImages.length - 1 : prev - 1));
                                            }
                                        }
                                    }}
                                    className="absolute inset-0 cursor-grab active:cursor-grabbing"
                                >
                                    <Image
                                        src={cloudinaryUrl(displayImages[selectedImage])}
                                        alt={PRODUCT.name}
                                        fill
                                        priority
                                        unoptimized={!isCloudinaryUrl(displayImages[selectedImage])}
                                        className="object-cover pointer-events-none"
                                    />
                                </motion.div>
                            </AnimatePresence>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-charcoal/40 bg-gray-200 uppercase tracking-widest text-sm font-medium">
                                No Image Available
                            </div>
                        )}
                    </div>
                    
                    {/* Pagination Dots (Mobile/Tablet) */}
                    {displayImages.length > 1 && (
                        <div className="flex justify-center gap-2 mt-4 md:hidden">
                            {displayImages.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setSelectedImage(idx)}
                                    className={`w-2 h-2 rounded-full transition-colors ${selectedImage === idx ? 'bg-charcoal' : 'bg-gray-300'}`}
                                    aria-label={`Go to image ${idx + 1}`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Thumbnail Strip (Desktop/Tablet) */}
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
                                        loading="lazy" 
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
                        <div className="flex items-center gap-3">
                            {PRODUCT.originalPrice && PRODUCT.originalPrice > PRODUCT.price && (
                                <p className="text-xl font-outfit font-medium text-gray-400 line-through">₹{Number(PRODUCT.originalPrice).toFixed(2)}</p>
                            )}
                            <p className="text-xl font-outfit font-bold text-charcoal">₹{Number(PRODUCT.price).toFixed(2)}</p>
                            {PRODUCT.originalPrice && PRODUCT.originalPrice > PRODUCT.price && (
                                <span className="ml-2 text-green-600 text-sm font-bold uppercase tracking-widest">
                                    SAVE {Math.round(((PRODUCT.originalPrice - PRODUCT.price) / PRODUCT.originalPrice) * 100)}%
                                </span>
                            )}
                        </div>
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

                    {/* Delivery & Services */}
                    <div className="pt-8 border-t border-gray-200 mt-8 space-y-4">
                        <h3 className="text-sm font-outfit font-bold uppercase tracking-widest text-charcoal">Delivery & Services</h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                placeholder="Enter Pincode"
                                maxLength={6}
                                value={deliveryPincode}
                                onChange={(e) => setDeliveryPincode(e.target.value.replace(/\D/g, ''))}
                                className="flex-1 px-4 py-3 border border-gray-300 font-outfit text-sm focus:outline-none focus:border-charcoal transition-colors bg-white text-black"
                            />
                            <button
                                onClick={handleCheckPincode}
                                disabled={isCheckingPincode || deliveryPincode.length !== 6}
                                className="px-6 py-3 bg-charcoal text-white font-outfit text-sm font-bold tracking-wider hover:bg-black transition-colors disabled:opacity-50"
                            >
                                {isCheckingPincode ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Check'}
                            </button>
                        </div>
                        {deliveryEstimate && (
                            <div className="text-sm font-outfit mt-3">
                                {deliveryEstimate.serviceable ? (
                                    <div className="space-y-1">
                                        <div className="flex items-center text-green-600 gap-1.5 font-medium">
                                            <span>✓ Delivery Available</span>
                                        </div>
                                        {deliveryEstimate.estimatedDeliveryDate && (
                                            <p className="text-charcoal/80">
                                                Estimated Delivery:<br/>
                                                <span className="font-semibold text-charcoal">
                                                    {(() => {
                                                        const end = new Date(deliveryEstimate.estimatedDeliveryDate);
                                                        let start = new Date(end);
                                                        start.setDate(start.getDate() - 2);
                                                        
                                                        // Ensure start date is never in the past (at least tomorrow)
                                                        const tomorrow = new Date();
                                                        tomorrow.setDate(tomorrow.getDate() + 1);
                                                        tomorrow.setHours(0, 0, 0, 0);
                                                        
                                                        if (start < tomorrow) {
                                                            start = tomorrow;
                                                        }
                                                        
                                                        // If the ETD is literally today or tomorrow, ensure start doesn't exceed end
                                                        if (start > end) {
                                                            start = new Date(end);
                                                        }
                                                        
                                                        const formatOpts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' };
                                                        
                                                        // If start and end are the same day, just show one date
                                                        if (start.toDateString() === end.toDateString()) {
                                                            return `${end.toLocaleDateString('en-IN', formatOpts)}`;
                                                        }
                                                        
                                                        return `${start.toLocaleDateString('en-IN', formatOpts)} - ${end.toLocaleDateString('en-IN', formatOpts)}`;
                                                    })()}
                                                </span>
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-red-500 font-medium">Delivery is currently unavailable for this pincode.</p>
                                )}
                            </div>
                        )}
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
                                <div 
                                    key={p.id}
                                    className="w-[calc(50%-8px)] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] flex-shrink-0 snap-start"
                                >
                                    <ProductCard product={p} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Customer Reviews Section */}
            <CustomerReviews />

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
