'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    image: string;
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
        const savedCart = localStorage.getItem('elvoria_cart');
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
            localStorage.setItem('elvoria_cart', JSON.stringify(cart));
        }
    }, [cart, isLoaded]);

    const addToCart = async (newItem: CartItem) => {
        try {
            // Fetch live stock
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/${newItem.id}`);
            if (!res.ok) throw new Error('Product not found');
            const liveProduct = await res.json();
            const liveStock = liveProduct.stock ?? 0;

            setCart(prev => {
                const existing = prev.find(item => item.id === newItem.id);
                if (existing) {
                    let newQty = existing.quantity + newItem.quantity;

                    if (newQty > liveStock) {
                        alert(`Maximum stock of ${liveStock} reached for this item.`);
                        newQty = liveStock;
                    }

                    return prev.map(item =>
                        item.id === newItem.id ? { ...item, quantity: newQty, stock: liveStock } : item
                    );
                }

                if (newItem.quantity > liveStock) {
                    alert(`Cannot add ${newItem.quantity}. Only ${liveStock} items left in stock.`);
                    return [...prev, { ...newItem, quantity: liveStock, stock: liveStock }];
                }
                return [...prev, { ...newItem, stock: liveStock }];
            });
        } catch (error) {
            console.error("Failed to verify stock:", error);
            alert("Could not verify product stock. Please try again.");
        }
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
            // 2. Only need to fetch if we are increasing quantity, to save network calls
            if (qty > currentItem.quantity) {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/products/${id}`);
                if (!res.ok) throw new Error('Product not found');
                const liveProduct = await res.json();
                const stockLimit = liveProduct.stock ?? 0;

                // 3. Confirm optimistic update was valid, otherwise rollback/correct
                if (qty > stockLimit) {
                    alert(`Maximum live stock reached. Only ${stockLimit} items available.`);
                    setCart(prev => prev.map(item => item.id === id ? { ...item, quantity: stockLimit, stock: stockLimit } : item));
                } else {
                    // Update local cached limit to latest live value behind the scenes
                    setCart(prev => prev.map(item => item.id === id ? { ...item, stock: stockLimit } : item));
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
