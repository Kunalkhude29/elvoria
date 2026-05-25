'use client';

import { useCart, CartItem } from '../context/CartContext';
import { useCheckout } from '../context/CheckoutContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

// Dynamic Recommendations will be fetched from the database

export default function CartDrawer() {
    const router = useRouter();
    const { cart, removeFromCart, updateQuantity, cartTotal, cartCount, isCartOpen, closeCart, addToCart } = useCart();
    const { openCheckout } = useCheckout();
    const [updatingItems, setUpdatingItems] = useState<{ [key: string]: boolean }>({});
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [isLoadingRecs, setIsLoadingRecs] = useState(false);

    const handleUpdateQuantity = async (id: string, qty: number) => {
        setUpdatingItems(prev => ({ ...prev, [id]: true }));
        try {
            await updateQuantity(id, qty);
        } finally {
            setUpdatingItems(prev => ({ ...prev, [id]: false }));
        }
    };

    // Prevent scrolling when drawer is open
    useEffect(() => {
        if (isCartOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isCartOpen]);

    const lastFetchedCategory = useRef<string | null>(null);

    // Fetch dynamic recommendations based on cart contents
    useEffect(() => {
        const fetchRecommendations = async () => {
            if (cart.length === 0) {
                setRecommendations([]);
                lastFetchedCategory.current = null;
                return;
            }

            const lastItem = cart[cart.length - 1];
            const category = lastItem.category;

            // If we already fetched for this category, just filter out items that are now in cart
            if (category === lastFetchedCategory.current && recommendations.length > 0) {
                setRecommendations(prev => prev.filter((p: any) => !cart.some((item) => item.id === p.id)));
                return;
            }

            setIsLoadingRecs(true);
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
                const res = await fetch(`${apiUrl}/api/products?category=${encodeURIComponent(category)}`);
                
                if (res.ok) {
                    const products = await res.json();
                    // Filter out items already in cart and show only active/available ones
                    const filtered = products.filter((p: any) => 
                        !cart.some((item) => item.id === p.id) && 
                        p.stock > 0
                    ).slice(0, 4); // Show top 4 related products
                    
                    setRecommendations(filtered);
                    lastFetchedCategory.current = category;
                }
            } catch (error) {
                console.error("Failed to fetch recommendations:", error);
            } finally {
                setIsLoadingRecs(false);
            }
        };

        if (isCartOpen) {
            fetchRecommendations();
        }
    }, [cart, isCartOpen]);

    const handleQuickAdd = async (product: any) => {
        await addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            stock: product.stock || 10,
            quantity: 1
        });
    };

    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 bg-black/60 z-[60]"
                        onClick={closeCart}
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
                        className="fixed top-0 right-0 h-full w-[88%] max-w-[420px] sm:w-[400px] bg-white z-[70] shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white sticky top-0 z-10 shrink-0">
                            <h2 className="text-2xl font-outfit text-charcoal">Your Cart</h2>
                            <button
                                onClick={closeCart}
                                className="p-2 hover:bg-gray-50 rounded-full transition-colors group"
                            >
                                <X className="w-5 h-5 text-charcoal/40 group-hover:text-charcoal" />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto w-full no-scrollbar">
                            {cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full space-y-4 px-6 py-20">
                                    <ShoppingBagIcon className="w-12 h-12 text-gray-200" />
                                    <p className="text-charcoal/60 text-lg font-outfit">Your cart is empty.</p>
                                    <button onClick={closeCart} className="btn-secondary mt-4 w-full">Continue Shopping</button>
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    {/* Cart Items */}
                                    <div className="px-6 py-4 space-y-6">
                                        {cart.map((item: CartItem) => (
                                            <div key={item.id} className="flex gap-4 group">
                                                <div className="relative w-20 h-20 bg-gray-50 flex-shrink-0 rounded-lg overflow-hidden">
                                                    <Image src={item.image || '/images/hero.png'} alt={item.name} fill className="object-cover" unoptimized />
                                                </div>
                                                <div className="flex-1 flex flex-col justify-between">
                                                    <div className="flex justify-between items-start">
                                                        <Link href={`/product/${item.id}`} onClick={closeCart} className="text-sm font-outfit font-semibold font-bold text-charcoal hover:text-gold transition-colors line-clamp-1 mr-2">
                                                            {item.name}
                                                        </Link>
                                                        <p className="text-sm font-outfit font-bold text-gold whitespace-nowrap">₹{Number(item.price).toFixed(2)}</p>
                                                    </div>

                                                    <div className="flex justify-between items-end mt-2">
                                                        <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                                                            <button
                                                                onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                                className="p-1 px-2 transition-colors hover:bg-gray-50"
                                                            >
                                                                <Minus className="w-3 h-3 text-charcoal" />
                                                            </button>
                                                            <span className="w-6 text-center text-xs font-outfit font-semibold font-bold text-charcoal">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                                className={`p-1 px-2 transition-colors ${item.quantity >= (item.stock ?? 10) ? 'opacity-30 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                                                                disabled={item.quantity >= (item.stock ?? 10)}
                                                            >
                                                                <Plus className="w-3 h-3 text-charcoal" />
                                                            </button>
                                                        </div>
                                                        <button
                                                            onClick={() => removeFromCart(item.id)}
                                                            className="text-gray-400 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="h-px bg-gray-100 mx-6 my-2"></div>

                                    {/* Offer Section */}
                                    <div className="px-6 py-4">
                                        <div className="flex space-x-2">
                                            <input type="text" placeholder="Promo code" className="flex-1 border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:border-charcoal bg-transparent font-outfit font-semibold rounded-l-full pl-4" />
                                            <button className="bg-charcoal text-white px-4 py-2 text-sm uppercase tracking-wider hover:bg-gold transition-colors font-outfit font-semibold font-bold rounded-r-full pr-5">Apply</button>
                                        </div>
                                        <button className="text-xs text-charcoal/60 underline hover:text-charcoal mt-3 inline-block font-outfit">View All Offers</button>
                                    </div>

                                    <div className="h-2 bg-gray-50 w-full my-2"></div>

                                    {/* Recommended Products */}
                                    {recommendations.length > 0 && (
                                        <div className="px-6 py-4 pb-8">
                                            <h3 className="text-sm font-outfit font-bold uppercase tracking-widest text-charcoal mb-4">Recommended for You</h3>
                                            <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar">
                                                {isLoadingRecs ? (
                                                    <div className="flex space-x-4">
                                                        {[1, 2].map(i => (
                                                            <div key={i} className="w-32 h-56 bg-gray-50 animate-pulse" />
                                                        ))}
                                                    </div>
                                                ) : (
                                                    recommendations.map(product => (
                                                        <div key={product.id} className="w-32 flex-shrink-0">
                                                            <Link href={`/product/${product.id}`} onClick={closeCart} className="block group">
                                                                <div className="relative w-full h-40 bg-gray-50 mb-2 overflow-hidden rounded-lg">
                                                                    <Image src={product.image || '/images/hero.png'} alt={product.name} fill className="object-cover transition-transform duration-500 group-hover:scale-110" unoptimized />
                                                                </div>
                                                                <p className="text-xs text-charcoal line-clamp-1 mb-1 font-outfit group-hover:text-gold transition-colors">{product.name}</p>
                                                                <p className="text-xs font-outfit font-bold text-gold mb-2">₹{product.price}</p>
                                                            </Link>
                                                            <button onClick={() => handleQuickAdd(product)} className="w-full border border-charcoal text-charcoal text-xs py-1.5 hover:bg-charcoal hover:text-white transition-colors font-outfit font-semibold font-bold uppercase tracking-widest rounded-full">
                                                                Add
                                                            </button>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Sticky Bottom Summary */}
                        {cart.length > 0 && (
                            <div className="border-t border-gray-100 p-6 bg-white shrink-0">
                                <div className="space-y-3 mb-4 text-sm font-outfit font-semibold">
                                    <div className="flex justify-between text-charcoal/80">
                                        <span>Subtotal</span>
                                        <span className="font-outfit font-bold">₹{cartTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-charcoal text-base border-t border-gray-100 pt-3">
                                        <span className="font-bold">Estimated Total</span>
                                        <span className="font-outfit font-bold text-gold">₹{cartTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                                <p className="text-xs font-outfit text-charcoal/60 text-center mb-4">Shipping & taxes calculated at checkout.</p>
                                <button
                                    onClick={() => {
                                        closeCart();
                                        openCheckout();
                                    }}
                                    className="w-full btn-primary flex items-center justify-center space-x-2 py-4"
                                >
                                    <span>Proceed to Checkout</span>
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// Inline fallback icon to avoid circular dependency
function ShoppingBagIcon(props: any) {
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
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
    )
}
