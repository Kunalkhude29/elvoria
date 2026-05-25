'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    quantity: number;
    stock: number;
}

interface CartContextType {
    cart: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, qty: number) => void;
    cartTotal: number;
    cartCount: number;
    isCartOpen: boolean;
    isLoaded: boolean;
    openCart: () => void;
    closeCart: () => void;
    clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Load from local storage
    useEffect(() => {
        const savedCart = localStorage.getItem('shweta_cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error('Failed to parse cart', e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to local storage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('shweta_cart', JSON.stringify(cart));
        }
    }, [cart, isLoaded]);

    // In-memory cache for stock verification to prevent redundant API calls
    const stockCache = React.useRef<{ [key: string]: { stock: number; timestamp: number } }>({});
    const CACHE_TTL = 60000; // 1 minute cache

    const getLiveStock = async (id: string) => {
        const now = Date.now();
        if (stockCache.current[id] && (now - stockCache.current[id].timestamp) < CACHE_TTL) {
            return stockCache.current[id].stock;
        }

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'}/api/products/${id}`);
        if (!res.ok) throw new Error('Product not found');
        const liveProduct = await res.json();
        const liveStock = liveProduct.stock ?? 0;

        stockCache.current[id] = { stock: liveStock, timestamp: now };
        return liveStock;
    };

    const addToCart = (newItem: CartItem) => {
        // 1. Optimistically update the UI instantly
        setCart(prev => {
            const existing = prev.find(item => item.id === newItem.id);
            if (existing) {
                let newQty = existing.quantity + newItem.quantity;
                // Use the provided stock as a preliminary limit
                if (newQty > newItem.stock) {
                    newQty = newItem.stock;
                }
                return prev.map(item =>
                    item.id === newItem.id ? { ...item, quantity: newQty, stock: newItem.stock } : item
                );
            }
            return [...prev, newItem];
        });

        // 2. Perform background verification silently to keep data in sync
        const verifyInBackground = async () => {
            try {
                const liveStock = await getLiveStock(newItem.id);
                
                setCart(prev => {
                    const itemInCart = prev.find(item => item.id === newItem.id);
                    if (!itemInCart) return prev;

                    // If we exceeded live stock, correct it silently or notify
                    if (itemInCart.quantity > liveStock) {
                        alert(`Correction: Only ${liveStock} items available for ${newItem.name}.`);
                        return prev.map(item =>
                            item.id === newItem.id ? { ...item, quantity: liveStock, stock: liveStock } : item
                        );
                    }

                    // Otherwise just update the cached stock value
                    return prev.map(item =>
                        item.id === newItem.id ? { ...item, stock: liveStock } : item
                    );
                });
            } catch (error) {
                console.error("Background stock check failed:", error);
            }
        };

        verifyInBackground();
    };

    const removeFromCart = (id: string) => {
        setCart(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = async (id: string, qty: number) => {
        if (qty < 1) return;

        const currentItem = cart.find(item => item.id === id);
        if (!currentItem) return;

        // 1. Optimistically update UI instantly
        setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: qty } : item));

        try {
            // 2. Only need to verify if we are increasing quantity
            if (qty > currentItem.quantity) {
                const liveStock = await getLiveStock(id);

                // 3. Confirm optimistic update was valid, otherwise rollback/correct
                if (qty > liveStock) {
                    alert(`Maximum live stock reached. Only ${liveStock} items available.`);
                    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: liveStock, stock: liveStock } : item));
                } else {
                    // Update local cached limit to latest live value behind the scenes
                    setCart(prev => prev.map(item => item.id === id ? { ...item, stock: liveStock } : item));
                }
            }
        } catch (error) {
            console.error("Failed to verify stock:", error);
            alert("Could not verify product stock. Reverting quantity.");
            // 4. Rollback on network failure
            setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: currentItem.quantity } : item));
        }
    };

    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    const openCart = () => setIsCartOpen(true);
    const closeCart = () => setIsCartOpen(false);
    const clearCart = () => setCart([]);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount, isCartOpen, isLoaded, openCart, closeCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
