'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface WishlistItem {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    stock?: number;
}

interface WishlistContextType {
    wishlist: WishlistItem[];
    addToWishlist: (item: WishlistItem, sourcePath?: string) => void;
    removeFromWishlist: (id: string) => void;
    isInWishlist: (id: string) => boolean;
    wishlistCount: number;
    lastAddedCategory: string;
    activeNavTab: string;
    setActiveNavTab: (tab: string) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
    const [lastAddedCategory, setLastAddedCategory] = useState<string>('women');
    const [activeNavTab, setActiveNavTabState] = useState<string>('/');
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from local storage
    useEffect(() => {
        const savedWishlist = localStorage.getItem('shweta_wishlist');
        const savedCategory = localStorage.getItem('shweta_wishlist_category');
        const savedNavTab = localStorage.getItem('shweta_active_nav_tab');
        if (savedCategory) {
            setLastAddedCategory(savedCategory);
        }
        if (savedNavTab) {
            setActiveNavTabState(savedNavTab);
        }
        if (savedWishlist) {
            try {
                setWishlist(JSON.parse(savedWishlist));
            } catch (e) {
                console.error('Failed to parse wishlist', e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to local storage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('shweta_wishlist', JSON.stringify(wishlist));
        }
    }, [wishlist, isLoaded]);

    const addToWishlist = (newItem: WishlistItem, sourcePath: string = '/women') => {
        setLastAddedCategory(sourcePath);
        localStorage.setItem('shweta_wishlist_category', sourcePath);
        setWishlist(prev => {
            if (!prev.find(item => item.id === newItem.id)) {
                return [...prev, newItem];
            }
            return prev;
        });
    };

    const setActiveNavTab = useCallback((tab: string) => {
        setActiveNavTabState(tab);
        localStorage.setItem('shweta_active_nav_tab', tab);
    }, []);

    const removeFromWishlist = (id: string) => {
        setWishlist(prev => prev.filter(item => item.id !== id));
    };

    const isInWishlist = (id: string) => {
        return wishlist.some(item => item.id === id);
    };

    const wishlistCount = wishlist.length;

    return (
        <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, wishlistCount, lastAddedCategory, activeNavTab, setActiveNavTab }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}
