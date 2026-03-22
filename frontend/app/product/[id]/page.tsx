'use client';

import { useState, use, useEffect } from 'react';
import Image from 'next/image';
import { Heart, ShoppingBag, Minus, Plus, Loader2, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../../components/Navbar';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const [PRODUCT, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [quantity, setQuantity] = useState(1);
    const [selectedImage, setSelectedImage] = useState(0);
    const { addToCart, cart, openCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const [isAdding, setIsAdding] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const pathname = usePathname();

    useEffect(() => {
        let isMounted = true;
        const fetchProduct = async () => {
            try {
                // Ensure we fetch immediately
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/${resolvedParams.id}`);
                if (res.ok) {
                    const data = await res.json();
                    if (isMounted) setProduct(data);
                }
            } catch (error) {
                console.error("Failed to fetch product details", error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchProduct();
        return () => { isMounted = false; };
    }, [resolvedParams.id]);

    // If product is not found, return an error message
    if (loading) {
        return (
            <div className="min-h-screen pt-24 pb-20 bg-ivory flex flex-col items-center justify-center">
                <Navbar />
                <div className="w-8 h-8 border-2 border-beige border-t-gold rounded-full animate-spin mb-4"></div>
                <p className="text-charcoal/60">Loading product...</p>
            </div>
        );
    }

    if (!PRODUCT) {
        return (
            <div className="min-h-screen pt-24 pb-20 bg-ivory flex flex-col items-center justify-center">
                <Navbar />
                <h1 className="text-2xl font-serif text-charcoal mb-4">Product Not Found</h1>
                <Link href="/" className="text-gold hover:underline">Return to Home</Link>
            </div>
        );
    }

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
                stock: PRODUCT.stock ?? 10, // Fallback safely to 10 if truly missing, handles 0 correctly
                quantity: quantity
            });
            openCart(); // Instantly open drawer on success
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

    const displayImages = PRODUCT.images && PRODUCT.images.length > 0 ? PRODUCT.images : (PRODUCT.image ? [PRODUCT.image] : []);

    const isOutOfStock = PRODUCT.stock === 0;

    return (
        <div className="min-h-screen pt-24 pb-20 bg-ivory">
            <Navbar />
            <div className="container grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">

                {/* Image Gallery */}
                <div className="space-y-4">
                    <div className="relative aspect-square bg-gray-100 overflow-hidden rounded-sm">
                        {displayImages.length > 0 ? (
                            <Image
                                src={displayImages[selectedImage]}
                                alt={PRODUCT.name}
                                fill
                                className="object-cover"
                                unoptimized
                            />
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
                                    <Image src={img} alt={`${PRODUCT.name} view ${idx + 1}`} fill className="object-cover" unoptimized />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product Info */}
                <div className="space-y-8">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-serif text-charcoal mb-2">{PRODUCT.name}</h1>
                        <p className="text-xl font-medium text-gold">${Number(PRODUCT.price).toFixed(2)}</p>
                    </div>

                    <div className="prose text-charcoal/80">
                        <p>{PRODUCT.description || 'Elegant and timeless, this beautiful piece is crafted with exquisite attention to detail. Perfect for everyday wear or special occasions.'}</p>
                    </div>

                    {/* Actions */}
                    <div className="space-y-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center space-x-4">
                            <span className="text-sm uppercase tracking-widest text-charcoal">Quantity</span>
                            <div className="flex items-center border border-gray-300">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 hover:bg-gray-100" disabled={isOutOfStock}><Minus className="w-4 h-4" /></button>
                                <span className="w-12 text-center text-charcoal font-medium">{isOutOfStock ? 0 : quantity}</span>
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
                    <div className="space-y-4 pt-8 text-sm text-charcoal/60">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>In stock and ready to ship</span>
                        </div>
                        <p>Free shipping on orders over $150.</p>
                    </div>
                </div>
            </div>

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
